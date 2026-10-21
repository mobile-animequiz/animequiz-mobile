import { useMemo, useState } from 'react';

import { getLevelProgress } from '../utils/progress';
import {
  ALL_CATEGORIES_ID,
  MOCK_CATEGORIES,
  MOCK_PLAYER,
  MOCK_QUIZZES,
} from '../utils/mockData';

// Logic of the Home screen: player status, category filter (useState) and the filtered quiz list.
// Everything comes from mock data for now; swap the sources here (or call a service in an
// effect) when the backend is available, the screen does not need to change.
export default function useHomeData() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_ID);

  const player = useMemo(
    () => ({ ...MOCK_PLAYER, progress: getLevelProgress(MOCK_PLAYER) }),
    [],
  );

  const quizzes = useMemo(() => {
    const labels = Object.fromEntries(MOCK_CATEGORIES.map((category) => [category.id, category.label]));
    const visible =
      selectedCategoryId === ALL_CATEGORIES_ID
        ? MOCK_QUIZZES
        : MOCK_QUIZZES.filter((quiz) => quiz.categoryId === selectedCategoryId);

    return visible.map((quiz) => ({ ...quiz, categoryLabel: labels[quiz.categoryId] }));
  }, [selectedCategoryId]);

  return {
    player,
    categories: MOCK_CATEGORIES,
    selectedCategoryId,
    selectCategory: setSelectedCategoryId,
    quizzes,
  };
}
