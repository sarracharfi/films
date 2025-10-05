// src/components/Auth/Auth.js
import React, { useState } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonImg, 
  IonLoading, 
  IonToast 
} from '@ionic/react';
import { camera, close } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from './../../firebase/config';
import { useNavigate } from 'react-router-dom';
import './../Styles/auth.css';

function Auth() {
  const [signUpMode, setSignUpMode] = useState(false);
  const [signupData, setSignupData] = useState({ 
    nom: '', prenom: '', age: '', email: '', password: '', photo: null, role: 'user' 
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'success' });

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    if (signUpMode) {
      setSignupData({ ...signupData, [field]: value });
    } else {
      setLoginData({ ...loginData, [field]: value });
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      setSignupData({ ...signupData, photo: image.dataUrl });
    } catch (err) {
      console.log("Erreur photo:", err);
      showToast('Erreur lors de la capture de la photo', 'danger');
    }
  };

  const handlePhotoRemove = () => {
    setSignupData({ ...signupData, photo: null });
  };

  const saveUserData = async (userId, data) => {
    await set(ref(db, 'users/' + userId), {
      nom: data.nom,
      prenom: data.prenom,
      age: parseInt(data.age) || 0,
      email: data.email,
      photo: data.photo || null,
      role: data.role || 'user',
      createdAt: new Date().toISOString()
    });
  };

  const showToast = (message, color = 'success') => {
    setToast({ isOpen: true, message, color });
  };

  // ---------------- INSCRIPTION ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!signupData.email || !signupData.password) {
      showToast('Email et mot de passe sont obligatoires', 'danger');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, signupData.email, signupData.password
      );
      const user = userCredential.user;

      await saveUserData(user.uid, signupData);

      // Stocker currentUser dans localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        nom: signupData.nom,
        prenom: signupData.prenom,
        email: signupData.email,
        role: signupData.role || 'user'
      }));

      showToast(`Inscription réussie ! Bienvenue ${signupData.prenom}`, 'success');
      setSignupData({ nom: '', prenom: '', age: '', email: '', password: '', photo: null, role: 'user' });
      setSignUpMode(false);

      // Redirection selon rôle
      if (signupData.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard/movies');
      }

    } catch (error) {
      console.error("Erreur inscription:", error);
      showToast(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CONNEXION ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginData.email || !loginData.password) {
      showToast('Email et mot de passe sont obligatoires', 'danger');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, loginData.email, loginData.password
      );
      const user = userCredential.user;

      const snapshot = await get(ref(db, `users/${user.uid}`));
      const data = snapshot.val();

      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        role: data.role || 'user'
      }));

      showToast(`Connexion réussie ! Bienvenue ${data.prenom}`, 'success');
      setLoginData({ email: '', password: '' });

      // Redirection selon rôle
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard/movies');
      }

    } catch (error) {
      console.error("Erreur connexion:", error);
      showToast(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonLoading isOpen={loading} message="Veuillez patienter..." />

        <IonToast
          isOpen={toast.isOpen}
          message={toast.message}
          color={toast.color}
          duration={2000}
          position="top"
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        />

        <div className={`container ${signUpMode ? 'sign-up-mode' : ''}`}>
          <div className="forms-container">
            <div className="signin-signup">

              {/* Login Form */}
              <form className="sign-in-form" onSubmit={handleLogin}>
                <h2 className="title">Connexion</h2>
                <input type="email" placeholder="Email" value={loginData.email} onChange={e => handleInputChange('email', e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={e => handleInputChange('password', e.target.value)} required />
                <IonButton type="submit" expand="block" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</IonButton>
              </form>

              {/* Signup Form */}
              <form className="sign-up-form" onSubmit={handleSignup}>
                <h2 className="title">Inscription</h2>
                <input type="text" placeholder="Nom" value={signupData.nom} onChange={e => handleInputChange('nom', e.target.value)} required />
                <input type="text" placeholder="Prénom" value={signupData.prenom} onChange={e => handleInputChange('prenom', e.target.value)} required />
                <input type="number" placeholder="Âge" value={signupData.age} onChange={e => handleInputChange('age', e.target.value)} required />
                <input type="email" placeholder="Email" value={signupData.email} onChange={e => handleInputChange('email', e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={signupData.password} onChange={e => handleInputChange('password', e.target.value)} required />

                {/* Champ rôle */}
                <div className="role-select">
                  <label>Choisir un rôle :</label>
                  <select
                    value={signupData.role}
                    onChange={e => handleInputChange('role', e.target.value)}
                    required
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  <p>Rôle sélectionné : <strong>{signupData.role}</strong></p>
                </div>

                {/* Photo */}
                <div className="photo-container">
                  <IonButton onClick={handlePhotoCapture} fill="outline">
                    <IonIcon icon={camera} slot="start" /> Prendre / Choisir une photo
                  </IonButton>
                  {signupData.photo && (
                    <div className="photo-preview">
                      <IonImg src={signupData.photo} />
                      <IonButton onClick={handlePhotoRemove} color="danger">
                        <IonIcon icon={close} />
                      </IonButton>
                    </div>
                  )}
                </div>

                <IonButton type="submit" expand="block" disabled={loading}>{loading ? 'Inscription...' : "S'inscrire"}</IonButton>
              </form>

            </div>
          </div>

          <div className="panels-container">
            <div className="panel left-panel">
              <div className="content">
                <h3>Vous êtes nouveau ?</h3>
                <p>Inscrivez-vous pour créer votre compte et accéder aux films.</p>
                <IonButton onClick={() => setSignUpMode(true)} fill="clear">S'inscrire</IonButton>
              </div>
            </div>
            <div className="panel right-panel">
              <div className="content">
                <h3>Déjà inscrit ?</h3>
                <p>Connectez-vous pour continuer et voir vos films favoris.</p>
                <IonButton onClick={() => setSignUpMode(false)} fill="clear">Se connecter</IonButton>
              </div>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
}

export default Auth;
