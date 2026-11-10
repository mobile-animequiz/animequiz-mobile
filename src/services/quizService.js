import { apiGet } from './apiClient';

const CATEGORY_LABELS = {
  shonen: 'Shonen', seinen: 'Seinen', shojo: 'Shojo', josei: 'Josei', kodomo: 'Kodomo',
};

function firstValue(source, keys, fallback = undefined) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
}

function unwrapCollection(response, preferredKeys = []) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];
  for (const key of preferredKeys) {
    if (Array.isArray(response[key])) return response[key];
  }
  if (response._embedded && typeof response._embedded === 'object') {
    const collections = Object.values(response._embedded).filter(Array.isArray);
    if (collections.length) return collections[0];
  }
  if (Array.isArray(response.content)) return response.content;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function normalizeCategory(raw) {
  if (!raw) return { categoryId: 'other', categoryLabel: 'Geral' };
  const value = typeof raw === 'object'
    ? firstValue(raw, ['code', 'name', 'label', 'value'], 'other')
    : raw;
  const categoryId = String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  return {
    categoryId,
    categoryLabel: CATEGORY_LABELS[categoryId] ?? String(value),
  };
}

function normalizeDifficulty(raw) {
  const value = typeof raw === 'object'
    ? firstValue(raw, ['code', 'name', 'label', 'value'], 'medium')
    : raw;
  const normalized = String(value ?? 'medium').toLowerCase();
  if (['easy', 'facil', 'fácil', '1'].includes(normalized)) return 'easy';
  if (['hard', 'dificil', 'difícil', '3'].includes(normalized)) return 'hard';
  return 'medium';
}

export function normalizeQuiz(resource) {
  const category = normalizeCategory(firstValue(resource, ['category', 'genre', 'demographic', 'categoryName']));
  const id = firstValue(resource, ['id', 'quizId']);
  if (id === undefined || id === null) return null;
  return {
    id: String(id),
    title: String(firstValue(resource, ['title', 'name'], 'Quiz sem título')),
    questionCount: Number(firstValue(resource, ['questionCount', 'totalQuestions', 'questionsCount'], 0)) || 0,
    difficulty: normalizeDifficulty(firstValue(resource, ['difficulty', 'level'])),
    ...category,
  };
}

function normalizeOption(option) {
  if (!option || typeof option !== 'object') return null;
  const id = firstValue(option, ['id', 'optionId', 'value']);
  const text = firstValue(option, ['text', 'content', 'description', 'label', 'name']);
  if (id === undefined || text === undefined) return null;
  // Deliberately ignore correctness fields: the answer key must never be needed by the app.
  return { id: String(id), text: String(text) };
}

export function normalizeQuestion(resource) {
  const id = firstValue(resource, ['id', 'questionId']);
  let rawOptions = firstValue(resource, ['options', 'alternatives', 'answers'], []);
  if ((!Array.isArray(rawOptions) || rawOptions.length === 0) && resource?._embedded) {
    rawOptions = Object.values(resource._embedded).find(Array.isArray) ?? [];
  }
  const options = unwrapCollection(rawOptions).map(normalizeOption).filter(Boolean);
  if (id === undefined || options.length < 2) return null;
  return {
    id: String(id),
    text: String(firstValue(resource, ['text', 'statement', 'content', 'question'], '')),
    options,
  };
}

export async function getQuizCatalog() {
  const response = await apiGet('quizzes', { query: { page: 0, size: 100 } });
  return unwrapCollection(response, ['quizzes', 'quizList']).map(normalizeQuiz).filter(Boolean);
}

export async function getQuizById(quizId) {
  const response = await apiGet(`quizzes/${encodeURIComponent(quizId)}`);
  return normalizeQuiz(response?.data ?? response?.quiz ?? response);
}

export async function getQuizQuestions(quizId) {
  const response = await apiGet(`quizzes/${encodeURIComponent(quizId)}/questions`, {
    query: { page: 0, size: 100 },
  });
  return unwrapCollection(response, ['questions', 'questionList'])
    .map(normalizeQuestion)
    .filter(Boolean);
}
