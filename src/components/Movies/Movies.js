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

  useEffect(() => {
    const adminMoviesRef = ref(db, "movies");
    const userMoviesRef = ref(db, "myMovies");

    const mergeMovies = (adminData, userData) => {
      const adminArray = adminData ? Object.values(adminData) : [];
      const userArray = userData ? Object.values(userData) : [];
      const ids = new Set();
      const merged = [];

      [...adminArray, ...userArray].forEach(movie => {
        if (!ids.has(movie.id)) {
          ids.add(movie.id);
          merged.push(movie);
        }
      });

      return merged;
    };

    const unsubscribeAdmin = onValue(adminMoviesRef, (snapshot) => {
      const adminData = snapshot.val();
      onValue(userMoviesRef, (snapUser) => {
        const userData = snapUser.val();
        const merged = mergeMovies(adminData, userData);
        setMovies(merged);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAdmin();
    };
  }, []);

  // 🔹 Favoris et Playlist
  useEffect(() => {
    if (!currentUser?.uid) return;

    const favRef = ref(db, `users/${currentUser.uid}/favorites`);
    const playlistRef = ref(db, `users/${currentUser.uid}/playlist`);

    const unsubscribeFav = onValue(favRef, snapshot => {
      const data = snapshot.val() || {};
      setFavorites(Object.keys(data).map(k => ({ id: k, ...data[k] })));
    });

    const unsubscribePlaylist = onValue(playlistRef, snapshot => {
      const data = snapshot.val() || {};
      setPlaylist(Object.keys(data).map(k => ({ id: k, ...data[k] })));
    });

    return () => {
      unsubscribeFav();
      unsubscribePlaylist();
    };
  }, [currentUser]);

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

  const isFavorite = (id) => favorites.some(f => f.id === id);
  const isInPlaylist = (id) => playlist.some(p => p.id === id);

  const formatYear = (date) => date ? new Date(date).getFullYear() : 'N/A';

  const renderMovieCard = (movie) => (
    <IonCol key={movie.id} size="6" size-md="4" size-lg="3">
      <IonCard className="movie-card">
        <div className="card-image-container">
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/poster-placeholder.jpg'}
            alt={movie.title}
            className="movie-poster"
          />
          <div className="card-overlay">
            <IonButton fill="clear" className="play-button">
              <IonIcon icon={playCircle} />
            </IonButton>
          </div>
          <IonButton 
            fill="clear" 
            className={`favorite-button ${isFavorite(movie.id) ? 'favorited' : ''}`}
            onClick={() => toggleFavorite(movie)}
          >
            <IonIcon icon={isFavorite(movie.id) ? heart : heartOutline} />
          </IonButton>
          <div className="rating-chip">
            <IonIcon icon={star} /> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </div>
        </div>
        <IonCardHeader>
          <IonCardTitle className="movie-title">{movie.title}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="movie-meta">
            <span className="year">{formatYear(movie.release_date)}</span>
          </div>
          <IonButton 
            expand="block" 
            color={isInPlaylist(movie.id) ? 'danger' : 'primary'}
            onClick={() => togglePlaylist(movie)}
          >
            {isInPlaylist(movie.id) ? 'Supprimer de la Playlist' : '+ Playlist'}
          </IonButton>
        </IonCardContent>
      </IonCard>
    </IonCol>
  );

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
        <IonGrid>
          <IonRow>{movies.map(renderMovieCard)}</IonRow>
        </IonGrid>

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
