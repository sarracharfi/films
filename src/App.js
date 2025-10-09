// src/App.js
import React, { useState, useEffect } from "react";
import { IonApp } from "@ionic/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Pages */
import Auth from "./components/Auth/Auth";
import Splash from "./components/SplashScreen/SplashScreen";
import Dashboard from "./components/Dashboard/Dashboard";
import Movies from "./components/Movies/Movies";
import Matching from "./components/Matching/Matching";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import UsersPage from "./components/UsersPage/UsersPage";
import ProfileAdmin from "./components/ProfileAdmin/ProfileAdmin";
 
/* Firebase Auth */
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

/* Ionic CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import Films from "./components/Films/Films";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <IonApp>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard/*" element={<Dashboard currentUser={currentUser} />} />
          <Route path="/movies" element={<Movies currentUser={currentUser} />} />
          <Route path="/matching" element={<Matching currentUser={currentUser} />} />
          <Route path="/admin-dashboard" element={<AdminDashboard currentUser={currentUser} />} />
          <Route path="/users" element={<UsersPage currentUser={currentUser} />} />
          <Route path="/profile" element={<ProfileAdmin currentUser={currentUser} />} />
          <Route path="/films" element={<Films currentUser={currentUser} />} /> {/* ✅ Nouvelle route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </IonApp>
  );
}

export default App;
