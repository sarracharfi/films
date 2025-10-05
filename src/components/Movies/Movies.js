// src/components/Movies/Movies.js
import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonSpinner, IonToast
} from '@ionic/react';
import { playCircle, time, star, heart, heartOutline } from 'ionicons/icons';
import { ref, set, remove, onValue } from 'firebase/database';
import { db } from '../../firebase/config';
import './movies.css';

const Movies = ({ currentUser }) => {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🔹 Charger les films depuis Firebase (admin)
  useEffect(() => {
    const moviesRef = ref(db, "movies");
    const unsubscribe = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const moviesArray = Object.values(data).map(m => ({ id: m.id, ...m }));
        setMovies(moviesArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Charger favoris et playlist de l'utilisateur
  useEffect(() => {
    if (!currentUser?.uid) return;

    const favRef = ref(db, `users/${currentUser.uid}/favorites`);
    const playlistRef = ref(db, `users/${currentUser.uid}/playlist`);

    const unsubscribeFav = onValue(favRef, snapshot => {
      const data = snapshot.val() || {};
      const favArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      setFavorites(favArray);
    });

    const unsubscribePlaylist = onValue(playlistRef, snapshot => {
      const data = snapshot.val() || {};
      const plArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      setPlaylist(plArray);
    });

    return () => {
      unsubscribeFav();
      unsubscribePlaylist();
    };
  }, [currentUser]);

  // 🔹 Favoris
  const toggleFavorite = async (movie) => {
    if (!currentUser?.uid) {
      setToastMessage('Veuillez vous connecter pour gérer les favoris !');
      setShowToast(true);
      return;
    }
    const favRef = ref(db, `users/${currentUser.uid}/favorites/${movie.id}`);
    const isFav = favorites.some(f => f.id === movie.id);

    if (isFav) {
      await remove(favRef);
      setFavorites(favorites.filter(f => f.id !== movie.id));
      setToastMessage(`${movie.title} retiré des favoris !`);
    } else {
      await set(favRef, movie);
      setFavorites([...favorites, movie]);
      setToastMessage(`${movie.title} ajouté aux favoris !`);
    }
    setShowToast(true);
  };

  const isFavorite = (id) => favorites.some(f => f.id === id);

  // 🔹 Playlist
  const togglePlaylist = async (movie) => {
    if (!currentUser?.uid) {
      setToastMessage('Veuillez vous connecter pour gérer la playlist !');
      setShowToast(true);
      return;
    }
    const plRef = ref(db, `users/${currentUser.uid}/playlist/${movie.id}`);
    const inPlaylist = playlist.some(p => p.id === movie.id);

    if (inPlaylist) {
      await remove(plRef);
      setPlaylist(playlist.filter(p => p.id !== movie.id));
      setToastMessage(`${movie.title} retiré de la playlist !`);
    } else {
      await set(plRef, movie);
      setPlaylist([...playlist, movie]);
      setToastMessage(`${movie.title} ajouté à la playlist !`);
    }
    setShowToast(true);
  };

  const isInPlaylist = (id) => playlist.some(p => p.id === id);

  // 🔹 Helpers
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m.toString().padStart(2, '0')}m`;
  };
  const formatYear = (date) => date ? new Date(date).getFullYear() : 'N/A';

  const renderMovieCard = (movie) => {
    if (!movie?.id) return null;
    const fav = isFavorite(movie.id);
    const inPl = isInPlaylist(movie.id);

    return (
      <IonCol key={movie.id} size="6" size-md="4" size-lg="3">
        <IonCard className="movie-card">
          <div className="card-image-container">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/poster-placeholder.jpg'}
              alt={movie.title}
              className="movie-poster"
              onError={e => e.target.src = '/assets/images/poster-placeholder.jpg'}
            />
            <div className="card-overlay">
              <IonButton fill="clear" className="play-button">
                <IonIcon icon={playCircle} />
              </IonButton>
            </div>
            <IonButton 
              fill="clear" 
              className={`favorite-button ${fav ? 'favorited' : ''}`}
              onClick={() => toggleFavorite(movie)}
            >
              <IonIcon icon={fav ? heart : heartOutline} />
            </IonButton>
            <div className="rating-chip">
              <IonIcon icon={star} /> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </div>
          </div>
          <IonCardHeader>
            <IonCardTitle className="movie-title">{movie.title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="movie-info">
              <div className="movie-meta">
                <span className="duration"><IonIcon icon={time} /> {formatDuration(movie.runtime)}</span>
                <span className="year">{formatYear(movie.release_date)}</span>
              </div>
              <IonButton 
                expand="block" 
                color={inPl ? 'danger' : 'primary'}
                onClick={() => togglePlaylist(movie)}
              >
                {inPl ? 'Supprimer de la Playlist' : '+ Playlist'}
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </IonCol>
    );
  };

  if (loading) return (
    <IonPage>
      <IonContent className="movies-content">
        <div className="loading-container">
          <IonSpinner name="crescent" color="primary" />
          <p>Chargement des films...</p>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="movies-content">
        <div className="movies-container">
          <IonGrid>
            <IonRow>{movies.slice(0, 12).map(renderMovieCard)}</IonRow>
          </IonGrid>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          style={{ '--background': '#ff0000', '--color': '#fff', '--border-radius': '10px', marginBottom:'20px' }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Movies;
