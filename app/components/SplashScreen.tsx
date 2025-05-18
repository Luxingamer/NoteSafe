'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Simuler une progression de chargement
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Ajouter un délai pour l'effet final
          setTimeout(() => setAnimationComplete(true), 500);
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-800 to-green-950 z-50 transition-opacity duration-500 ${animationComplete ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center justify-center px-8">
        {/* Logo et titre avec animation améliorée */}
        <div className="animate-fade-in mb-8 text-center">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-emerald-300 animate-float">
              <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mt-4 text-white tracking-wider animate-pulse-glow">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-200">
              NoteSafe
            </span>
          </h1>
          <p className="text-lg text-emerald-200 mt-2 animate-fade-in-delay">
            Sécurisez et organisez vos pensées en toute simplicité
          </p>
        </div>

        {/* Barre de progression améliorée */}
        <div className="w-72 h-3 bg-green-950/50 rounded-full overflow-hidden mb-4 backdrop-blur-sm border border-green-800/30">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-green-300 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Texte de chargement qui change avec animation */}
        <div className="h-6 text-emerald-200 text-sm font-medium">
          {progress < 25 && "Préparation de l'environnement..."}
          {progress >= 25 && progress < 50 && "Chargement des notes..."}
          {progress >= 50 && progress < 75 && "Initialisation de l'interface..."}
          {progress >= 75 && progress < 95 && "Presque prêt..."}
          {progress >= 95 && "Démarrage de NoteSafe..."}
        </div>
        
        {/* Indicateur de progression en pourcentage */}
        <div className="mt-2 text-emerald-300/80 text-xs font-mono">
          {progress}%
        </div>
      </div>
      
      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(167, 243, 208, 0.5); }
          50% { text-shadow: 0 0 25px rgba(167, 243, 208, 0.8), 0 0 35px rgba(16, 185, 129, 0.6); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInDelay {
          0% { opacity: 0; transform: translateY(-5px); }
          30% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fadeInDelay 1.5s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 