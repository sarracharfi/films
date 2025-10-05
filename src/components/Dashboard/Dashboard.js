// src/components/Dashboard/Dashboard.js
import React from 'react';
import { 
  IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon 
} from '@ionic/react';
import { home, person, star, people, list } from 'ionicons/icons';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./Dashboard.css";

import Profile from '../Profile/Profile';
import Favoris from '../Favoris/Favoris';
import Matching from '../Matching/Matching';
import Movies from '../Movies/Movies';
import Playlist from '../Playlist/Playlist'; // ← importer le composant Playlist

const Dashboard = ({ currentUser }) => {
  return (
    <IonPage>
      <IonTabs>
        <IonRouterOutlet>
          <Routes>
            <Route path="profile" element={<Profile currentUser={currentUser} />} />
            <Route path="favoris" element={<Favoris currentUser={currentUser} />} />
            <Route path="matching" element={<Matching currentUser={currentUser} />} />
            <Route path="movies" element={<Movies currentUser={currentUser} />} />
            <Route path="playlist" element={<Playlist currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="movies" replace />} />
          </Routes>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="profile" href="/dashboard/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
          <IonTabButton tab="favoris" href="/dashboard/favoris">
            <IonIcon icon={star} />
            <IonLabel>Favoris</IonLabel>
          </IonTabButton>
          <IonTabButton tab="matching" href="/dashboard/matching">
            <IonIcon icon={people} />
            <IonLabel>Matching</IonLabel>
          </IonTabButton>
          <IonTabButton tab="movies" href="/dashboard/movies">
            <IonIcon icon={home} />
            <IonLabel>Films</IonLabel>
          </IonTabButton>
          <IonTabButton tab="playlist" href="/dashboard/playlist">
            <IonIcon icon={list} />
            <IonLabel>Playlist</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default Dashboard;
