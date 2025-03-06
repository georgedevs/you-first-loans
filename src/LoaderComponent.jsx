import React, { useEffect, useState } from 'react';

const LoadingAnimation = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 2000); // Animation runs for 2 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`fixed inset-0 bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-center transition-opacity duration-500 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative">
        {/* Backdrop blur pulse effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
        </div>
        
        {/* Logo container with zoom animation */}
        <div className="relative flex flex-col items-center animate-loader">
          {/* SVG Logo */}
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-200 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="8" y1="7" x2="8" y2="17" />
              <line x1="16" y1="7" x2="16" y2="17" />
              <line x1="7" y1="10.5" x2="17" y2="10.5" />
              <line x1="7" y1="13.5" x2="17" y2="13.5" />
              <line x1="8" y1="7" x2="16" y2="17" />
            </svg>
            <h1 className="text-3xl font-bold text-white">You-First Loans</h1>
          </div>
          
          {/* Loading text */}
          <div className="mt-8 flex items-center space-x-2">
            <div className="text-blue-200 text-lg">Loading</div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the custom animation keyframes using style tag
const CustomAnimations = () => (
  <style jsx global>{`
    @keyframes loader {
      0% {
        transform: scale(0.8);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
      }
      100% {
        transform: scale(0.9);
        opacity: 0.9;
      }
    }
    .animate-loader {
      animation: loader 2s ease-in-out infinite;
    }
  `}</style>
);

const LoaderComponent = () => (
  <>
    <CustomAnimations />
    <LoadingAnimation />
  </>
);

export default LoaderComponent;