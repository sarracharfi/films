import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonToggle
} from "@ionic/react";
import { 
  person, mail, key, logOut, save, camera, shield, star, 
  create, close, arrowBack, settings
} from "ionicons/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { ref, get, update } from "firebase/database";
import { updatePassword, updateEmail, signOut } from "firebase/auth";
import "./profileAdmin.css";

const ProfileAdmin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
            setFormData(prev => ({
              ...prev,
              displayName: data.displayName || "",
              email: data.email || currentUser.email
            }));
          }
          setLoading(false);
        } catch (error) {
          console.error("Erreur chargement données:", error);
          setToastMessage("Erreur lors du chargement des données");
          setShowToast(true);
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      if (formData.email !== currentUser.email) {
        await updateEmail(auth.currentUser, formData.email);
      }

      if (formData.newPassword && formData.newPassword === formData.confirmPassword) {
        await updatePassword(auth.currentUser, formData.newPassword);
      }

      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, {
        displayName: formData.displayName,
        email: formData.email,
        lastUpdated: new Date().toISOString()
      });

      setToastMessage("Profil mis à jour avec succès ✅");
      setShowToast(true);
      setEditMode(false);
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));

    } catch (error) {
      console.error("Erreur mise à jour:", error);
      let message = "Erreur lors de la mise à jour";
      if (error.code === 'auth/requires-recent-login') {
        message = "Veuillez vous reconnecter pour modifier votre email/mot de passe";
      }
      setToastMessage(message);
      setShowToast(true);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      setToastMessage("Erreur lors de la déconnexion");
      setShowToast(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="profile-content">
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Chargement du profil...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="profile-content">
        <div className="profile-container">
          {/* Header avec navigation */}
          <div className="profile-header">
            <div className="header-actions">
              <IonButton
                fill="clear"
                onClick={() => navigate("/admin-dashboard")}
                className="back-button"
              >
                <IonIcon icon={arrowBack} slot="start" />
              </IonButton>
            </div>

            <div className="avatar-section">
              <IonAvatar className="profile-avatar">
                <IonIcon icon={person} className="avatar-icon" />
              </IonAvatar>
            </div>
            
            <h1 className="profile-title">{formData.displayName || "Administrateur"}</h1>
            <p className="profile-role">
              <IonIcon icon={shield} className="role-icon" />
              Super Administrateur
            </p>
            
           
          </div>

          {/* Section Informations du Profil */}
          <section className="profile-info-section">
            <div className="section-header">
              <h2><IonIcon icon={person} /> Informations Administrateur</h2>
              <IonButton 
                fill={editMode ? "outline" : "solid"}
                color={editMode ? "medium" : "primary"}
                onClick={() => setEditMode(!editMode)}
                className="edit-button"
              >
                <IonIcon icon={editMode ? close : create} slot="start" />
                {editMode ? "Annuler" : "Modifier Profil"}
              </IonButton>
            </div>

            <IonCard className="info-card">
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonItem className="profile-item">
                        <IonIcon icon={person} slot="start" />
                        <IonLabel position="stacked">Nom d'affichage</IonLabel>
                        {editMode ? (
                          <IonInput
                            value={formData.displayName}
                            onIonInput={(e) => handleInputChange('displayName', e.detail.value || '')}
                            placeholder="Votre nom complet"
                            className="admin-input"
                          />
                        ) : (
                          <IonText>
                            <p className="profile-value">{formData.displayName || "Non défini"}</p>
                            <p className="profile-hint">Votre nom public d'administrateur</p>
                          </IonText>
                        )}
                      </IonItem>
                    </IonCol>
                    
                    <IonCol size="12" size-md="6">
                      <IonItem className="profile-item">
                        <IonIcon icon={mail} slot="start" />
                        <IonLabel position="stacked">Email Administrateur</IonLabel>
                        {editMode ? (
                          <IonInput
                            type="email"
                            value={formData.email}
                            onIonInput={(e) => handleInputChange('email', e.detail.value || '')}
                            placeholder="email@admin.com"
                            className="admin-input"
                          />
                        ) : (
                          <IonText>
                            <p className="profile-value">{formData.email}</p>
                            <p className="profile-hint">Email de connexion administrateur</p>
                          </IonText>
                        )}
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {/* ID utilisateur */}
                  <IonRow>
                    <IonCol size="12">
                      <IonItem className="profile-item">
                        <IonIcon icon={key} slot="start" />
                        <IonLabel position="stacked">ID Administrateur</IonLabel>
                        <IonText>
                          <p className="profile-value id">{currentUser?.uid}</p>
                          <p className="profile-hint">Identifiant unique système</p>
                        </IonText>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {/* Champs de mot de passe */}
                  {editMode && (
                    <>
                      <IonRow>
                        <IonCol size="12" size-md="6">
                          <IonItem className="profile-item">
                            <IonIcon icon={key} slot="start" />
                            <IonLabel position="stacked">Nouveau mot de passe</IonLabel>
                            <div className="password-input-container">
                              <IonInput
                                type={showPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onIonInput={(e) => handleInputChange('newPassword', e.detail.value || '')}
                                placeholder="••••••••"
                                className="admin-input"
                              />
                              <IonButton
                                fill="clear"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                              >
                                <IonIcon icon={showPassword ? "eye-off" : "eye"} />
                              </IonButton>
                            </div>
                          </IonItem>
                        </IonCol>
                        <IonCol size="12" size-md="6">
                          <IonItem className="profile-item">
                            <IonIcon icon={key} slot="start" />
                            <IonLabel position="stacked">Confirmation</IonLabel>
                            <IonInput
                              type={showPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onIonInput={(e) => handleInputChange('confirmPassword', e.detail.value || '')}
                              placeholder="••••••••"
                              className="admin-input"
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>
                      
                      {formData.newPassword && formData.newPassword !== formData.confirmPassword && (
                        <IonRow>
                          <IonCol size="12">
                            <IonText color="danger">
                              <p className="error-message">⚠️ Les mots de passe ne correspondent pas</p>
                            </IonText>
                          </IonCol>
                        </IonRow>
                      )}
                    </>
                  )}
                </IonGrid>

                {editMode && (
                  <div className="action-buttons">
                    <IonButton 
                      color="primary" 
                      expand="block"
                      onClick={handleSave}
                      disabled={saving || (formData.newPassword && formData.newPassword !== formData.confirmPassword)}
                      className="save-button"
                    >
                      <IonIcon icon={save} slot="start" />
                      {saving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </section>

          {/* Section Actions */}
          <section className="actions-section">
            <IonCard className="actions-card">
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonButton 
                        color="warning" 
                        expand="block"
                        fill="outline"
                        onClick={() => navigate('/admin-dashboard')}
                        className="action-button"
                      >
                        <IonIcon icon={settings} slot="start" />
                      </IonButton>
                    </IonCol>
                    <IonCol size="12" size-md="6">
                      <IonButton 
                        color="danger" 
                        expand="block"
                        fill="outline"
                        onClick={handleLogout}
                        className="action-button"
                      >
                        <IonIcon icon={logOut} slot="start" />
                        Déconnexion
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          </section>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          style={{ 
            "--background": "#000000", 
            "--color": "#ffffff", 
            "--border-radius": "12px",
            "--box-shadow": "0 4px 12px rgba(255, 0, 0, 0.3)"
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfileAdmin;