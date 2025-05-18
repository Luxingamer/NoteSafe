'use client';

import { useState, useRef, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app as firebaseApp } from '../../firebase/config';
import { useUser } from '../context/UserContext';
import { Note, NoteCategory } from '../types/note';
import { useNotes } from '../context/NotesContext';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import PointCost from './PointCost';

// Types pour les options IA
type AIOption = 'generate' | 'arrange' | 'recommend' | 'substitute';

export default function AI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState<NoteCategory>('idée');
  const [aiOption, setAIOption] = useState<AIOption>('generate');
  const [error, setError] = useState('');
  const [shouldSave, setShouldSave] = useState(false);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUser();
  const { addNote } = useNotes();
  const { spendPoints, canAfford } = usePoints();

  // Réinitialiser l'état lorsque le contenu est enregistré
  useEffect(() => {
    if (savedNoteId) {
      const timer = setTimeout(() => {
        setSavedNoteId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [savedNoteId]);

  // Liste des catégories disponibles
  const categories: NoteCategory[] = ['idée', 'phrase', 'mot', 'histoire', 'réflexion', 'autre'];

  // Obtenir la couleur pour la catégorie
  const getCategoryColor = (cat: NoteCategory): string => {
    const colors: Record<NoteCategory, string> = {
      'mot': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'phrase': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'idée': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'réflexion': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      'histoire': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'autre': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[cat];
  };

  // Obtenir la couleur pour l'option IA
  const getAIOptionColor = (option: AIOption): string => {
    const colors: Record<AIOption, string> = {
      'generate': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
      'arrange': 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300',
      'recommend': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
      'substitute': 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
    };
    return colors[option];
  };

  // Les options IA disponibles
  const aiOptions: { value: AIOption; label: string }[] = [
    { value: 'generate', label: 'Générer du contenu' },
    { value: 'arrange', label: 'Arranger la note' },
    { value: 'recommend', label: 'Recommandations' },
    { value: 'substitute', label: 'Enrichir le vocabulaire' }
  ];

  // Fonction pour générer du contenu avec l'IA
  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une requête');
      return;
    }

    // Vérifier si l'utilisateur a assez de points
    const canGenerate = spendPoints(POINT_COSTS.AI_GENERATION, 'Génération de contenu avec l\'IA', 'ai');
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setError('');
    setResponse(null);
    
    try {
      // Simule une réponse d'IA pour l'instant
      // À remplacer par une véritable intégration d'API d'IA
      setTimeout(() => {
        let aiResponse = '';
        
        if (aiOption === 'generate') {
          if (prompt.toLowerCase().includes('citation') || prompt.toLowerCase().includes('inspirante')) {
            aiResponse = "\"La vie est un mystère qu'il faut vivre, et non un problème à résoudre.\" - Gandhi";
          } else if (prompt.toLowerCase().includes('idée') || prompt.toLowerCase().includes('projet')) {
            aiResponse = "Voici une idée de projet: Créer une application qui utilise la réalité augmentée pour aider les gens à visualiser les meubles dans leur maison avant de les acheter.";
          } else if (prompt.toLowerCase().includes('histoire') || prompt.toLowerCase().includes('conte')) {
            aiResponse = "Il était une fois, dans un petit village niché au cœur des montagnes, un horloger qui fabriquait des montres capables de mesurer non pas le temps qui passe, mais le temps de bonheur qu'il reste à vivre. Un jour, un étranger mystérieux lui rendit visite...";
          } else if (prompt.toLowerCase().includes('recette') || prompt.toLowerCase().includes('cuisine')) {
            aiResponse = "Recette de tarte aux pommes traditionnelle:\n\nIngrédients:\n- 4 pommes\n- 1 pâte brisée\n- 50g de sucre\n- 1 cuillère à café de cannelle\n- 20g de beurre\n\nPréparation:\n1. Préchauffez le four à 180°C.\n2. Étalez la pâte dans un moule à tarte.\n3. Épluchez et coupez les pommes en fines tranches.\n4. Disposez-les sur la pâte, saupoudrez de sucre et de cannelle.\n5. Ajoutez quelques noisettes de beurre.\n6. Enfournez pour 30 minutes jusqu'à ce que la tarte soit dorée.";
          } else {
            aiResponse = "Voici une réflexion sur votre demande: " + prompt + "\n\nLes idées les plus précieuses émergent souvent quand on prend le temps de contempler profondément une question. La pensée critique et l'imagination sont les outils les plus puissants de l'esprit humain, capables de transformer des concepts abstraits en innovations concrètes qui changent le monde.";
          }
        } else if (aiOption === 'arrange') {
          aiResponse = "Voici votre texte réorganisé et amélioré:\n\n" + 
            prompt.split('. ').sort((a, b) => b.length - a.length).join('.\n\n') + 
            "\n\nJ'ai restructuré votre texte pour une meilleure clarté et un impact plus fort, en plaçant les phrases plus longues et détaillées en premier pour établir le contexte, suivies par des points plus concis.";
        } else if (aiOption === 'recommend') {
          aiResponse = "Basé sur votre note, voici quelques recommandations :\n\n" +
            "1. Considérez d'ajouter plus de détails sur " + (prompt.split(' ')[Math.floor(Math.random() * prompt.split(' ').length)]) + "\n" +
            "2. Le ton pourrait être plus " + ["formel", "engageant", "descriptif", "persuasif", "personnel"][Math.floor(Math.random() * 5)] + "\n" +
            "3. Pensez à inclure des exemples concrets pour renforcer vos arguments\n" +
            "4. Structurez votre texte avec des sous-titres pour une meilleure lisibilité\n" +
            "5. Concluez avec une synthèse puissante de vos idées principales";
        } else if (aiOption === 'substitute') {
          const enrichedVocabulary = {
            "bon": "excellent",
            "mauvais": "déplorable",
            "grand": "imposant",
            "petit": "minuscule",
            "beau": "magnifique",
            "laid": "disgracieux",
            "dire": "affirmer",
            "voir": "observer",
            "faire": "réaliser",
            "aller": "se diriger",
            "utiliser": "employer",
            "créer": "concevoir",
            "important": "crucial",
            "problème": "obstacle",
            "solution": "résolution",
            "idée": "concept",
            "penser": "considérer",
            "aimer": "affectionner"
          };
          
          let enhancedText = prompt;
          Object.entries(enrichedVocabulary).forEach(([simple, enriched]) => {
            const regex = new RegExp(`\\b${simple}\\b`, 'gi');
            enhancedText = enhancedText.replace(regex, enriched);
          });
          
          aiResponse = "Voici votre texte avec un vocabulaire enrichi:\n\n" + enhancedText + 
            "\n\nJ'ai remplacé certains mots par des synonymes plus riches et plus précis pour donner plus de nuance et d'élégance à votre texte.";
        }
        
        setResponse(aiResponse);
        setIsGenerating(false);
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de la génération de contenu:', err);
      setError('Une erreur est survenue lors de la génération de contenu');
      setIsGenerating(false);
    }
  };
  
  // Fonction pour sauvegarder la réponse de l'IA comme une note
  const saveAsNote = async () => {
    if (!response) return;
    
    try {
      const newNote: Omit<Note, 'id' | 'createdAt' | 'userId'> = {
        content: response,
        category,
        isFavorite: false,
        isArchived: false,
        tags: [],
        lastModified: new Date().toISOString(),
      };
      
      const noteId = await addNote(newNote);
      setSavedNoteId(noteId);
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la note:', err);
      setError('Une erreur est survenue lors de la sauvegarde');
    }
  };

  // Obtenir le libellé du bouton en fonction de l'option IA sélectionnée
  const getButtonLabel = () => {
    switch (aiOption) {
      case 'generate':
        return 'Générer';
      case 'arrange':
        return 'Réorganiser';
      case 'recommend':
        return 'Recommander';
      case 'substitute':
        return 'Enrichir';
      default:
        return 'Générer';
    }
  };

  // Obtenir le texte placeholder en fonction de l'option IA sélectionnée
  const getPlaceholder = () => {
    switch (aiOption) {
      case 'generate':
        return "Demandez-moi une idée, de rédiger un texte, de suggérer une citation inspirante...";
      case 'arrange':
        return "Entrez votre texte à réorganiser et améliorer...";
      case 'recommend':
        return "Collez votre texte pour recevoir des recommandations d'amélioration...";
      case 'substitute':
        return "Entrez votre texte pour que j'enrichisse son vocabulaire...";
      default:
        return "Entrez votre texte...";
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-transparent to-opacity-5 rounded-xl p-6 bright-shadow">
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
        Assistant IA
      </h2>
      
      {/* Sélecteur de catégories en haut en boutons */}
      <div className="mb-4">
        <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Sélectionnez une catégorie:
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === cat 
                ? getCategoryColor(cat)
                : 'text-white/80 hover:bg-white/10'
              }`}
              style={category !== cat ? { backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary-dark)' } : {}}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Que puis-je faire pour vous aujourd'hui?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 rounded-lg border border-opacity-10 focus:ring focus:ring-opacity-50 bg-opacity-5 min-h-[120px]"
          style={{ 
            backgroundColor: 'var(--background-lighter)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
          }}
          placeholder={getPlaceholder()}
        />
        
        {/* Sélecteur d'options IA en bas en boutons */}
        <div className="mt-4 mb-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Sélectionnez une option IA:
          </div>
          <div className="flex flex-wrap gap-2">
            {aiOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setAIOption(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  aiOption === option.value 
                  ? getAIOptionColor(option.value)
                  : 'text-white/80 hover:bg-white/10'
                }`}
                style={aiOption !== option.value ? { backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary-dark)' } : {}}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={generateContent}
            disabled={isGenerating || !prompt.trim() || !canAfford(POINT_COSTS.AI_GENERATION)}
            className="relative px-4 py-2 rounded-lg flex items-center transition-transform active:scale-95 bright-shadow"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--text-on-primary)',
              opacity: isGenerating || !prompt.trim() || !canAfford(POINT_COSTS.AI_GENERATION) ? 0.7 : 1
            }}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 9a2 2 0 114 0 2 2 0 01-4 0zm4 4a4 4 0 00-8 0v1h8v-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
                {getButtonLabel()}
              </>
            )}
            <PointCost cost={POINT_COSTS.AI_GENERATION} />
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm rounded-lg p-2" style={{ color: 'var(--error)', backgroundColor: 'var(--error-bg)' }}>
            {error}
          </div>
        )}
      </div>
      
      {response && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium" style={{ color: 'var(--primary)' }}>
              Réponse de l'IA
            </h3>
            
            <div className="flex space-x-2">
              <button
                onClick={saveAsNote}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center transition-transform active:scale-95 bright-shadow"
                style={{ 
                  backgroundColor: 'var(--primary-light)', 
                  color: 'var(--primary-dark)'
                }}
                disabled={!!savedNoteId}
              >
                {savedNoteId ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Enregistré!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    Enregistrer comme note
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (responseRef.current) {
                    const text = responseRef.current.innerText;
                    navigator.clipboard.writeText(text);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center transition-transform active:scale-95"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary-dark)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copier
              </button>
            </div>
          </div>
          
          <div 
            ref={responseRef}
            className="p-4 rounded-lg white-space-pre-line bright-shadow"
            style={{ 
              backgroundColor: 'var(--background-lighter)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-line'
            }}
          >
            {response}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
        <p>Cette fonctionnalité simule actuellement des réponses d'IA.</p>
        <p>Une intégration avec un modèle d'IA plus avancé est prévue dans une future mise à jour.</p>
      </div>
    </div>
  );
}