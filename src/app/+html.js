import { ScrollViewStyleReset } from 'expo-router/html';
export default function Root({ children }) {
  return <html lang="pt-BR"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0C1022" /><meta name="description" content="AnimeQuiz: teste seus conhecimentos, explore universos e acompanhe sua evolução." />
    <title>AnimeQuiz</title><ScrollViewStyleReset /></head><body>{children}</body></html>;
}
