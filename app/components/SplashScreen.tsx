'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loadingText, setLoadingText] = useState("Préparation de l'environnement...");
  const [particlesVisible, setParticlesVisible] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // Vérifier l'état de la connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Simuler une progression de chargement
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Ajouter un délai pour l'effet final
          setTimeout(() => setAnimationComplete(true), 500);
          setParticlesVisible(false);
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Animation de texte de chargement avec un effet de machine à écrire
  useEffect(() => {
    const texts = [
      "Préparation de l'environnement...",
      "Chargement des notes...",
      "Initialisation de l'interface...",
      "Vérification de la connexion...",
      "Préparation des outils...",
      "Presque prêt...",
      "Démarrage de NoteSafe..."
    ];

    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 1500);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${animationComplete ? 'opacity-0' : 'opacity-100'}`}
         style={{
           background: `radial-gradient(circle at center, var(--topbar-gradient-from), var(--topbar-gradient-to))`,
           backgroundSize: '400% 400%',
           animation: 'gradientMove 15s ease infinite'
         }}>
      
      {/* Effet de particules */}
      {particlesVisible && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="particle absolute rounded-full opacity-50"
                style={{
                  width: `${Math.random() * 20 + 5}px`,
                  height: `${Math.random() * 20 + 5}px`,
                  backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 15 + 5}s linear infinite, pulse ${Math.random() * 3 + 2}s ease-in-out infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo et titre avec animation améliorée */}
        <div className="animate-fade-in mb-8 text-center">
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-emerald-300 animate-float drop-shadow-[0_0_15px_rgba(167,243,208,0.5)]">
                <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
              </svg>
              <div className="absolute inset-0 animate-pulse-slow opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-emerald-200 blur-md">
                  <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mt-4 text-white tracking-wider animate-pulse-glow relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-200">
              NoteSafe
            </span>
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-green-200 blur-md opacity-50">
              NoteSafe
            </span>
          </h1>
          <p className="text-lg text-emerald-200 mt-2 animate-fade-in-delay relative">
            <span>Sécurisez et organisez vos pensées en toute simplicité</span>
            <span className="absolute inset-0 blur-sm opacity-50">Sécurisez et organisez vos pensées en toute simplicité</span>
          </p>
        </div>

        {/* Message hors ligne si nécessaire */}
        {!isOnline && (
          <div className="mb-4 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-sm">
              Mode hors ligne détecté. Certaines fonctionnalités peuvent être limitées.
            </p>
          </div>
        )}

        {/* Barre de progression améliorée avec effet de lueur */}
        <div className="w-72 h-3 bg-green-950/50 rounded-full overflow-hidden mb-4 backdrop-blur-sm border border-green-800/30 relative">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-green-300 transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Effet de brillance */}
            <div className="absolute top-0 right-0 h-full w-5 bg-white opacity-30 animate-shimmer"></div>
          </div>
          {/* Lueur autour de la barre */}
          <div 
            className="absolute top-0 left-0 h-full bg-emerald-300/30 blur-md transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`, 
              filter: 'blur(4px)',
            }}
          ></div>
        </div>
        
        {/* Texte de chargement qui change avec animation de machine à écrire */}
        <div className="h-6 text-emerald-200 text-sm font-medium relative overflow-hidden">
          <span className="inline-block animate-fade-in-fast whitespace-nowrap">{loadingText}</span>
        </div>
        
        {/* Indicateur de progression en pourcentage avec animation de compteur */}
        <div className="mt-2 text-emerald-300/80 text-xs font-mono relative">
          <span className="inline-block min-w-[3ch] text-center">{progress}%</span>
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
        
        @keyframes fadeInFast {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
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
        
        .animate-fade-in-fast {
          animation: fadeInFast 0.5s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .particles-container {
          width: 100%;
          height: 100%;
          position: absolute;
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
} 