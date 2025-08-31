import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DealDetails } from './components/DealDetails';
import { UserPreferences } from './components/UserPreferences';
import { Deal } from './types/Deal';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'preferences'>('dashboard');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} onViewChange={setActiveView} />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'dashboard' ? (
          <Dashboard 
            onDealSelect={setSelectedDeal}
            selectedDeal={selectedDeal}
          />
        ) : (
          <UserPreferences />
        )}
      </main>

      {selectedDeal && (
        <DealDetails 
          deal={selectedDeal} 
          onClose={() => setSelectedDeal(null)} 
        />
      )}
    </div>
  );
}

export default App;