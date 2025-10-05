import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonButton, 
  IonIcon, IonSpinner, IonChip
} from '@ionic/react';
import { heart, time, star, close } from 'ionicons/icons';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../../firebase/config';
import './Favoris.css';

const Favoris = ({ currentUser }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      
      const favoritesRef = ref(db, `users/${currentUser.uid}/favorites`);
      const favoritesUnsubscribe = onValue(favoritesRef, snapshot => {
        const data = snapshot.val() || {};
        const favoritesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setFavorites(favoritesArray);
        setLoading(false);
      });

      return () => favoritesUnsubscribe();
    }
  }, [currentUser]);

  const removeFromFavorites = (movieId) => {
    if (!currentUser) return;
    
    console.log('Suppression du film:', movieId);
    
    remove(ref(db, `users/${currentUser.uid}/favorites/${movieId}`))
      .then(() => {
        console.log('Film supprimé avec succès');
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression:', error);
      });
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}m`;
  };

  const renderMovieCard = (movie) => (
    <IonCol key={movie.id} size="6" size-md="4" size-lg="3">
      <IonCard className="movie-card">
        <div className="card-image-container">
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/poster-placeholder.jpg'} 
            alt={movie.title || movie.name}
            className="movie-poster"
          />
          
          {/* Petite icône de suppression dans le coin */}
          <div 
            className="remove-icon"
            onClick={() => removeFromFavorites(movie.id)}
            aria-label="Supprimer des favoris"
          >
            <IonIcon icon={close} />
          </div>

          {movie.vote_average && (
            <div className="rating-badge">
              <IonIcon icon={star} />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <IonCardHeader>
          <IonCardTitle className="movie-title">{movie.title || movie.name}</IonCardTitle>
          <IonChip color={movie.type === 'movie' ? 'primary' : 'secondary'}>
            {movie.type === 'movie' ? '🎬 Film' : '📺 Série'}
          </IonChip>
        </IonCardHeader>

        <IonCardContent>
          <div className="movie-info">
            <div className="movie-meta">
              <span className="duration">
                <IonIcon icon={time} />
                {movie.runtime ? formatDuration(movie.runtime) : 
                 movie.episode_run_time ? `${movie.episode_run_time[0]}m` : 'N/A'}
              </span>
              {movie.release_date && (
                <span className="year">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </IonCol>
  );

  if (loading) {
    return (
      <IonPage>
        <IonContent className="favoris-content">
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Chargement de vos favoris...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="favoris-content">
        <div className="favoris-container">
          <div className="header-section">
            <h1>❤️ Mes Favoris</h1>
            <p>Vos films et séries préférés</p>
            <div className="favorites-stats">
              <IonChip color="danger">
                {favorites.length} {favorites.length === 1 ? 'favori' : 'favoris'}
              </IonChip>
            </div>
          </div>

          <section className="favorites-section">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={heart} className="empty-icon" />
                <h3>Aucun favori pour le moment</h3>
                <p>Ajoutez des films à vos favoris depuis l'onglet Films !</p>
              </div>
            ) : (
              <IonGrid>
                <IonRow>
                  {favorites.map(movie => renderMovieCard(movie))}
                </IonRow>
              </IonGrid>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Favoris;