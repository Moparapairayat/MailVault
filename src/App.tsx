import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroSection } from './components/HeroSection';
import { RateCard } from './components/RateCard';
import { BulkSubmitModal } from './components/BulkSubmitModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { CategoryId } from './types';

const MainLayout: React.FC = () => {
  const { role } = useApp();
  const [activeTab, setActiveTab] = useState<'SELL' | 'DASHBOARD' | 'ADMIN'>('SELL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedSubmitCategory, setSelectedSubmitCategory] = useState<CategoryId>('gmail_fresh');

  const handleOpenSubmitModal = (categoryId?: CategoryId) => {
    if (categoryId) {
      setSelectedSubmitCategory(categoryId);
    }
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSubmitModal={() => handleOpenSubmitModal()}
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
