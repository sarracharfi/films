// Matching.jsx
import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonSpinner,
  IonBadge, IonIcon
} from '@ionic/react';
import { star, people, heart, film, sad } from 'ionicons/icons';
import { db } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import './Matching.css';

const Matching = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération des utilisateurs
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, snapshot => {
      const data = snapshot.val() || {};
      const allUsers = Object.keys(data).map(uid => ({
        uid,
        ...data[uid]
      }));
      setUsers(allUsers);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Récupération des favoris de l'utilisateur
  useEffect(() => {
    if (!currentUser) {
      setMyFavorites([]);
      return;
    }

    const favRef = ref(db, `users/${currentUser.uid}/favorites`);
    const unsubscribeFav = onValue(favRef, snapshot => {
      const data = snapshot.val() || {};
      setMyFavorites(Object.values(data));
      setLoading(false);
    });

    return () => unsubscribeFav();
  }, [currentUser]);

  // Calcul des matchs
  useEffect(() => {
    if (!currentUser || users.length === 0 || myFavorites.length === 0) return;

    const matchesList = users
      .filter(user => user.uid !== currentUser.uid)
      .map(user => {
        const otherFavorites = user.favorites ? Object.values(user.favorites) : [];
        const common = myFavorites.filter(fav =>
          otherFavorites.some(ofav => ofav.id === fav.id)
        );
        const matchPercentage = myFavorites.length > 0 ? 
          Math.round((common.length / myFavorites.length) * 100) : 0;

        return { 
          ...user, 
          matchPercentage, 
          commonFavorites: common,
          totalFavorites: otherFavorites.length
        };
      })
      .filter(user => user.commonFavorites.length > 0) // au moins 1 film commun
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setMatches(matchesList);
  }, [users, myFavorites, currentUser]);

  // Obtenir les initiales
  const getInitials = (nom = "", prenom = "") => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  if (!currentUser) {
    return (
      <IonPage>
        <IonContent className="matching-content">
          <div className="no-matches">
            <IonIcon icon={people} className="no-matches-icon" />
            <h2 className="no-matches-title">Connexion requise</h2>
            <p className="no-matches-text">
              Vous devez être connecté pour voir vos correspondances.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="matching-content">
          <div className="loading-container">
            <IonSpinner name="crescent" color="warning" />
            <p>Recherche de vos âmes sœurs cinéphiles...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="matching-content">
        <div className="matching-header">
          <h1 className="matching-title">🎬 Utilisateurs similaires</h1>
          <p className="matching-subtitle">
            Découvrez des cinéphiles qui partagent vos goûts
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="no-matches">
            <IonIcon icon={sad} className="no-matches-icon" />
            <h2 className="no-matches-title">Aucune correspondance</h2>
            <p className="no-matches-text">
              Aucun utilisateur ne partage encore vos films favoris.<br />
              Ajoutez des films pour trouver vos matchs !
            </p>
          </div>
        ) : (
          <IonGrid className="match-grid">
            <IonRow>
              {matches.map((user, index) => (
                <IonCol key={user.uid} size="12" size-md="6" size-lg="4">
                  <IonCard className="match-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <IonCardHeader className="match-card-header">
                      <IonCardTitle className="match-card-title">
                        <div className="match-card-title-content">
                          <div className="user-avatar">
                            <span className="user-initials">
                              {getInitials(user.nom, user.prenom)}
                            </span>
                          </div>
                          <div>
                            {user.prenom} {user.nom}
                          </div>
                        </div>
                        <IonBadge className={`match-percentage ${user.matchPercentage > 75 ? 'strong-match' : ''}`}>
                          {user.matchPercentage}%
                        </IonBadge>
                      </IonCardTitle>
                    </IonCardHeader>
                    
                    <IonCardContent className="match-card-content">
                      <div className="match-stats">
                        <div className="stat-item">
                          <span className="stat-value">{user.commonFavorites.length}</span>
                          <span className="stat-label">Favoris communs</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{user.totalFavorites}</span>
                          <span className="stat-label">Favoris total</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{user.matchPercentage}%</span>
                          <span className="stat-label">Compatibilité</span>
                        </div>
                      </div>

                      {user.commonFavorites.length > 0 && (
                        <div className="common-favorites">
                          <h3 className="common-favorites-title">
                            <IonIcon icon={film} />
                            Films en commun
                          </h3>
                          <ul className="favorites-list">
                            {user.commonFavorites.slice(0, 5).map(fav => (
                              <li key={fav.id} className="favorite-item">
                                {fav.title}{fav.year && ` (${fav.year})`}
                              </li>
                            ))}
                            {user.commonFavorites.length > 5 && (
                              <li className="favorite-item">
                                +{user.commonFavorites.length - 5} autres films...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Matching;
