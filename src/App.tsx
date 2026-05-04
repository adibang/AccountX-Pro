import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Journal } from "./components/Journal";
import { Reports } from "./components/Reports";
import { MasterData } from "./components/MasterData";
import { Ledger } from "./components/Ledger";
import { Contacts } from "./components/Contacts";
import { Arap } from "./components/Arap";
import { Settings } from "./components/Settings";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email);
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Ensure user profile exists
        try {
          const userDoc = await firebaseService.getUserProfile(user.uid);
          if (!userDoc) {
            await firebaseService.createUserProfile(user.uid, {
              email: user.email || "",
              displayName: user.displayName || "",
              role: user.email === "adiblinggo@gmail.com" ? "admin" : "staff"
            });
          }
        } catch (e) {
          console.error("Profile check failed:", e);
        }

        // Initialize COA if empty
        firebaseService.getAccounts().then(accounts => {
          if (accounts && accounts.length === 0) {
            console.log("Seeding initial accounts...");
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile & Desktop Header */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">
              A
            </div>
            <span className="font-bold tracking-tight text-xl hidden sm:inline">AccounX Pro</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-400 uppercase">User</div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-700">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Overlay (Mobile only) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <div 
          className={`fixed md:relative inset-y-0 left-0 z-50 transition-all duration-300 transform 
            ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-0'} 
            bg-slate-900 shadow-2xl md:shadow-none`}
        >
          <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'} transition-opacity duration-200 h-full`}>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                // Close sidebar on mobile after selection
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
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
              {activeTab === "arap" && <Arap />}
              {activeTab === "contacts" && <Contacts />}
              {activeTab === "settings" && <Settings />}
              {activeTab === "masterdata" && <MasterData />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  </div>
);
}
