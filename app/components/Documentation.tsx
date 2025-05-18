'use client';

import React, { useState } from 'react';

// Types pour les sections de documentation
type DocSection = 'introduction' | 'interface' | 'notes' | 'categories' | 'outils' | 'raccourcis' | 'faq';

export default function Documentation() {
  // État pour la section active
  const [activeSection, setActiveSection] = useState<DocSection>('introduction');

  // Fonction pour changer de section
  const changeSection = (section: DocSection) => {
    setActiveSection(section);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Barre latérale de navigation */}
        <div className="md:w-64 bg-gray-50 dark:bg-gray-900 p-4">
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Documentation</h2>
          <nav className="space-y-1">
            <button
              onClick={() => changeSection('introduction')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'introduction'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'introduction' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'introduction' ? 'var(--primary)' : undefined
              }}
            >
              Introduction
            </button>
            
            <button
              onClick={() => changeSection('interface')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'interface'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'interface' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'interface' ? 'var(--primary)' : undefined
              }}
            >
              Interface utilisateur
            </button>
            
            <button
              onClick={() => changeSection('notes')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'notes'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'notes' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'notes' ? 'var(--primary)' : undefined
              }}
            >
              Gestion des notes
            </button>
            
            <button
              onClick={() => changeSection('categories')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'categories'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'categories' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'categories' ? 'var(--primary)' : undefined
              }}
            >
              Catégories
            </button>
            
            <button
              onClick={() => changeSection('outils')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'outils'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'outils' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'outils' ? 'var(--primary)' : undefined
              }}
            >
              Outils et fonctionnalités
            </button>
            
            <button
              onClick={() => changeSection('raccourcis')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'raccourcis'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'raccourcis' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'raccourcis' ? 'var(--primary)' : undefined
              }}
            >
              Raccourcis clavier
            </button>
            
            <button
              onClick={() => changeSection('faq')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === 'faq'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              style={{ 
                backgroundColor: activeSection === 'faq' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
                color: activeSection === 'faq' ? 'var(--primary)' : undefined
              }}
            >
              FAQ
            </button>
          </nav>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === 'introduction' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenue sur NoteSafe</h2>
              <p className="text-gray-600 dark:text-gray-300">
                NoteSafe est une application moderne et sécurisée pour prendre des notes, capturer vos idées et organiser vos pensées. 
                Conçue pour être à la fois simple et puissante, NoteSafe vous permet de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Créer et organiser des notes dans différentes catégories</li>
                <li>Formater vos notes avec du texte riche (gras, italique, listes, etc.)</li>
                <li>Marquer vos notes importantes comme favorites</li>
                <li>Archiver les notes que vous souhaitez conserver mais ne plus voir régulièrement</li>
                <li>Visualiser vos notes dans un calendrier</li>
                <li>Suivre vos habitudes d'écriture avec des statistiques</li>
                <li>Personnaliser l'interface avec différents thèmes</li>
                <li>Importer et exporter vos notes</li>
                <li>Recevoir des notifications sur les activités importantes</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                Cette documentation vous guidera à travers toutes les fonctionnalités de NoteSafe pour vous aider
                à tirer le meilleur parti de l'application.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Pour commencer</h3>
                <p className="text-blue-600 dark:text-blue-300">
                  Cliquez sur l'icône <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">+</span> en haut ou commencez à taper dans le champ "Qu'avez-vous en tête ?" 
                  sur la page d'accueil pour créer votre première note.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'interface' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Interface utilisateur</h2>
              <p className="text-gray-600 dark:text-gray-300">
                L'interface de NoteSafe est conçue pour être intuitive et facile à utiliser. Voici les principaux éléments de l'interface :
              </p>
              
              <div className="space-y-6 mt-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Barre supérieure</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Située en haut de l'application, elle contient :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Le logo NoteSafe (cliquez dessus pour revenir à l'accueil)</li>
                    <li>Les filtres de catégories (Toutes, Mots, Phrases, Idées, Réflexions, Histoires)</li>
                    <li>La barre de recherche</li>
                    <li>Les boutons d'actions rapides (Créer, Importer, Exporter)</li>
                    <li>L'accès aux paramètres</li>
                  </ul>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Barre latérale</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Située à gauche de l'écran, elle donne accès aux fonctionnalités spéciales :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                    <li><span className="text-orange-400">Mode Livre</span> - Pour lire vos notes dans un format agréable</li>
                    <li><span className="text-cyan-400">Intelligence Artificielle</span> - Pour générer et améliorer vos notes</li>
                    <li><span className="text-pink-400">Notifications</span> - Pour gérer vos alertes et rappels</li>
                    <li><span className="text-green-400">Documentation</span> - Le guide que vous êtes en train de lire</li>
                    <li><span className="text-amber-400">Succès</span> - Pour suivre vos accomplissements</li>
                  </ul>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Zone de saisie</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    La zone principale pour créer de nouvelles notes comprend :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Un champ de texte pour saisir votre note</li>
                    <li>Des options de formatage (gras, italique, souligné, listes)</li>
                    <li>Un sélecteur de catégorie</li>
                    <li>Un bouton pour enregistrer la note</li>
                  </ul>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Liste de notes</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Affiche toutes vos notes avec :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Le contenu de la note</li>
                    <li>La date de création/modification</li>
                    <li>La catégorie</li>
                    <li>Des boutons d'action (Favoris, Modifier, Supprimer, Archiver)</li>
                  </ul>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Bouton Accueil</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Présent dans les modes filtrés ou spéciaux, il vous permet de revenir rapidement à la vue principale de toutes vos notes.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-2">Astuce</h3>
                <p className="text-amber-600 dark:text-amber-300">
                  Vous pouvez changer l'apparence de NoteSafe en accédant aux Paramètres et en sélectionnant un thème différent.
                  Essayez les thèmes Bleu, Vert, Orange, Rouge ou Sombre Élégant pour personnaliser votre expérience.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'notes' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des notes</h2>
              <p className="text-gray-600 dark:text-gray-300">
                NoteSafe vous offre de nombreuses fonctionnalités pour créer, organiser et gérer vos notes efficacement.
              </p>
              
              <div className="space-y-6 mt-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Créer une note</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Saisissez votre texte dans le champ "Saisissez votre note ici..."</li>
                    <li>Utilisez la syntaxe Markdown pour mettre en forme votre texte (voir section Formatage)</li>
                    <li>Sélectionnez une catégorie dans le menu déroulant (Mot, Phrase, Idée, Réflexion, Histoire)</li>
                    <li>Cliquez sur "Enregistrer" pour créer la note</li>
                  </ol>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Formatage des notes</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    NoteSafe supporte le formatage Markdown pour une meilleure organisation et lisibilité de vos notes.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Titres</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
                        # Titre principal<br/>
                        ## Sous-titre<br/>
                        ### Petit titre
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Mise en forme du texte</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
                        **Texte important**<br/>
                        *Texte en italique*<br/>
                        `Code ou terme technique`
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Listes</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
                        - Liste à puces<br/>
                        - Autre élément<br/>
                        <br/>
                        1. Liste numérotée<br/>
                        2. Deuxième élément
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Citations</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
                        {String.fromCharCode(62)} Une citation importante
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Astuce : Lors de l'édition d'une note, un guide de formatage est disponible sous la zone de texte.
                    </p>
                  </div>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Modifier une note</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Localisez la note que vous souhaitez modifier</li>
                    <li>Cliquez sur le bouton "Modifier" en bas de la note</li>
                    <li>Effectuez vos modifications en utilisant la syntaxe Markdown</li>
                    <li>Vous pouvez également changer la catégorie de la note</li>
                    <li>Cliquez sur "Enregistrer" pour confirmer les modifications</li>
                  </ol>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Note :</span> Le formatage de vos notes est préservé même après modification.
                      Vous pouvez voir l'aperçu du formatage en temps réel pendant l'édition.
                    </p>
                  </div>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Exemples de formatage</h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Note avec titres et listes</h4>
                      <div className="prose prose-sm dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: `
                          <h1>Mon projet</h1>
                          <h2>Objectifs</h2>
                          <ul>
                            <li>Améliorer la productivité</li>
                            <li>Réduire les coûts</li>
                          </ul>
                          <h2>Étapes</h2>
                          <ol>
                            <li>Analyse des besoins</li>
                            <li>Développement</li>
                            <li>Tests</li>
                          </ol>
                        `}} />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Note avec citation et code</h4>
                      <div className="prose prose-sm dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: `
                          <blockquote>La simplicité est la sophistication suprême.</blockquote>
                          <p>Pour installer le projet, utilisez la commande : <code>npm install</code></p>
                          <p>Points importants :</p>
                          <p><strong>Sécurité</strong> - Toujours vérifier les permissions</p>
                          <p><em>Note : Mettre à jour régulièrement</em></p>
                        `}} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Supprimer une note</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Localisez la note que vous souhaitez supprimer</li>
                    <li>Cliquez sur l'icône de suppression (corbeille) sur la note</li>
                    <li>Confirmez la suppression dans la boîte de dialogue qui apparaît</li>
                  </ol>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    <strong>Note :</strong> La suppression est définitive. Envisagez d'archiver la note si vous pourriez en avoir besoin plus tard.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Marquer comme favori</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Pour marquer une note comme favorite, cliquez sur l'icône d'étoile sur la note. Les notes favorites peuvent être
                    consultées en cliquant sur "Favoris" dans la barre supérieure ou via la barre latérale.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Archiver une note</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    L'archivage vous permet de conserver des notes importantes sans qu'elles n'encombrent votre vue principale.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Cliquez sur l'icône d'archive sur la note</li>
                    <li>Pour voir vos archives, cliquez sur "Archives" dans la barre supérieure</li>
                    <li>Pour désarchiver une note, cliquez à nouveau sur l'icône d'archive depuis la vue Archives</li>
                  </ol>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Recherche de notes</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Pour trouver rapidement une note spécifique :
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Cliquez sur l'icône de recherche dans la barre supérieure</li>
                    <li>Saisissez votre terme de recherche</li>
                    <li>Les résultats s'afficheront automatiquement, filtrés selon votre requête</li>
                    <li>Cliquez sur "Accueil" pour revenir à la vue normale</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Conseil de productivité</h3>
                <p className="text-green-600 dark:text-green-300">
                  Utilisez les catégories de manière cohérente pour faciliter l'organisation et la recherche de vos notes.
                  Par exemple, utilisez "Idée" pour les concepts brefs, "Réflexion" pour les pensées plus développées, et
                  "Histoire" pour les récits ou anecdotes complètes.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'categories' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Catégories</h2>
              <p className="text-gray-600 dark:text-gray-300">
                NoteSafe organise vos notes en différentes catégories pour vous aider à mieux structurer vos pensées.
                Chaque catégorie est conçue pour un type spécifique de contenu.
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mot</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Idéale pour enregistrer des termes individuels, des définitions ou des mots que vous souhaitez retenir.
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">Exemple : "Sérendipité - Découverte heureuse faite par hasard"</p>
                    </div>
                  </div>
                  
                  <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Phrase</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Parfaite pour les citations, expressions ou courtes phrases mémorables.
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">Exemple : "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre."</p>
                    </div>
                  </div>
                  
                  <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Idée</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Utilisez cette catégorie pour capturer rapidement des idées, des concepts ou des inspirations soudaines.
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">Exemple : "Application qui permet de scanner les ingrédients des produits et suggère des alternatives plus saines."</p>
                    </div>
                  </div>
                  
                  <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Réflexion</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Pour les pensées plus développées, les analyses ou les observations personnelles.
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">Exemple : "Je me demande si notre dépendance aux technologies affecte notre capacité à apprécier les moments simples de la vie..."</p>
                    </div>
                  </div>
                  
                  <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Histoire</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Idéale pour les récits plus longs, les anecdotes personnelles ou les histoires que vous souhaitez préserver.
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">Exemple : "Hier, lors de ma promenade au parc, j'ai rencontré un vieil homme qui jouait de l'accordéon..."</p>
                    </div>
                  </div>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Filtrer par catégorie</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pour voir uniquement les notes d'une catégorie spécifique :
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Cliquez sur la catégorie souhaitée dans la barre supérieure</li>
                    <li>La liste se met à jour pour n'afficher que les notes de cette catégorie</li>
                    <li>Pour revenir à toutes les notes, cliquez sur "Toutes"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">Personnalisation</h3>
                <p className="text-purple-600 dark:text-purple-300">
                  Vous pouvez demander des catégories supplémentaires via la section Paramètres > Feedback.
                  Nous évaluons régulièrement les suggestions des utilisateurs pour améliorer l'application.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'outils' && (
            <div className="space-y-6 mt-4">
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Notifications</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Le système de notifications vous informe des actions importantes :
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Confirmation de suppression de notes</li>
                  <li>Restauration depuis la corbeille</li>
                  <li>Notifications système</li>
                  <li>Alertes importantes</li>
                </ul>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Corbeille</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  La corbeille conserve temporairement vos notes supprimées :
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Restauration possible des notes</li>
                  <li>Suppression définitive</li>
                  <li>Vidage de la corbeille</li>
                  <li>Conservation pendant 30 jours</li>
                </ul>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Thèmes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Personnalisez l&apos;apparence de l&apos;application :
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Mode clair/sombre</li>
                  <li>Adaptation automatique au thème système</li>
                  <li>Interface responsive</li>
                </ul>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Sauvegarde automatique</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Vos notes sont automatiquement sauvegardées :
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Sauvegarde en temps réel</li>
                  <li>Persistance locale des données</li>
                  <li>Pas de perte de données en cas de fermeture accidentelle</li>
                </ul>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Confirmation de suppression</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Protection contre les suppressions accidentelles :
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Délai de confirmation personnalisable</li>
                  <li>Annulation possible pendant le compte à rebours</li>
                  <li>Notification de confirmation</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeSection === 'raccourcis' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Raccourcis clavier</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Pour gagner du temps et être plus productif, NoteSafe propose plusieurs raccourcis clavier pratiques.
              </p>
              
              <div className="border dark:border-gray-700 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Raccourcis généraux</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + N</span>
                    <span className="text-gray-600 dark:text-gray-300">Nouvelle note</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + F</span>
                    <span className="text-gray-600 dark:text-gray-300">Rechercher</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + S</span>
                    <span className="text-gray-600 dark:text-gray-300">Enregistrer la note</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + I</span>
                    <span className="text-gray-600 dark:text-gray-300">Importer des notes</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + E</span>
                    <span className="text-gray-600 dark:text-gray-300">Exporter des notes</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + ,</span>
                    <span className="text-gray-600 dark:text-gray-300">Paramètres</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Esc</span>
                    <span className="text-gray-600 dark:text-gray-300">Fermer le modal actif</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + H</span>
                    <span className="text-gray-600 dark:text-gray-300">Retour à l'accueil</span>
                  </div>
                </div>
              </div>
              
              <div className="border dark:border-gray-700 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Raccourcis de formatage de texte</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + B</span>
                    <span className="text-gray-600 dark:text-gray-300">Texte en gras</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + I</span>
                    <span className="text-gray-600 dark:text-gray-300">Texte en italique</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + U</span>
                    <span className="text-gray-600 dark:text-gray-300">Texte souligné</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + Shift + L</span>
                    <span className="text-gray-600 dark:text-gray-300">Liste à puces</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Ctrl + Shift + N</span>
                    <span className="text-gray-600 dark:text-gray-300">Liste numérotée</span>
                  </div>
                </div>
              </div>
              
              <div className="border dark:border-gray-700 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Raccourcis de navigation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + 1</span>
                    <span className="text-gray-600 dark:text-gray-300">Vue principale</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + 2</span>
                    <span className="text-gray-600 dark:text-gray-300">Vue favoris</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + 3</span>
                    <span className="text-gray-600 dark:text-gray-300">Vue archives</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + 4</span>
                    <span className="text-gray-600 dark:text-gray-300">Vue récents</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + C</span>
                    <span className="text-gray-600 dark:text-gray-300">Calendrier</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono text-sm mr-3">Alt + S</span>
                    <span className="text-gray-600 dark:text-gray-300">Statistiques</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Conseil</h3>
                <p className="text-blue-600 dark:text-blue-300">
                  Vous pouvez consulter cette liste de raccourcis à tout moment en appuyant sur <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + ?</span> 
                  depuis n'importe quelle page de l'application.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'faq' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Questions fréquentes</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Retrouvez les réponses aux questions les plus courantes sur NoteSafe.
              </p>
              
              <div className="mt-6 space-y-6">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mes notes sont-elles sécurisées ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Oui, NoteSafe utilise un chiffrement de bout en bout pour protéger vos notes. Seul vous pouvez y accéder avec votre
                    identifiant et mot de passe. De plus, vous pouvez activer l'authentification à deux facteurs dans les paramètres pour
                    une sécurité renforcée.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Puis-je accéder à mes notes hors ligne ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Oui, NoteSafe est conçu pour fonctionner hors ligne. Vos notes sont synchronisées automatiquement lorsque vous êtes connecté
                    à Internet, mais vous pouvez les consulter et les modifier même sans connexion. Les modifications seront synchronisées
                    lors de votre prochaine connexion.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Comment récupérer une note supprimée ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Les notes supprimées sont conservées dans la corbeille pendant 30 jours. Pour récupérer une note, accédez à la 
                    corbeille dans les paramètres et cliquez sur "Restaurer" à côté de la note que vous souhaitez récupérer.
                    Après 30 jours, les notes sont définitivement supprimées.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Existe-t-il une limite au nombre de notes ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    La version gratuite de NoteSafe vous permet de créer jusqu'à 100 notes. Pour un stockage illimité, vous pouvez
                    passer à NoteSafe Premium, qui offre également des fonctionnalités supplémentaires comme des options de formatage avancées,
                    des thèmes exclusifs et la priorité pour les nouvelles fonctionnalités.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">NoteSafe est-il disponible sur mobile ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Oui, NoteSafe est disponible sur iOS et Android. Téléchargez l'application depuis l'App Store ou Google Play
                    pour accéder à vos notes depuis n'importe où. Toutes vos notes sont automatiquement synchronisées entre vos appareils.
                  </p>
                </div>
                
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Comment contacter le support ?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pour toute question ou problème, vous pouvez contacter notre équipe de support via :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300 mt-2">
                    <li>Email : support@notesafe.com</li>
                    <li>Chat en direct : disponible depuis les paramètres</li>
                    <li>Centre d'aide : help.notesafe.com</li>
                  </ul>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Notre équipe s'engage à répondre à toutes les demandes dans un délai de 24 heures.
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Vous avez d'autres questions ?</h3>
                <p className="text-green-600 dark:text-green-300">
                  Consultez notre centre d'aide complet ou contactez-nous directement. Nous sommes là pour vous aider !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 