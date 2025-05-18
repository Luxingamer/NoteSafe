'use client';

import React, { useState } from 'react';
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bibliothèque</h1>
        <button
          onClick={() => setIsCreatingBook(true)}
          className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canAfford(POINT_COSTS.ADD_BOOK)}
        >
          Nouveau livre
          <PointCost cost={POINT_COSTS.ADD_BOOK} />
        </button>
      </div>

      {/* Modal de création de livre */}
      {isCreatingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Créer un nouveau livre</h2>
            <form onSubmit={handleCreateBook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Titre du livre"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newBookDescription}
                  onChange={(e) => setNewBookDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Description du livre"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur de couverture
                </label>
                <input
                  type="color"
                  value={newBookColor}
                  onChange={(e) => setNewBookColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-3">
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

      {/* Affichage des livres */}
      {!currentBook ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className="h-48 relative"
                style={{ backgroundColor: book.coverColor }}
              >
                <button
                  onClick={() => handleDeleteBook(book)}
                  className="absolute top-2 right-2 p-2 text-white/80 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{book.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {book.totalPages} page{book.totalPages !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setCurrentBook(book)}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Ouvrir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentBook.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{currentBook.description}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentBook(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Retour
              </button>
              <button
                onClick={() => setIsEditingPage(true)}
                className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canAfford(POINT_COSTS.ADD_PAGE)}
              >
                Nouvelle page
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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
                  className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canAfford(POINT_COSTS.ADD_PAGE)}
                >
                  Ajouter la page
                  <PointCost cost={POINT_COSTS.ADD_PAGE} />
                </button>
              </div>
            </div>
          )}

          {/* Liste des pages */}
          <div className="space-y-4">
            {currentBook.pages.map((page) => (
              <div
                key={page.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Page {page.pageNumber}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setPageContent(page.content);
                        setIsEditingPage(true);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {page.content}
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation de suppression */}
          <DeleteConfirmation
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDeletePage}
            title="Supprimer la page"
            message="Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible."
          />
        </div>
      )}

      {/* Confirmation de suppression de livre */}
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