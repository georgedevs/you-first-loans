import React from 'react';
import './App.css';
import LoanCalculator from './LoanCalculator';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">You-First Loans</h1>
          <p className="text-blue-200">Financial Solutions</p>
        </div>
      </header>
      
      <main className="py-8">
        <LoanCalculator />
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">You-First Loans</h2>
              <p className="text-gray-400">Providing financial assistance with ease.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© {new Date().getFullYear()} You-First Loans</p>
              <p className="text-gray-400">All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;