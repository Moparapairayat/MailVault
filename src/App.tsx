import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroSection } from './components/HeroSection';
import { RateCard } from './components/RateCard';
import { BulkSubmitModal } from './components/BulkSubmitModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { CategoryId } from './types';

const MainLayout: React.FC = () => {
  const { role } = useApp();
  const [activeTab, setActiveTab] = useState<'SELL' | 'DASHBOARD' | 'ADMIN'>('SELL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedSubmitCategory, setSelectedSubmitCategory] = useState<CategoryId>('gmail_fresh');

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSubmitModal={() => handleOpenSubmitModal()}
          openAuthModal={handleOpenAuthModal}
        />

        {/* Running Live Marquee Ticker */}
        <LiveTicker />

        {/* View Switch Logic */}
        {role === 'ADMIN' && activeTab === 'ADMIN' ? (
          <AdminDashboard />
        ) : activeTab === 'DASHBOARD' ? (
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

      {/* Footer */}
      <Footer />
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
