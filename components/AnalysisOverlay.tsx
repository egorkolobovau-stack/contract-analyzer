'use client';

import { useEffect, useState } from 'react';

const HINTS = [
  'Изучаем условия договора...',
  'Анализируем правовую структуру...',
  'Выявляем риски для вашей стороны...',
  'Проверяем соответствие законодательству...',
  'Формируем список проблемных пунктов...',
  'Оцениваем баланс интересов сторон...',
  'Формируем протокол разногласий...',
  'Подготавливаем альтернативные формулировки...',
  'Финализируем анализ...',
  'Почти готово...',
];

interface Props {
  isVisible: boolean;
}

export default function AnalysisOverlay({ isVisible }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setSeconds(0);
      setHintIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    const hintTimer = setInterval(() => {
      setHintIndex((i) => {
        const next = (i + 1) % HINTS.length;
        setFadeKey((k) => k + 1);
        return next;
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(hintTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}с`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8, 8, 16, 0.97)', backdropFilter: 'blur(20px)' }}>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-10 px-8 text-center max-w-lg">

        {/* Orbital animation */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute w-32 h-32 rounded-full border border-indigo-500/20 animate-spin-slow" />
          <div className="absolute w-24 h-24 rounded-full border border-purple-500/20"
            style={{ animation: 'spin 5s linear infinite reverse' }} />

          {/* Center icon */}
          <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-400 orb1"
              style={{ boxShadow: '0 0 8px #6366f1' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-purple-400 orb2"
              style={{ boxShadow: '0 0 6px #8b5cf6' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 orb3"
              style={{ boxShadow: '0 0 6px #22d3ee' }} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Анализируем договор
          </h2>
          <p className="text-slate-400 text-sm">
            ИИ-юрист изучает документ
          </p>
        </div>

        {/* Hint text */}
        <div className="h-8 flex items-center justify-center">
          <p
            key={fadeKey}
            className="text-indigo-300 text-base font-medium hint-text"
          >
            {HINTS[hintIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(90, (seconds / 120) * 100)}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
                transition: 'width 1s ease',
                boxShadow: '0 0 10px rgba(99,102,241,0.6)',
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-slate-300 text-sm">Время анализа:</span>
          <span className="text-white font-mono font-bold text-lg">{formatTime(seconds)}</span>
        </div>

        {/* Warning */}
        <p className="text-slate-500 text-xs max-w-xs">
          Глубокий анализ сложных договоров может занять 1–3 минуты.
          <br />Не закрывайте страницу.
        </p>
      </div>
    </div>
  );
}
