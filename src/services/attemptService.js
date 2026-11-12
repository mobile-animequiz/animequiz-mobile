import { apiPost } from './apiClient';

function toBackendId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Uma questão ou alternativa possui identificador inválido.');
  }
  return id;
}

/** Sends only the player's choices. Scoring and correctness belong to the API. */
export async function submitQuizAttempt(quizId, answers) {
  const id = toBackendId(quizId);
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error('Responda ao menos uma questão antes de finalizar.');
  }
  const request = {
    answers: answers.map((answer) => ({
      questionId: toBackendId(answer.questionId),
      optionId: toBackendId(answer.optionId),
    })),
  };
  const result = await apiPost(`quizzes/${id}/attempts`, request);
  if (
    !result || result.quizId !== id
    || !Number.isInteger(result.points)
    || !Number.isInteger(result.correctAnswers)
    || !Number.isInteger(result.totalQuestions)
  ) {
    throw new Error('A API não retornou um resultado oficial válido.');
  }
  return result;
}
