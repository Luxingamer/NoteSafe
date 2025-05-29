import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';
import { NotesProvider } from '../context/NotesContext';

// Mock des composants enfants pour isoler les tests
jest.mock('../components/NoteInput', () => {
  return function MockNoteInput() {
    return <div data-testid="note-input">Note Input</div>;
  };
});

jest.mock('../components/NoteList', () => {
  return function MockNoteList() {
    return <div data-testid="note-list">Note List</div>;
  };
});

describe('Home Component', () => {
  const renderHome = () => {
    return render(
      <NotesProvider>
        <Home />
      </NotesProvider>
    );
  };

  // Test 1: Vérification du rendu initial
  test('renders main components', () => {
    renderHome();
    expect(screen.getByTestId('note-input')).toBeInTheDocument();
    expect(screen.getByTestId('note-list')).toBeInTheDocument();
  });

  // Test 2: Changement de catégorie
  test('category selection changes active category', () => {
    renderHome();
    const personalCategory = screen.getByText(/personnel/i);
    fireEvent.click(personalCategory);
    expect(personalCategory).toHaveClass('active');
  });

  // Test 3: Changement de vue
  test('view mode changes when selecting different view', () => {
    renderHome();
    const favoritesView = screen.getByText(/favoris/i);
    fireEvent.click(favoritesView);
    expect(screen.getByTestId('view-favorites')).toBeVisible();
  });

  // Test 4: Recherche de notes
  test('search functionality works', () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'test note' } });
    expect(searchInput.value).toBe('test note');
  });

  // Test 5: Format de texte
  test('text formatting buttons work', () => {
    renderHome();
    const boldButton = screen.getByTitle(/gras/i);
    fireEvent.click(boldButton);
    // Vérifier que le texte sélectionné est mis en gras
    const noteInput = screen.getByTestId('note-input');
    expect(noteInput).toHaveValue(/\*\*.*\*\*/);
  });

  // Test 6: Import/Export
  test('import/export buttons are present', () => {
    renderHome();
    expect(screen.getByText(/importer/i)).toBeInTheDocument();
    expect(screen.getByText(/exporter/i)).toBeInTheDocument();
  });

  // Test 7: Splash Screen
  test('splash screen is shown initially and disappears', async () => {
    renderHome();
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    // Attendre que le splash screen disparaisse
    await new Promise((resolve) => setTimeout(resolve, 3000));
    expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
  });

  // Test 8: Notifications
  test('notifications appear when triggered', () => {
    renderHome();
    const actionButton = screen.getByText(/action/i);
    fireEvent.click(actionButton);
    expect(screen.getByText(/notification/i)).toBeInTheDocument();
  });
}); 