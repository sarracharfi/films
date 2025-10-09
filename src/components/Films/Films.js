import React, { useState, useEffect } from "react";
import { 
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonToast 
} from "@ionic/react";
import { trash, create, add } from "ionicons/icons";
import { ref, update, remove, onValue } from "firebase/database";
import { db } from "../../firebase/config";

const API_KEY = "6da521a9675991f3a1e3258c35bb11cc";

const Films = () => {
  const [movies, setMovies] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  // 🔹 Charger uniquement les films ajoutés par toi depuis Firebase
  useEffect(() => {
    const moviesRef = ref(db, "myMovies"); // utiliser un node séparé pour tes films
    onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMovies(Object.values(data));
      else setMovies([]);
    });
  }, []);

  // 🔹 Ajouter un film
  const handleAddMovie = async () => {
    if (!newTitle) return;

    try {
      // 🔹 Chercher film sur TMDb pour récupérer les infos
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(newTitle)}`
      );
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setToast({ show: true, message: "Film introuvable sur TMDb !" });
        return;
      }

      const movie = data.results[0];
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      };

      // 🔹 Sauvegarder uniquement dans ton noeud perso "myMovies"
      const movieRef = ref(db, "myMovies/" + movie.id);
      await update(movieRef, movieData);

      setNewTitle("");
      setToast({ show: true, message: "Film ajouté ✅" });
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: "Erreur lors de l'ajout du film" });
    }
  };

  // 🔹 Supprimer un film
  const handleDelete = async (id) => {
    try {
      const movieRef = ref(db, "myMovies/" + id);
      await remove(movieRef);
      setToast({ show: true, message: "Film supprimé ✅" });
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: "Erreur lors de la suppression" });
    }
  };

  return (
    <IonPage>
      <IonContent style={{ padding: "20px" }}>
        <h2>🎬 Mes Films</h2>

        {/* ➕ Ajouter un film */}
        <IonItem>
          <IonInput
            placeholder="Nom du film"
            value={newTitle}
            onIonInput={e => setNewTitle(e.detail.value)}
          />
          <IonButton onClick={handleAddMovie}>
            <IonIcon icon={add} />
            Ajouter
          </IonButton>
        </IonItem>

        {/* 🔹 Liste des films ajoutés */}
        <IonGrid>
          <IonRow>
            {movies.map((movie) => (
              <IonCol size="12" size-md="4" key={movie.id}>
                <IonCard>
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title} 
                    style={{ width: "100%" }} 
                  />
                  <IonCardHeader>
                    <IonCardTitle>{movie.title}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>Date de sortie: {movie.release_date}</p>
                    <p>Note: {movie.vote_average}</p>
                    <IonButton color="primary" onClick={() => setNewTitle(movie.title)}>
                      <IonIcon icon={create} />
                      Modifier
                    </IonButton>
                    <IonButton color="danger" onClick={() => handleDelete(movie.id)}>
                      <IonIcon icon={trash} />
                      Supprimer
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ show: false, message: "" })}
          message={toast.message}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Films;
