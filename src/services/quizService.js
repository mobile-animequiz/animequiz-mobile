// Mock quiz data and read operations. Replace this module's data source with
// Spring Boot requests when the API contract is available; screens depend on
// these functions rather than on the storage mechanism.
import { MOCK_CATEGORIES, MOCK_QUIZZES } from '../utils/mockData';

const categoryLabels = Object.fromEntries(
  MOCK_CATEGORIES.map((category) => [category.id, category.label]),
);

export const MOCK_QUIZ_CATALOG = MOCK_QUIZZES.map((quiz) => ({
  ...quiz,
  category: categoryLabels[quiz.categoryId] ?? quiz.categoryId,
  categoryLabel: categoryLabels[quiz.categoryId] ?? quiz.categoryId,
}));

export const MOCK_QUIZ_QUESTIONS = {
  id: 'quiz-01',
  category: 'Shonen',
  title: 'One Piece: A Grande Era dos Piratas',
  questions: [
    {
      id: 'q1',
      text: 'Quem é o protagonista de One Piece?',
      options: ['Roronoa Zoro', 'Monkey D. Luffy', 'Portgas D. Ace', 'Trafalgar Law'],
      correctIndex: 1,
      explanation: 'Luffy sonha em encontrar o tesouro One Piece e se tornar o Rei dos Piratas.',
    },
    {
      id: 'q2',
      text: 'Qual Fruta do Diabo deu a Luffy o corpo de borracha?',
      options: ['Mera Mera no Mi', 'Hito Hito no Mi', 'Gomu Gomu no Mi', 'Gura Gura no Mi'],
      correctIndex: 2,
      explanation: 'Ao comer a Gomu Gomu no Mi, o corpo de Luffy passou a ser de borracha.',
    },
    {
      id: 'q3',
      text: 'Quem deu o chapéu de palha a Luffy?',
      options: ['Gol D. Roger', 'Barba Branca', 'Monkey D. Garp', 'Shanks'],
      correctIndex: 3,
      explanation: 'Shanks confiou o chapéu a Luffy e pediu que ele o devolvesse quando se tornasse um grande pirata.',
    },
    {
      id: 'q4',
      text: 'Qual membro do bando do Chapéu de Palha é o espadachim?',
      options: ['Roronoa Zoro', 'Sanji', 'Usopp', 'Franky'],
      correctIndex: 0,
      explanation: 'Zoro luta com o estilo de três espadas e quer ser o maior espadachim do mundo.',
    },
    {
      id: 'q5',
      text: 'Quem é a navegadora do bando do Chapéu de Palha?',
      options: ['Nico Robin', 'Tashigi', 'Nami', 'Vivi'],
      correctIndex: 2,
      explanation: 'Nami é a navegadora e cartógrafa do bando.',
    },
    {
      id: 'q6',
      text: 'Qual foi o primeiro navio do bando do Chapéu de Palha?',
      options: ['Thousand Sunny', 'Going Merry', 'Moby Dick', 'Red Force'],
      correctIndex: 1,
      explanation: 'O Going Merry foi o primeiro navio do bando, antes do Thousand Sunny.',
    },
    {
      id: 'q7',
      text: 'Qual membro do bando é o cozinheiro?',
      options: ['Usopp', 'Brook', 'Franky', 'Sanji'],
      correctIndex: 3,
      explanation: 'Sanji é o cozinheiro do bando e sonha em encontrar o All Blue.',
    },
    {
      id: 'q8',
      text: 'Que animal é Tony Tony Chopper?',
      options: ['Raposa', 'Lobo', 'Rena', 'Urso'],
      correctIndex: 2,
      explanation: 'Chopper é uma rena que comeu a Hito Hito no Mi e é o médico do bando.',
    },
    {
      id: 'q9',
      text: 'Qual Fruta do Diabo dá a Portgas D. Ace o poder do fogo?',
      options: ['Goro Goro no Mi', 'Mera Mera no Mi', 'Hie Hie no Mi', 'Magu Magu no Mi'],
      correctIndex: 1,
      explanation: 'A Mera Mera no Mi permite a Ace controlar o fogo e se transformar nele.',
    },
    {
      id: 'q10',
      text: 'Em qual cidade Gol D. Roger, o Rei dos Piratas, foi executado?',
      options: ['Marineford', 'Alabasta', 'Water 7', 'Loguetown'],
      correctIndex: 3,
      explanation: 'Gol D. Roger foi executado em Loguetown, a cidade do começo e do fim.',
    },
  ],
};

export function getQuizCatalog() {
  return MOCK_QUIZ_CATALOG;
}

export function getQuizById(quizId) {
  const metadata = MOCK_QUIZ_CATALOG.find((quiz) => quiz.id === quizId);
  if (!metadata) return null;

  // Questions are currently available only for the original One Piece mock.
  // Do not silently show One Piece questions under another anime's title.
  if (quizId !== MOCK_QUIZ_QUESTIONS.id) return { ...metadata, questions: [] };

  return { ...metadata, questions: MOCK_QUIZ_QUESTIONS.questions };
}

export const MOCK_PROFILE = {
  id: 'user-1',
  name: 'Otaku Silva',
  email: 'otaku@example.com',
  level: 7,
  rankTitle: 'Caçador de Animes',
  xp: 2450,
  levelStartXp: 2000,
  nextLevelXp: 3000,
  completedQuizzes: 24,
  correctAnswers: 243,
  totalAnswers: 312,
};

export const MOCK_USER_FAVORITES = [
  { userId: 'user-1', quizId: 'quiz-01' },
  { userId: 'user-1', quizId: 'quiz-04' },
  { userId: 'user-1', quizId: 'quiz-06' },
  { userId: 'user-1', quizId: 'quiz-08' },
  { userId: 'user-1', quizId: 'quiz-10' },
  { userId: 'user-2', quizId: 'quiz-02' },
];
