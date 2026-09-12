export type PhotoCategory = 'all' | 'trip' | 'cafe' | 'daily' | 'film35mm';

export interface PhotoItem {
  id: string;
  title: string;
  url: string;
  category: 'trip' | 'cafe' | 'daily' | 'film35mm';
  date: string;
  location: string;
  camera?: string;
  note?: string;
  likes: number;
  rotation?: number; // for natural polaroid tilt: -3 to 3 degrees
  tapeType?: 'mint' | 'sakura' | 'ocean';
  createdAt?: number;
}

export interface StoryItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  createdAt?: number;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  relationship: string;
  message: string;
  date: string;
  createdAt: number;
  sticker?: string;
  likes?: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  source: 'youtube' | 'drive' | 'mp3' | 'synth';
  youtubeId?: string;
  createdAt?: number;
}

export interface FirebaseConfigData {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
