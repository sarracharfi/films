import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonToast, IonButton, IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { ref, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom"; // 🔹 pour navigation
import { db } from "../../firebase/config";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate(); // 🔹 hook de navigation

  // 🔹 Charger les utilisateurs depuis Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(db, "users");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formatted = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setUsers(formatted);
        }
      } catch (error) {
        console.error("Erreur chargement utilisateurs :", error);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Activer / désactiver utilisateur
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, { active: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !currentStatus } : u))
      );
      setToastMessage(currentStatus ? "Utilisateur désactivé ❌" : "Utilisateur activé ✅");
      setShowToast(true);
    } catch {
      setToastMessage("Erreur de mise à jour utilisateur");
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="admin-container">
          {/* 🔹 Bouton retour */}
          <IonButton
            fill="clear"
            onClick={() => navigate("/admin-dashboard")}
            style={{ marginBottom: "20px", fontWeight: 600 }}
          >
            <IonIcon icon={arrowBack} slot="start" />
        
          </IonButton>

          <h1 className="admin-title">👥 Gestion des Utilisateurs</h1>

          {/* 🔹 Tableau utilisateurs */}
          <section>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td style={{ color: user.active ? "green" : "red", fontWeight: 600 }}>
                      {user.active ? "Actif" : "Inactif"}
                    </td>
                    <td>
                      <button
                        className={user.active ? "inactive-btn" : "active-btn"}
                        onClick={() => toggleUserStatus(user.id, user.active)}
                      >
                        {user.active ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* 🔹 Toast notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default UsersPage;
