import React from 'react';
import Transactions from './components/Transactions';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Payment Tracker</h1>
          <p className="text-blue-100">Manage your finances with ease</p>
        </div>
      </header>
      
      <main className="min-h-screen bg-gray-100 py-8">
        <Transactions />
      </main>
    </div>
  );
}

export default App;