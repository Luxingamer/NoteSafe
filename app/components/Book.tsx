'use client';

import React, { useState, useMemo } from 'react';
import { useBooks, Book as BookType } from '../context/BookContext';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import DeleteConfirmation from './DeleteConfirmation';
import PointCost from './PointCost';

export default function Book() {
  const { books, currentBook, addBook, deleteBook, updateBook, addPage, updatePage, deletePage, setCurrentBook, goToPage } = useBooks();
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

  // Fonction pour mettre à jour une page
  const handleUpdatePage = (pageId: string) => {
    if (currentBook && pageContent.trim()) {
      updatePage(currentBook.id, pageId, pageContent.trim());
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
                  viewMode === 'grid' ? '' : 'flex items-center space-x-4'
                }`}
                style={{
                  borderLeft: `6px solid ${book.coverColor}`,
                }}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{book.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{book.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                    <span>{book.pages.length} pages</span>
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
                    {currentBook.pages.length} pages
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
              </div>
            </div>

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
              {currentBook.pages.map((page, index) => (
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