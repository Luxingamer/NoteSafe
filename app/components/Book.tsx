'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useBooks, Book as BookType } from '../context/BookContext';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import DeleteConfirmation from './DeleteConfirmation';
import PointCost from './PointCost';

export default function Book() {
  const { books, currentBook, addBook, addPdfBook, deleteBook, updateBook, addPage, updatePage, deletePage, setCurrentBook, goToPage } = useBooks();
  const { spendPoints, canAfford } = usePoints();
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [newBookColor, setNewBookColor] = useState('#6366f1');
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageContent, setPageContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [showDeleteBookConfirm, setShowDeleteBookConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // États pour les PDF
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfCoverUrl, setPdfCoverUrl] = useState<string | null>(null);
  const [numPdfPages, setNumPdfPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfObjectUrls, setPdfObjectUrls] = useState<Record<string, string>>({});

  // Créer des URL d'objets pour les PDF quand nécessaire
  useEffect(() => {
    // Cette fonction crée des URL d'objets pour les livres PDF si nécessaire
    const createObjectUrls = () => {
      const newUrls: Record<string, string> = {};
      books.forEach(book => {
        if (book.bookType === 'pdf' && book.pdfData && !pdfObjectUrls[book.id]) {
          // Créer un objet Blob à partir des données base64
          try {
            const binary = atob(book.pdfData);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([array], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            newUrls[book.id] = url;
          } catch (error) {
            console.error(`Erreur lors de la création de l'URL pour ${book.title}:`, error);
          }
        }
      });
      
      if (Object.keys(newUrls).length > 0) {
        setPdfObjectUrls(prev => ({ ...prev, ...newUrls }));
      }
    };
    
    createObjectUrls();
    
    // Nettoyer les URL quand le composant est démonté
    return () => {
      Object.values(pdfObjectUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [books, pdfObjectUrls]);
  
  // Fonction pour obtenir l'URL d'un PDF
  const getPdfUrl = (book: BookType): string | undefined => {
    if (book.bookType !== 'pdf') return undefined;
    return pdfObjectUrls[book.id] || undefined;
  };

  // Fonction pour filtrer et trier les livres
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;
    if (searchTerm) {
      filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [books, searchTerm, sortBy]);

  // Fonction pour créer un nouveau livre
  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBookTitle.trim()) {
      const canCreate = spendPoints(POINT_COSTS.ADD_BOOK, 'Création d\'un nouveau livre', 'book');
      if (!canCreate) return;

      addBook(newBookTitle.trim(), newBookDescription.trim(), newBookColor);
      setNewBookTitle('');
      setNewBookDescription('');
      setNewBookColor('#6366f1');
      setIsCreatingBook(false);
    }
  };

  // Fonction pour ajouter une nouvelle page
  const handleAddPage = () => {
    if (currentBook && pageContent.trim()) {
      const canAddPage = spendPoints(POINT_COSTS.ADD_PAGE, 'Ajout d\'une nouvelle page', 'page');
      if (!canAddPage) return;

      addPage(currentBook.id, pageContent.trim());
      setPageContent('');
      setIsEditingPage(false);
    }
  };

  // Fonction pour supprimer une page
  const handleDeletePage = (pageId: string) => {
    setPageToDelete(pageId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePage = () => {
    if (currentBook && pageToDelete) {
      deletePage(currentBook.id, pageToDelete);
      setPageToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  // Fonction pour supprimer un livre
  const handleDeleteBook = (book: BookType) => {
    setBookToDelete(book);
    setShowDeleteBookConfirm(true);
  };

  const confirmDeleteBook = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
      setBookToDelete(null);
    }
    setShowDeleteBookConfirm(false);
  };

  // Fonction pour zoomer/dézoomer dans le PDF
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setPdfScale(prev => Math.min(prev + 0.2, 2.5));
    } else {
      setPdfScale(prev => Math.max(prev - 0.2, 0.5));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* En-tête avec les contrôles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bibliothèque</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="date">Trier par date</option>
                <option value="title">Trier par titre</option>
              </select>
              <button
                onClick={() => setIsCreatingBook(true)}
                className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={!canAfford(POINT_COSTS.ADD_BOOK)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouveau livre</span>
                <PointCost cost={POINT_COSTS.ADD_BOOK} />
              </button>
              <button
                onClick={() => setIsImportingPdf(true)}
                className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={!canAfford(POINT_COSTS.ADD_BOOK)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Importer PDF</span>
                <PointCost cost={POINT_COSTS.ADD_BOOK} />
              </button>
            </div>
          </div>
        </div>

        {/* Affichage des livres */}
        {!currentBook ? (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
            "flex flex-col space-y-4"
          }>
            {filteredAndSortedBooks.map(book => (
              <div
                key={book.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-102 ${
                  viewMode === 'grid' ? 'flex flex-col' : 'flex items-center space-x-4'
                }`}
                style={{
                  borderLeft: `6px solid ${book.coverColor}`,
                }}
              >
                {book.bookType === 'pdf' && book.coverUrl && (
                  <div className={`${viewMode === 'grid' ? 'h-48' : 'h-32 w-24'} overflow-hidden flex-shrink-0`}>
                    <img 
                      src={book.coverUrl} 
                      alt={`Couverture de ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 truncate">{book.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{book.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setCurrentBook(book)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ouvrir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>
                        {book.bookType === 'pdf' ? (
                          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                        {book.totalPages || book.pages.length} pages
                      </span>
                      {!book.synced && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full text-xs">
                          Non synchronisé
                        </span>
                      )}
                    </div>
                    <span>Mis à jour le {new Date(book.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentBook.title}</h2>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {currentBook.bookType === 'pdf' ? `${currentBook.totalPages} pages PDF` : `${currentBook.pages.length} pages`}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{currentBook.description}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentBook(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Retour
                </button>
                {currentBook.bookType === 'text' && (
                  <button
                    onClick={() => setIsEditingPage(true)}
                    className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={!canAfford(POINT_COSTS.ADD_PAGE)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nouvelle page</span>
                    <PointCost cost={POINT_COSTS.ADD_PAGE} />
                  </button>
                )}
              </div>
            </div>

            {/* Affichage du PDF ou de l'éditeur de page selon le type de livre */}
            {currentBook.bookType === 'pdf' ? (
              <div className="mt-6">
                {/* Contrôles du PDF */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(Math.max(1, (currentBook.currentPage || 1) - 1))}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                      disabled={(currentBook.currentPage || 1) <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                      Page {currentBook.currentPage || 1} / {currentBook.totalPages || 1}
                    </span>
                    <button
                      onClick={() => goToPage(Math.min((currentBook.currentPage || 1) + 1, currentBook.totalPages || 1))}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                      disabled={(currentBook.currentPage || 1) >= (currentBook.totalPages || 1)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {Math.round(pdfScale * 100)}%
                    </span>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Affichage du PDF */}
                {currentBook.pdfData && (
                  <div className="flex justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[85vh]">
                    <iframe
                      src={getPdfUrl(currentBook) || ''}
                      width="100%"
                      height="800px"
                      className="w-full"
                      style={{ minHeight: '800px' }}
                      frameBorder="0"
                    ></iframe>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Éditeur de page */}
                {isEditingPage && (
                  <div className="mb-6">
                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Contenu de la page..."
                      rows={6}
                    />
                    <div className="flex justify-end space-x-3 mt-3">
                      <button
                        onClick={() => {
                          setPageContent('');
                          setIsEditingPage(false);
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAddPage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Ajouter la page
                      </button>
                    </div>
                  </div>
                )}

                {/* Liste des pages */}
                <div className="space-y-4">
                  {currentBook.pages.map((page) => (
                    <div
                      key={page.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800 dark:text-white">Page {page.pageNumber}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setPageContent(page.content);
                              setIsEditingPage(true);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Modifier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{page.content}</p>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Dernière modification le {new Date(page.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de création de livre */}
      {isCreatingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Créer un nouveau livre</h2>
            <form onSubmit={handleCreateBook}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Titre du livre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newBookDescription}
                    onChange={(e) => setNewBookDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Description du livre"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur de couverture
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newBookColor}
                      onChange={(e) => setNewBookColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Choisissez une couleur pour la couverture
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreatingBook(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'importation de PDF */}
      {isImportingPdf && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Importer un livre PDF</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fichier PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      setPdfFile(file);
                      setPdfTitle(file.name.replace(/\.pdf$/i, ''));
                      setPdfDescription('');
                      setPdfCoverUrl(null);
                      setNumPdfPages(0);
                      setIsImportingPdf(true);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                {pdfCoverUrl && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={pdfCoverUrl} 
                      alt="Couverture PDF" 
                      className="h-40 object-contain border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                )}
                {numPdfPages > 0 && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {numPdfPages} pages détectées
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Titre du livre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Description du livre"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setPdfTitle('');
                  setPdfDescription('');
                  setPdfCoverUrl(null);
                  setNumPdfPages(0);
                  setIsImportingPdf(false);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (pdfFile) {
                    const canImport = spendPoints(POINT_COSTS.ADD_BOOK, 'Importation d\'un livre PDF', 'book');
                    if (canImport) {
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        if (e.target && e.target.result) {
                          const pdfBase64 = (e.target.result as string).split(',')[1];
                          // Créer la couverture si nécessaire
                          if (!pdfCoverUrl) {
                            // Utiliser une couverture par défaut basée sur la couleur
                            const canvas = document.createElement('canvas');
                            canvas.width = 200;
                            canvas.height = 300;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.fillStyle = '#6366f1'; // Couleur par défaut
                              ctx.fillRect(0, 0, 200, 300);
                              ctx.fillStyle = 'white';
                              ctx.font = 'bold 20px Arial';
                              ctx.textAlign = 'center';
                              ctx.fillText(pdfTitle || 'PDF Document', 100, 150);
                              setPdfCoverUrl(canvas.toDataURL('image/jpeg'));
                            }
                          }
                          
                          // Ajouter le livre PDF avec l'URL de la couverture
                          addPdfBook(pdfTitle, pdfDescription, pdfCoverUrl, pdfBase64);
                          
                          // Réinitialiser les états
                          setPdfFile(null);
                          setPdfTitle('');
                          setPdfDescription('');
                          setPdfCoverUrl(null);
                          setNumPdfPages(0);
                          setIsImportingPdf(false);
                        }
                      };
                      reader.readAsDataURL(pdfFile);
                    }
                  }
                }}
                disabled={!pdfFile || !pdfTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePage}
        title="Supprimer la page"
        message="Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible."
      />

      <DeleteConfirmation
        isOpen={showDeleteBookConfirm}
        onClose={() => setShowDeleteBookConfirm(false)}
        onConfirm={confirmDeleteBook}
        title="Supprimer le livre"
        message={`Êtes-vous sûr de vouloir supprimer le livre "${bookToDelete?.title}" ? Cette action est irréversible.`}
      />
    </div>
  );
}