import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroSection } from './components/HeroSection';
import { RateCard } from './components/RateCard';
import { BulkSubmitModal } from './components/BulkSubmitModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLockPage } from './components/AdminLockPage';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { LiveSupportWidget } from './components/LiveSupportWidget';
import { CategoryId } from './types';

const MainLayout: React.FC = () => {
  // Client Path Routing
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('mailvault_admin_unlocked') === 'true';
  });

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedSubmitCategory, setSelectedSubmitCategory] = useState<CategoryId>('gmail_fresh');

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

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

  const handleAdminUnlock = () => {
    setIsAdminUnlocked(true);
    localStorage.setItem('mailvault_admin_unlocked', 'true');
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
          isAdminUnlocked ? (
            <AdminDashboard />
          ) : (
            <AdminLockPage
              onUnlock={handleAdminUnlock}
              onGoHome={() => navigate('/')}
            />
          )
        ) : currentPath === '/seller' || currentPath === '/dashboard' ? (
          <SellerDashboard openSubmitModal={() => handleOpenSubmitModal()} />
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
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
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
