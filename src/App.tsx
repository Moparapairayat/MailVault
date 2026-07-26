import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroSection } from './components/HeroSection';
import { RateCard } from './components/RateCard';
import { BulkSubmitModal } from './components/BulkSubmitModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSetupWizard } from './components/AdminSetupWizard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { LiveSupportWidget } from './components/LiveSupportWidget';
import { CategoryId } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Auth Guard — Login ছাড়া Seller Dashboard access করলে redirect + modal
interface LoginRedirectProps {
  navigate: (path: string) => void;
  openAuthModal: (mode: 'LOGIN' | 'SIGNUP') => void;
}

const LoginRedirect: React.FC<LoginRedirectProps> = ({ navigate, openAuthModal }) => {
  useEffect(() => {
    // Home page-এ ফেরত পাঠাও এবং Login modal খোলো
    navigate('/');
    openAuthModal('LOGIN');
  }, []);

  // Loading state দেখাও redirect হওয়ার আগ পর্যন্ত
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto animate-pulse">
        <span className="text-3xl">🔒</span>
      </div>
      <h2 className="text-xl font-bold text-white">Login Required</h2>
      <p className="text-sm text-slate-400">Seller Dashboard দেখতে প্রথমে Login করুন।</p>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  // Client Path Routing
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [adminInitialized, setAdminInitialized] = useState<boolean>(() => {
    return localStorage.getItem('mailvault_admin_initialized') === 'true';
  });
  const [isCheckingAdminInit, setIsCheckingAdminInit] = useState(true);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedSubmitCategory, setSelectedSubmitCategory] = useState<CategoryId>('gmail_fresh');

  // Auth Modal State
  type AuthMode = 'LOGIN' | 'SIGNUP' | 'ADMIN_LOGIN';
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Check if admin has been initialized in DB
  useEffect(() => {
    const checkAdminInit = async () => {
      try {
        const client = supabase;
        if (isSupabaseConfigured && client) {
          const { data, error } = await client
            .from('profiles')
            .select('id')
            .eq('role', 'ADMIN')
            .limit(1);

          if (error) {
            console.warn('Admin init DB check error:', error);
            const localAdmin = localStorage.getItem('mailvault_admin_initialized');
            setAdminInitialized(localAdmin === 'true');
          } else if (data && data.length > 0) {
            setAdminInitialized(true);
            localStorage.setItem('mailvault_admin_initialized', 'true');
          } else {
            setAdminInitialized(false);
            localStorage.removeItem('mailvault_admin_initialized');
          }
        } else {
          const localAdmin = localStorage.getItem('mailvault_admin_initialized');
          setAdminInitialized(localAdmin === 'true');
        }
      } catch (e) {
        console.warn('Admin init check failed:', e);
        const localAdmin = localStorage.getItem('mailvault_admin_initialized');
        setAdminInitialized(localAdmin === 'true');
      } finally {
        setIsCheckingAdminInit(false);
      }
    };

    checkAdminInit();
  }, []);

  // Handle Browser Back / Forward buttons & Navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubmitModal = (categoryId?: CategoryId) => {
    if (categoryId) {
      setSelectedSubmitCategory(categoryId);
    }
    setIsSubmitModalOpen(true);
  };

  const handleOpenAuthModal = (mode: 'LOGIN' | 'SIGNUP' = 'LOGIN') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          openSubmitModal={() => handleOpenSubmitModal()}
          openAuthModal={handleOpenAuthModal}
        />

        {/* Running Live Marquee Ticker */}
        <LiveTicker />

        {/* Dedicated Path-based Route View Rendering */}
        {currentPath === '/admin' ? (
          isCheckingAdminInit ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-slate-400 text-sm animate-pulse">Loading admin vault...</div>
            </div>
          ) : !adminInitialized ? (
            <AdminSetupWizard
              onComplete={() => {
                setAdminInitialized(true);
                localStorage.setItem('mailvault_admin_initialized', 'true');
              }}
            />
          ) : currentUser?.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="glass-card p-8 rounded-3xl border border-brand-500/30 text-center max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-black text-white">Admin Access Only</h2>
                <p className="text-slate-400 text-xs mt-2 mb-6">Please login with your admin account to access the control vault.</p>
                <button
                  onClick={() => { setAuthMode('ADMIN_LOGIN'); setIsAuthModalOpen(true); }}
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
                >
                  Admin Login
                </button>
              </div>
            </div>
          )
        ) : currentPath === '/seller' || currentPath === '/dashboard' ? (
          currentUser ? (
            <SellerDashboard openSubmitModal={() => handleOpenSubmitModal()} />
          ) : (
            // Not logged in → redirect to home & open login modal
            <LoginRedirect
              navigate={navigate}
              openAuthModal={handleOpenAuthModal}
            />
          )
        ) : (
          <main>
            <HeroSection onStartSell={() => handleOpenSubmitModal()} />
            <RateCard onSelectCategoryToSell={(catId) => handleOpenSubmitModal(catId)} />
          </main>
        )}
      </div>

      {/* Global Bulk Submit Modal */}
      <BulkSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        defaultCategoryId={selectedSubmitCategory}
        openAuthModal={handleOpenAuthModal}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (authMode === 'ADMIN_LOGIN' && currentPath !== '/admin') {
            navigate('/admin');
          }
        }}
      />

      {/* Public Footer (Only rendered on Home page) */}
      {currentPath === '/' && <Footer />}

      {/* Floating 24/7 Live Support Widget */}
      <LiveSupportWidget />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
