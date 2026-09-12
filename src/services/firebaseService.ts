import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  increment,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';
import type { PhotoItem, StoryItem, GuestbookEntry, FirebaseConfigData, MusicTrack } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'baohue_firebase_config';

/**
 * Default empty/template config.
 * Users can either paste values directly here or use the in-app "Cấu hình Firebase" modal.
 */
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigData = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function getSavedFirebaseConfig(): FirebaseConfigData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved Firebase config from localStorage', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfigToStorage(config: FirebaseConfigData): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  // Reload if necessary or re-init
  initFirebase();
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initFirebase(): { app: FirebaseApp | null; db: Firestore | null; storage: FirebaseStorage | null } {
  const config = getSavedFirebaseConfig();
  
  if (config.apiKey && config.projectId && config.storageBucket) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
      storage = getStorage(app);
      return { app, db, storage };
    } catch (err) {
      console.warn('Firebase initialization error, fallback to local store:', err);
    }
  }
  return { app: null, db: null, storage: null };
}

// Initial attempt to start
initFirebase();

export function isFirebaseConnected(): boolean {
  const config = getSavedFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && db);
}

/* =========================================================================
   PHOTO SERVICE (Firebase Firestore + Storage with Local Fallback)
   ========================================================================= */

const LOCAL_PHOTOS_KEY = 'baohue_photos_data';

