import React from "react";
import { IonPage, IonContent, IonButton } from "@ionic/react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import films from "../assets/films.jpg"; // chemin image

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="splash-container"
        style={{
          backgroundImage: `url(${films})`,
        }}
      >
        <div className="splash-overlay">
          {/* Titre avec effet 3D */}
          <h1 className="splash-title">🎬 MovieApp</h1>

          {/* Sous-titre */}
          <p className="splash-subtitle">
            Découvrez, partagez et aimez vos films préférés
          </p>

          {/* Bouton avec effet 3D */}
          <IonButton
            expand="block"
            className="splash-button"
            onClick={() => navigate("/auth")}
          >
            🚀 Get Started
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;
