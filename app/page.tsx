'use client';

import { useState } from 'react';
import FileUploadZone from '@/components/FileUploadZone';
import AnalysisOverlay from '@/components/AnalysisOverlay';
import ResultsView from '@/components/ResultsView';
import type { AnalysisResult } from '@/lib/types';

type Role = 'customer' | 'contractor';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [role, setRole] = useState<Role>('customer');
  const [comments, setComments] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Пожалуйста, загрузите хотя бы один файл договора');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('role', role);
      if (comments.trim()) formData.append('comments', comments);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при анализе');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFiles([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <AnalysisOverlay isVisible={isAnalyzing} />

      {/* Header */}
      <header className="sticky top-0 z-40 py-4 px-6"
        style={{
          background: 'rgba(8,8,16,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white">Анализатор договоров</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-юрист
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!result ? (
          <div>
            {/* Hero */}
            <div className="text-center mb-12 pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Работает на Claude AI
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                <span className="text-white">Анализ договора</span>
                <br />
                <span className="gradient-text">за считанные минуты</span>
              </h1>

              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Загрузите договор — получите детальный юридический анализ рисков
                и готовый протокол разногласий с альтернативными формулировками
              </p>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {[
                  { icon: '⚠️', text: 'Выявление рисков' },
                  { icon: '🔍', text: 'Проблемные пункты' },
                  { icon: '📝', text: 'Протокол разногласий' },
                  { icon: '💡', text: 'Рекомендации' },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
                    <span>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload form */}
            <div className="card p-6 mb-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>1</div>
                <h2 className="font-semibold text-white">Загрузите файлы договора</h2>
              </div>
              <FileUploadZone files={files} onChange={setFiles} />
            </div>

            {/* Role selection */}
            <div className="card p-6 mb-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>2</div>
                <h2 className="font-semibold text-white">Ваша роль в договоре</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['customer', 'contractor'] as Role[]).map((r) => {
                  const isActive = role === r;
                  const label = r === 'customer' ? 'Я заказчик' : 'Я подрядчик';
                  const desc = r === 'customer'
                    ? 'Вы заказываете работы или услуги'
                    : 'Вы выполняете работы или оказываете услуги';
                  const icon = r === 'customer' ? '🏢' : '🔧';

                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isActive
                          ? 'rgba(99,102,241,0.15)'
                          : 'rgba(255,255,255,0.03)',
                        border: isActive
                          ? '1px solid rgba(99,102,241,0.5)'
                          : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-semibold text-white text-sm">{label}</span>
                        {isActive && (
                          <span className="ml-auto">
                            <svg className="w-4 h-4" style={{ color: '#6366f1' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="card p-6 mb-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>3</div>
                <h2 className="font-semibold text-white">Комментарии и инструкции</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                  необязательно
                </span>
              </div>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Например: не обращай внимания на условия оплаты, сосредоточься на сроках и штрафных санкциях"
                className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all placeholder:text-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  caretColor: '#6366f1',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(99,102,241,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p className="mt-2 text-xs" style={{ color: '#475569' }}>
                Эти инструкции будут переданы ИИ-юристу и повлияют на приоритеты анализа
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isAnalyzing}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: files.length > 0
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(99,102,241,0.3)',
                color: 'white',
                boxShadow: files.length > 0 ? '0 0 30px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {files.length === 0
                  ? 'Загрузите файл для анализа'
                  : `Анализировать ${files.length > 1 ? `${files.length} файла` : 'договор'}`}
              </span>
            </button>

            {/* Footer note */}
            <p className="text-center text-slate-600 text-xs mt-4">
              Анализ занимает 1–3 минуты в зависимости от объёма договора
            </p>
          </div>
        ) : (
          <ResultsView analysis={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
