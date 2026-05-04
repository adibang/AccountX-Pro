import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Journal } from "./components/Journal";
import { Reports } from "./components/Reports";
import { MasterData } from "./components/MasterData";
import { Ledger } from "./components/Ledger";
import { motion, AnimatePresence } from "motion/react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from "firebase/auth";
import { auth } from "./lib/firebase";
import { firebaseService, testConnection } from "./services/firebaseService";
import { INITIAL_COA } from "./constants";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Initialize COA if empty (one-time or check)
        firebaseService.getAccounts().then(accounts => {
          if (accounts && accounts.length === 0) {
            firebaseService.seedInitialAccounts(INITIAL_COA);
          }
        }).catch(err => {
          console.error("Failed to fetch accounts on init:", err);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      console.log("Attempting login with Google provider...");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user.email);
    } catch (error) {
      console.error("Login failed detail:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Memuat sistem...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Selamat Datang di AccounX</h1>
            <p className="text-slate-500">Sistem Akuntansi Profesional</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-1" alt="Google" />
              Masuk dengan Google
            </button>
            <p className="text-xs text-center text-slate-400 italic">
              *Hanya email yang terverifikasi yang dapat melakukan input data.
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Powered by Google AI Studio</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "journal" && <Journal />}
              {activeTab === "ledger" && <Ledger />}
              {activeTab === "reports" && <Reports />}
              {activeTab === "ar-ap" && (
                <div className="card p-12 text-center text-slate-400">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Modul Piutang & Hutang</h3>
                  <p>Modul ini sedang dalam pengembangan...</p>
                </div>
              )}
              {activeTab === "inventory" && (
                <div className="card p-12 text-center text-slate-400">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Manajemen Inventaris</h3>
                  <p>Modul ini sedang dalam pengembangan...</p>
                </div>
              )}
              {activeTab === "assets" && (
                <div className="card p-12 text-center text-slate-400">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Manajemen Aset Tetap</h3>
                  <p>Modul ini sedang dalam pengembangan...</p>
                </div>
              )}
              {activeTab === "masterdata" && <MasterData />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