export async function uploadPhotoFileToStorage(file: File): Promise<string> {
  if (storage && isFirebaseConnected()) {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `photos/${timestamp}_${safeName}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (e) {
      console.error('Firebase storage upload failed, falling back to Base64:', e);
    }
  }
  
  // Fallback: convert file to Base64 Data URL for local persistence
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function savePhotoMetadata(photo: Omit<PhotoItem, 'id'>): Promise<PhotoItem> {
  const newId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const fullPhoto: PhotoItem = {
    ...photo,
    id: newId,
    createdAt: Date.now(),
  };

  if (db && isFirebaseConnected()) {
    try {
      const docRef = await addDoc(collection(db, 'photos'), fullPhoto);
      return { ...fullPhoto, id: docRef.id };
    } catch (e) {
      console.warn('Firestore addDoc failed, storing locally:', e);
    }
  }

  // Local fallback
  const existing = getLocalPhotos();
  const updated = [fullPhoto, ...existing];
  saveLocalPhotos(updated);
  return fullPhoto;
}

export function subscribeToPhotos(
  callback: (photos: PhotoItem[]) => void,
  initialFallback: PhotoItem[]
): Unsubscribe | (() => void) {
  if (db && isFirebaseConnected()) {
    try {
      const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remotePhotos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PhotoItem[];
          callback(remotePhotos);
        } else {
          // If collection empty in firestore, return initial seed
          callback(initialFallback);
        }
      }, (error) => {
        console.warn('Firestore photo snapshot error, using local:', error);
        callback(getLocalPhotos(initialFallback));
      });
      return unsub;
    } catch (e) {
      console.warn('Error setting up Firebase photo listener:', e);
    }
  }

  // Local fallback
  const local = getLocalPhotos(initialFallback);
  callback(local);
  return () => {};
}

export async function likePhotoItem(photoId: string): Promise<void> {
  if (db && isFirebaseConnected() && !photoId.startsWith('p_')) {
    try {
      const photoDoc = doc(db, 'photos', photoId);
      await updateDoc(photoDoc, {
        likes: increment(1),
      });
      return;
    } catch (e) {
      console.warn('Firestore like update failed:', e);
    }
  }

  // Update in local
  const current = getLocalPhotos();
  const updated = current.map((p) => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  saveLocalPhotos(updated);
}

export async function deletePhotoItem(photoId: string): Promise<void> {
  if (db && isFirebaseConnected() && !photoId.startsWith('p_')) {
    try {
      await deleteDoc(doc(db, 'photos', photoId));
      return;
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  }
  const current = getLocalPhotos();
  const updated = current.filter((p) => p.id !== photoId);
  saveLocalPhotos(updated);
}

export function getLocalPhotos(fallback: PhotoItem[] = []): PhotoItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PHOTOS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalPhotos(photos: PhotoItem[]): void {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
  } catch (e) {
    console.error(e);
  }
}

/* =========================================================================
   GUESTBOOK SERVICE (Sổ lưu bút)
   ========================================================================= */

const LOCAL_GUESTBOOK_KEY = 'baohue_guestbook_data';

export async function addGuestbookEntry(
  entry: Omit<GuestbookEntry, 'id' | 'createdAt'>
): Promise<GuestbookEntry> {
  const newEntry: GuestbookEntry = {
    ...entry,
    id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
    likes: 0,
  };

  if (db && isFirebaseConnected()) {
    try {
      const docRef = await addDoc(collection(db, 'guestbook'), newEntry);
      return { ...newEntry, id: docRef.id };
    } catch (e) {
      console.warn('Firestore guestbook add failed:', e);
    }
  }

  const existing = getLocalGuestbook();
  const updated = [newEntry, ...existing];
  saveLocalGuestbook(updated);
  return newEntry;
}

export function subscribeToGuestbook(
  callback: (entries: GuestbookEntry[]) => void,
  initialFallback: GuestbookEntry[]
): Unsubscribe | (() => void) {
  if (db && isFirebaseConnected()) {
    try {
      const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as GuestbookEntry[];
          callback(list);
        } else {
          callback(initialFallback);
        }
      }, (err) => {
        console.warn('Firestore guestbook error:', err);
        callback(getLocalGuestbook(initialFallback));
      });
      return unsub;
    } catch (e) {
      console.warn('Guestbook listener error:', e);
    }
  }

  const local = getLocalGuestbook(initialFallback);
  callback(local);
  return () => {};
}

export async function deleteGuestbookEntry(entryId: string): Promise<void> {
  if (db && isFirebaseConnected() && !entryId.startsWith('g_')) {
    try {
      await deleteDoc(doc(db, 'guestbook', entryId));
    } catch (e) {
      console.warn('Firestore guestbook delete failed:', e);
    }
  }

  const current = getLocalGuestbook();
  const updated = current.filter((item) => item.id !== entryId);
  saveLocalGuestbook(updated);
}

export function getLocalGuestbook(fallback: GuestbookEntry[] = []): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalGuestbook(list: GuestbookEntry[]): void {
  try {
    localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

/* =========================================================================
   STORIES SERVICE (Mẩu chuyện nhỏ)
   ========================================================================= */

const LOCAL_STORIES_KEY = 'baohue_stories_data';

export async function addStoryEntry(
  story: Omit<StoryItem, 'id' | 'createdAt'>
): Promise<StoryItem> {
  const newStory: StoryItem = {
    ...story,
    id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };

  if (db && isFirebaseConnected()) {
    try {
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      return { ...newStory, id: docRef.id };
    } catch (e) {
      console.warn('Firestore stories add failed:', e);
    }
  }

  const existing = getLocalStories();
  const updated = [newStory, ...existing];
  saveLocalStories(updated);
  return newStory;
}

export function subscribeToStories(
  callback: (stories: StoryItem[]) => void,
  initialFallback: StoryItem[]
): Unsubscribe | (() => void) {
  if (db && isFirebaseConnected()) {
    try {
      const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as StoryItem[];
          callback(list);
        } else {
          callback(initialFallback);
        }
      }, (err) => {
        console.warn('Firestore stories error:', err);
        callback(getLocalStories(initialFallback));
      });
      return unsub;
    } catch (e) {
      console.warn('Stories listener error:', e);
    }
  }

  const local = getLocalStories(initialFallback);
  callback(local);
  return () => {};
}

export function getLocalStories(fallback: StoryItem[] = []): StoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalStories(list: StoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

/* =========================================================================
   PLAYLIST SERVICE (Đĩa than Vinyl Music: YouTube, Google Drive, MP3, Synth)
   ========================================================================= */

const LOCAL_PLAYLIST_KEY = 'baohue_playlist_data';

export const DEFAULT_INITIAL_PLAYLIST: MusicTrack[] = [
  {
    id: 'track-synth-1',
    title: 'Kỷ Niệm Bên Tách Cà Phê',
    artist: 'Acoustic Guitar & Warm Rhodes',
    url: 'synth:acoustic-1',
    source: 'synth',
    createdAt: 1700000000000,
  },
  {
    id: 'track-synth-2',
    title: 'Gió Qua Đồi Trà & Hoa Đào',
    artist: 'Sakura Breeze & Ocean Lofi',
    url: 'synth:acoustic-2',
    source: 'synth',
    createdAt: 1700000001000,
  },
  {
    id: 'track-synth-3',
    title: 'Bản Tình Ca Số 1 (Bảo & Huệ)',
    artist: 'Fingerstyle Acoustic Melody',
    url: 'synth:acoustic-3',
    source: 'synth',
    createdAt: 1700000002000,
  },
  {
    id: 'track-yt-1',
    title: 'Nàng Thơ (Acoustic Chill)',
    artist: 'Hoàng Dũng',
    url: 'https://www.youtube.com/watch?v=kYbgk93a1rI',
    source: 'youtube',
    youtubeId: 'kYbgk93a1rI',
    createdAt: 1700000003000,
  },
];

export async function addMusicTrackToFirebase(
  track: Omit<MusicTrack, 'id' | 'createdAt'>
): Promise<MusicTrack> {
  const newTrack: MusicTrack = {
    ...track,
    id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };

  if (db && isFirebaseConnected()) {
    try {
      const docRef = await addDoc(collection(db, 'playlist'), newTrack);
      return { ...newTrack, id: docRef.id };
    } catch (e) {
      console.warn('Firestore playlist add failed:', e);
    }
  }

  const existing = getLocalPlaylist(DEFAULT_INITIAL_PLAYLIST);
  const updated = [...existing, newTrack];
  saveLocalPlaylist(updated);
  return newTrack;
}

export async function deleteMusicTrackFromFirebase(trackId: string): Promise<void> {
  if (db && isFirebaseConnected() && !trackId.startsWith('track_')) {
    try {
      await deleteDoc(doc(db, 'playlist', trackId));
    } catch (e) {
      console.warn('Firestore playlist delete failed:', e);
    }
  }

  const current = getLocalPlaylist(DEFAULT_INITIAL_PLAYLIST);
  const updated = current.filter((t) => t.id !== trackId);
  saveLocalPlaylist(updated);
}

export function subscribeToPlaylist(
  callback: (tracks: MusicTrack[]) => void,
  initialFallback: MusicTrack[] = DEFAULT_INITIAL_PLAYLIST
): Unsubscribe | (() => void) {
  if (db && isFirebaseConnected()) {
    try {
      const q = query(collection(db, 'playlist'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as MusicTrack[];
            callback(list);
          } else {
            callback(initialFallback);
          }
        },
        (err) => {
          console.warn('Firestore playlist error:', err);
          callback(getLocalPlaylist(initialFallback));
        }
      );
      return unsub;
    } catch (e) {
      console.warn('Playlist listener error:', e);
    }
  }

  const local = getLocalPlaylist(initialFallback);
  callback(local);
  return () => {};
}

export function getLocalPlaylist(fallback: MusicTrack[] = DEFAULT_INITIAL_PLAYLIST): MusicTrack[] {
  try {
    const raw = localStorage.getItem(LOCAL_PLAYLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalPlaylist(list: MusicTrack[]): void {
  try {
    localStorage.setItem(LOCAL_PLAYLIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

