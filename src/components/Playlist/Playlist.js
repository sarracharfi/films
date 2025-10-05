// src/components/Playlist/PlaylistApp.js
import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonHeader, 
  IonTitle, IonToolbar, IonToast, IonInput, IonButton, IonIcon, IonSpinner
} from '@ionic/react';
import { ref, onValue, remove, set } from 'firebase/database';  
import { db } from '../../firebase/config';
import { trash, playCircle, time, star } from 'ionicons/icons';
import './playlist.css';

const PlaylistApp = ({ currentUser }) => {
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [favInput, setFavInput] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Playlist
    const playlistRef = ref(db, `users/${currentUser.uid}/playlist`);
    const unsubscribePlaylist = onValue(playlistRef, snapshot => {
      const data = snapshot.val();
      setPlaylist(data ? Object.values(data) : []);
      setLoading(false);
    });

    // Favoris
    const favRef = ref(db, `users/${currentUser.uid}/favorites`);
    const unsubscribeFav = onValue(favRef, snapshot => {
      const data = snapshot.val();
      setFavorites(data ? Object.values(data) : []);
    });

    return () => {
      unsubscribePlaylist();
      unsubscribeFav();
    };
  }, [currentUser]);

  // Ajouter aux favoris
  const addFavorite = async () => {
    if (!favInput.trim()) return;
    const id = Date.now();
    const favItem = { id, title: favInput };
    try {
      await set(ref(db, `users/${currentUser.uid}/favorites/${id}`), favItem);
      setFavInput('');
      setToastMsg(`⭐ "${favItem.title}" ajouté aux favoris !`);
    } catch (err) {
      console.error(err);
      setToastMsg('❌ Erreur lors de l\'ajout aux favoris');
    }
  };

  // Supprimer film de la playlist
  const removeMovie = async (movieId) => {
    try {
      await remove(ref(db, `users/${currentUser.uid}/playlist/${movieId}`));
      setToastMsg('🎬 Film supprimé de la playlist !');
    } catch (err) {
      console.error(err);
      setToastMsg('❌ Erreur lors de la suppression');
    }
  };

  // Supprimer favoris
  const removeFavorite = async (id) => {
    try {
      await remove(ref(db, `users/${currentUser.uid}/favorites/${id}`));
      setToastMsg('⭐ Film retiré des favoris !');
    } catch (err) {
      console.error(err);
      setToastMsg('❌ Erreur lors de la suppression');
    }
  };

  // Ajouter film à la playlist
  const addToPlaylist = async (movie) => {
    if (!movie || !movie.id) return;
    try {
      await set(ref(db, `users/${currentUser.uid}/playlist/${movie.id}`), movie);
      setToastMsg(`🎬 "${movie.title}" ajouté à votre playlist !`);
    } catch (err) {
      console.error(err);
      setToastMsg('❌ Erreur lors de l\'ajout à la playlist');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2,'0')}m`;
  };

  const renderMovieCard = (movie, isFavorite=false) => (
    <IonCol key={movie.id} size="6" size-md="4" size-lg="3">
      <IonCard className="movie-card">
        <div className="card-image-container">
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/poster-placeholder.jpg'} 
            alt={movie.title || movie.name || movie.title}
            className="movie-poster"
          />
          <IonIcon 
            icon={trash} 
            className="delete-icon"
            onClick={() => isFavorite ? removeFavorite(movie.id) : removeMovie(movie.id)}
          />
        </div>

        <IonCardHeader>
          <IonCardTitle className="movie-title">{movie.title || movie.name || movie.title}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          {!isFavorite && (
            <div className="movie-meta">
              <span className="duration">
                <IonIcon icon={time} />
                {movie.runtime ? formatDuration(movie.runtime) : 
                 movie.episode_run_time ? `${movie.episode_run_time[0]}m` : 'N/A'}
              </span>
              <span className="rating">
                <IonIcon icon={star} />
                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
              </span>
              <IonButton size="small" color="primary" onClick={() => addToPlaylist(movie)}>
                + Playlist
              </IonButton>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </IonCol>
  );

  if (!currentUser) {
    return (
      <IonPage>
        <IonContent className="playlist-content">
          <div className="not-connected">
            <IonIcon icon={playCircle} className="not-connected-icon" />
            <h2>Veuillez vous connecter pour voir votre playlist.</h2>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="playlist-content">
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Chargement de votre playlist...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>🎵 Ma Playlist & Favoris</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="playlist-content">
        <div className="playlist-container">
          <section className="playlist-section">
            <h2>🎬 Ma Playlist ({playlist.length})</h2>
            {playlist.length === 0 ? <p>Votre playlist est vide.</p> : (
              <IonGrid>
                <IonRow>
                  {playlist.map(movie => renderMovieCard(movie))}
                </IonRow>
              </IonGrid>
            )}
          </section>

          <section className="favorites-section">
            <h2>⭐ Mes Favoris ({favorites.length})</h2>

            <IonInput
              placeholder="Ajouter un favori..."
              value={favInput}
              onIonInput={e => setFavInput(e.detail.value)}
              className="fav-input"
            />
            <IonButton onClick={addFavorite} className="fav-add-btn">Ajouter</IonButton>

            {favorites.length === 0 ? <p>Aucun favori pour le moment.</p> : (
              <IonGrid>
                <IonRow>
                  {favorites.map(fav => renderMovieCard(fav, true))}
                </IonRow>
              </IonGrid>
            )}
          </section>
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default PlaylistApp;
