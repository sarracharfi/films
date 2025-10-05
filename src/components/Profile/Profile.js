import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonButton, IonImg, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonToggle, IonIcon
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase/config';
import {
  mailOutline,
  notificationsOutline,
  moonOutline,
  calendarOutline,
  chevronForwardOutline,
  logOutOutline
} from 'ionicons/icons';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Récupère user depuis localStorage et refresh depuis Firebase si possible
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      get(ref(db, `users/${storedUser.id}`))
        .then(snapshot => {
          if (snapshot.exists()) setCurrentUser(snapshot.val());
          else setCurrentUser(storedUser);
        })
        .catch(() => setCurrentUser(storedUser));
    } else {
      navigate('/auth');
    }

    // initialise darkMode d'après body (si persisted)
    const persistedDark = document.body.classList.contains('dark');
    setDarkMode(persistedDark);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleNotificationsToggle = () => setNotifications(prev => !prev);

  const handleDarkModeToggle = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle('dark', next);
      return next;
    });
  };

  if (!currentUser) return null;

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar className="toolbar-transparent">
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="profile-page">
        {/* Background blur layer */}
        <div className="bg-accent" aria-hidden />

        <div className="profile-card">
          <div className="profile-top">
            <div className="avatar-wrap">
              {currentUser.photo ? (
                <IonImg src={currentUser.photo} className="avatar" />
              ) : (
                <div className="avatar placeholder">👤</div>
              )}
              {currentUser.role && (
                <div className="badge">{currentUser.role}</div>
              )}
            </div>

            <div className="user-meta">
              <h1 className="user-name">{currentUser.prenom} {currentUser.nom}</h1>
              <p className="user-sub">Membre depuis <strong>{currentUser?.joinedDate || '—'}</strong></p>
            </div>

            <button className="edit-btn" title="Voir profil complet">
              <IonIcon icon={chevronForwardOutline} />
            </button>
          </div>

          {/* Infos en mini-cards */}
          <div className="info-grid">
            <div className="info-card">
              <div className="icon-col"><IonIcon icon={mailOutline} /></div>
              <div className="text-col">
                <div className="label">Email</div>
                <div className="value">{currentUser.email}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-col"><IonIcon icon={calendarOutline} /></div>
              <div className="text-col">
                <div className="label">Âge</div>
                <div className="value">{currentUser.age ? `${currentUser.age} ans` : 'Non renseigné'}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-col"><IonIcon icon={notificationsOutline} /></div>
              <div className="text-col">
                <div className="label">Notifications</div>
                <div className="value small">Réglages personnalisés</div>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-col"><IonIcon icon={moonOutline} /></div>
              <div className="text-col">
                <div className="label">Thème</div>
                <div className="value small">{darkMode ? 'Sombre' : 'Clair'}</div>
              </div>
            </div>
          </div>

          {/* Paramètres toggles */}
          <div className="settings">
            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-title">Notifications</div>
                <div className="setting-desc">Recevoir les nouvelles et recommandations</div>
              </div>
              <div className="setting-right">
                <IonToggle checked={notifications} onIonChange={handleNotificationsToggle} />
              </div>
            </div>

            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-title">Mode sombre</div>
                <div className="setting-desc">Activer un thème sombre pour l'app</div>
              </div>
              <div className="setting-right">
                <IonToggle checked={darkMode} onIonChange={handleDarkModeToggle} />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="card-actions">
            <IonButton expand="block" className="btn-logout" onClick={logout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Se déconnecter
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
