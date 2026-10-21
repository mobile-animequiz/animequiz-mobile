// Mock data for the Home screen. The Spring Boot backend will replace these constants
// (see src/services) in a later step; the shapes below are what the UI expects.

export const MOCK_PLAYER = {
  name: 'Otaku',
  level: 7,
  rankTitle: 'Caçador de Animes',
  xp: 2450,
  levelStartXp: 2000,
  nextLevelXp: 3000,
};

export const ALL_CATEGORIES_ID = 'all';

// Anime demographics used as filters ("Todos" shows every quiz).
export const MOCK_CATEGORIES = [
  { id: ALL_CATEGORIES_ID, label: 'Todos' },
  { id: 'shonen', label: 'Shonen' },
  { id: 'seinen', label: 'Seinen' },
  { id: 'shojo', label: 'Shojo' },
  { id: 'josei', label: 'Josei' },
  { id: 'kodomo', label: 'Kodomo' },
];

// difficulty: 'easy' | 'medium' | 'hard'
export const MOCK_QUIZZES = [
  { id: 'quiz-01', categoryId: 'shonen', title: 'One Piece: A Grande Era dos Piratas', questionCount: 15, difficulty: 'medium' },
  { id: 'quiz-02', categoryId: 'shonen', title: 'Naruto: O Caminho Ninja', questionCount: 10, difficulty: 'easy' },
  { id: 'quiz-03', categoryId: 'shonen', title: 'Dragon Ball: Poder de Luta', questionCount: 12, difficulty: 'hard' },
  { id: 'quiz-04', categoryId: 'seinen', title: 'Berserk: A Era de Ouro', questionCount: 20, difficulty: 'hard' },
  { id: 'quiz-05', categoryId: 'seinen', title: 'Vinland Saga: Rumo ao Oeste', questionCount: 12, difficulty: 'medium' },
  { id: 'quiz-06', categoryId: 'shojo', title: 'Fruits Basket: O Zodíaco', questionCount: 10, difficulty: 'easy' },
  { id: 'quiz-07', categoryId: 'shojo', title: 'Ouran High School Host Club', questionCount: 15, difficulty: 'medium' },
  { id: 'quiz-08', categoryId: 'josei', title: 'Nana: Vidas Cruzadas', questionCount: 12, difficulty: 'medium' },
  { id: 'quiz-09', categoryId: 'josei', title: 'Paradise Kiss', questionCount: 8, difficulty: 'easy' },
  { id: 'quiz-10', categoryId: 'kodomo', title: 'Pokémon: Mestre de Kanto', questionCount: 10, difficulty: 'easy' },
  { id: 'quiz-11', categoryId: 'kodomo', title: 'Doraemon: Gadgets do Futuro', questionCount: 10, difficulty: 'easy' },
];
