import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Анализатор договоров — AI-юрист',
  description:
    'Профессиональный анализ договоров с использованием искусственного интеллекта. Выявление рисков, протокол разногласий.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
