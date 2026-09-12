import React, { useState, useEffect, useMemo } from 'react';
import { MeshBackground } from './components/MeshBackground';
import { Navbar } from './components/Navbar';
import { ScrapbookHero } from './components/ScrapbookHero';
import { VinylPlayer } from './components/VinylPlayer';
import { CategoryFilter } from './components/CategoryFilter';
import { PolaroidCard } from './components/PolaroidCard';
import { PhotoLightbox } from './components/PhotoLightbox';
import { GuestbookSection } from './components/GuestbookSection';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminUploadModal } from './components/AdminUploadModal';
import { AdminPlaylistModal } from './components/AdminPlaylistModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { DeployGuideModal } from './components/DeployGuideModal';

import { INITIAL_PHOTOS, INITIAL_GUESTBOOK } from './data/initialData';
import {
  subscribeToPhotos,
  subscribeToGuestbook,
  subscribeToPlaylist,
  DEFAULT_INITIAL_PLAYLIST,
  likePhotoItem,
  deletePhotoItem,
  getLocalPhotos,
} from './services/firebaseService';
import { musicController } from './services/unifiedMusicController';
import type { PhotoItem, GuestbookEntry, PhotoCategory, MusicTrack } from './types';

export const App: React.FC = () => {
  // State for Photos, Guestbook, Playlist
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(INITIAL_GUESTBOOK);
  const [playlist, setPlaylist] = useState<MusicTrack[]>(DEFAULT_INITIAL_PLAYLIST);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(DEFAULT_INITIAL_PLAYLIST[0]);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('all');

  // Admin access state (default is Guest)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('baohue_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  // Modal dialog states
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Realtime subscriptions
  useEffect(() => {
    const unsubPhotos = subscribeToPhotos((list) => {
      if (list && list.length > 0) setPhotos(list);
    }, INITIAL_PHOTOS);

    const unsubGuestbook = subscribeToGuestbook((list) => {
      if (list && list.length > 0) setGuestbook(list);
    }, INITIAL_GUESTBOOK);

    const unsubPlaylist = subscribeToPlaylist((tracks) => {
      if (tracks && tracks.length > 0) {
        setPlaylist(tracks);
        // If currentTrack is null, default to first track
        setCurrentTrack((prev) => {
          if (!prev) return tracks[0];
          const exists = tracks.find((t) => t.id === prev.id);
          return exists || tracks[0];
        });
      }
    }, DEFAULT_INITIAL_PLAYLIST);

    // Subscribe to unified music controller state
    const unsubAudio = musicController.subscribeState((playing, track) => {
      setIsMusicPlaying(playing);
      if (track) setCurrentTrack(track);
    });

    return () => {
      unsubPhotos();
      unsubGuestbook();
      unsubPlaylist();
      unsubAudio();
    };
  }, []);

  // Music playback handlers
  const handleToggleMusic = () => {
    const trackToPlay = currentTrack || playlist[0];
    musicController.togglePlay(trackToPlay);
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    musicController.playTrack(track);
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    handleSelectTrack(nextTrack);
  };

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[prevIndex];
    handleSelectTrack(prevTrack);
  };

  // Admin auth handlers
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem('baohue_is_admin', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('baohue_is_admin');
    } catch (e) {
      console.error(e);
    }
  };

  // Photo handlers
  const handleLikePhoto = (photoId: string) => {
    likePhotoItem(photoId);
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null));
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhotoItem(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (lightboxPhoto?.id === photoId) {
      setLightboxPhoto(null);
    }
  };

  const handlePhotoAdded = (newPhoto: PhotoItem) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  // Guestbook handler
  const handleEntryAdded = (newEntry: GuestbookEntry) => {
    setGuestbook((prev) => [newEntry, ...prev]);
  };

  const handleDeleteGuestbookEntry = (entryId: string) => {
    setGuestbook((prev) => prev.filter((item) => item.id !== entryId));
  };

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return photos;
    return photos.filter((p) => p.category === selectedCategory);
  }, [photos, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: photos.length,
      trip: photos.filter((p) => p.category === 'trip').length,
      cafe: photos.filter((p) => p.category === 'cafe').length,
      daily: photos.filter((p) => p.category === 'daily').length,
      film35mm: photos.filter((p) => p.category === 'film35mm').length,
    };
  }, [photos]);

  // Total likes
  const totalLikes = useMemo(() => {
    return photos.reduce((acc, p) => acc + (p.likes || 0), 0);
  }, [photos]);

  // Lightbox navigation
  const handleNextPhoto = () => {
    if (!lightboxPhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % filteredPhotos.length;
      setLightboxPhoto(filteredPhotos[nextIndex]);
    }
  };

  const handlePrevPhoto = () => {
    if (!lightboxPhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
      setLightboxPhoto(filteredPhotos[prevIndex]);
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-[#FFB7C5]/40 selection:text-[#004D6D] font-quicksand">
      {/* 1. Tone màu nền gió lụa (Ocean & Sakura Mesh Gradient) */}
      <MeshBackground />

      {/* 2. Top Navigation Bar */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        totalPhotos={photos.length}
        totalWishes={guestbook.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scrapbook Hero Header */}
        <ScrapbookHero totalPhotos={photos.length} totalLikes={totalLikes} />

        {/* Vintage Vinyl Record Player with YouTube & Drive Audio & Synth */}
        <VinylPlayer
          playlist={playlist}
          currentTrack={currentTrack}
          isPlaying={isMusicPlaying}
          isAdmin={isAdmin}
          onTogglePlay={handleToggleMusic}
          onSelectTrack={handleSelectTrack}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
        />

        {/* Category Filters */}
        <div id="album-section" className="pt-6">
          <CategoryFilter
            currentCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />

          {/* Photo Grid of Polaroids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pt-4 pb-12">
            {filteredPhotos.map((photo) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                isAdmin={isAdmin}
                onOpenLightbox={(p) => setLightboxPhoto(p)}
                onLikePhoto={handleLikePhoto}
                onDeletePhoto={handleDeletePhoto}
              />
            ))}
          </div>
        </div>

        {/* Guestbook Section ("Sổ lưu bút") */}
        <GuestbookSection
          entries={guestbook}
          isAdmin={isAdmin}
          onEntryAdded={handleEntryAdded}
          onDeleteEntry={handleDeleteGuestbookEntry}
        />
      </main>

      {/* Footer */}
      <Footer
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      {/* Modals */}
      <PhotoLightbox
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onLikePhoto={handleLikePhoto}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPhotoAdded={handlePhotoAdded}
      />

      <AdminPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        playlist={playlist}
        currentTrackId={currentTrack?.id}
        isPlaying={isMusicPlaying}
        onPlayTrack={handleSelectTrack}
        onTogglePlay={handleToggleMusic}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
        onConfigSaved={() => {
          setPhotos(getLocalPhotos(INITIAL_PHOTOS));
        }}
      />

      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
};
