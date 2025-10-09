// src/components/AdminDashboard/AdminDashboard.js
import React, { useEffect, useState } from "react";
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonSpinner, IonToast, IonTabButton, IonLabel, IonIcon
} from "@ionic/react";
import { time, star, film, people, person } from "ionicons/icons";
import { ref, update, onValue } from "firebase/database";
import { db } from "../../firebase/config";
import "./Admindash.css";

const AdminDashboard = () => {
  const [movies, setMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const API_KEY = "6da521a9675991f3a1e3258c35bb11cc";

  // 🔹 Catégories à charger depuis TMDb
  const categories = [
    { name: "Animation", id: 16 },
    { name: "Action", id: 28 },
    { name: "Comédie", id: 35 },
    { name: "Science-Fiction", id: 878 },
  ];

  // 🔹 Charger les films depuis TMDb
  useEffect(() => {
    const fetchAndSaveMovies = async () => {
      try {
        const moviesByCat = {};
        for (let cat of categories) {
          const URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=fr-FR&with_genres=${cat.id}&sort_by=popularity.desc`;
          const res = await fetch(URL);
          const data = await res.json();
          moviesByCat[cat.name] = data.results.slice(0, 8);
        }
        setMovies(moviesByCat);

        // Sauvegarde dans Firebase TMDb (optionnel)
        const moviesRef = ref(db, "movies");
        const moviesObject = {};
        Object.values(moviesByCat).flat().forEach((movie) => {
          moviesObject[movie.id] = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
          };
        });
        await update(moviesRef, moviesObject);
        setLoading(false);
      } catch (error) {
        console.error("Erreur films :", error);
        setToastMessage("Erreur lors du chargement des films");
        setShowToast(true);
        setLoading(false);
      }
    };
    fetchAndSaveMovies();
  }, []);

  // 🔹 Écouter les films ajoutés/modifiés/supprimés depuis Films.js
  useEffect(() => {
    const myMoviesRef = ref(db, "myMovies"); // ton noeud perso
    const unsubscribe = onValue(myMoviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMovies(prev => ({ 
          ...prev, 
          "Mes Films": Object.values(data) 
        }));
      } else {
        setMovies(prev => ({ ...prev, "Mes Films": [] }));
      }
    });

    return () => unsubscribe();
  }, []);

  const renderMovieCard = (movie) => (
    <IonCol size="6" size-md="4" size-lg="3" key={movie.id}>
      <IonCard className="movie-card">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="movie-poster"
        />
        <IonCardHeader>
          <IonCardTitle>{movie.title}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            <IonIcon icon={time} />{" "}
            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          </p>
          <p>
            <IonIcon icon={star} />{" "}
            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </p>
        </IonCardContent>
      </IonCard>
    </IonCol>
  );

  if (loading)
    return (
      <IonPage>
        <IonContent className="admin-content">
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Chargement des films...</p>
          </div>
        </IonContent>
      </IonPage>
    );

  return (
    <IonPage>
      <IonContent className="admin-content">
        <div className="admin-container">
          <h1 className="admin-title">🎬 Dashboard Administrateur</h1>

          {/* 🔹 Films par catégorie et "Mes Films" */}
          {Object.keys(movies).map((cat) => (
            <section key={cat}>
              <h2>{cat}</h2>
              <IonGrid>
                <IonRow>{movies[cat].map(renderMovieCard)}</IonRow>
              </IonGrid>
            </section>
          ))}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          style={{ "--background": "#ff0000", "--color": "#fff", "--border-radius": "12px" }}
        />
      </IonContent>

      {/* 🔹 Navbar bas */}
      <div className="navbar-container">
        <img 
          src="/assets/images/navbar-bottom.png" 
          alt="Navigation Bar"
          className="navbar-image"
        />
        <div className="navbar-overlay">
          <IonTabButton href="/users">
            <IonIcon icon={people} />
            <IonLabel>Users</IonLabel>
          </IonTabButton>
          <IonTabButton href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
          <IonTabButton href="/Films">
            <IonIcon icon={film} />
            <IonLabel>Films</IonLabel>
          </IonTabButton>
        </div>
      </div>
    </IonPage>
  );
};

export default AdminDashboard;
