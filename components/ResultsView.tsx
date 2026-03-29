'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';

interface Props {
  analysis: AnalysisResult;
  onReset: () => void;
}

const RISK_META = {
  high: { label: 'Высокий риск', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#fca5a5' },
  medium: { label: 'Средний риск', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
  low: { label: 'Низкий риск', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
};

/** Простой рендер plain-text анализа с визуальными секциями */
function AnalysisText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Нумерованные заголовки секций: "1. РИСКИ..."
    if (/^\d+\.\s+[А-ЯA-Z]/.test(line.trim())) {
      elements.push(
        <div key={i} className="mt-6 mb-3 flex items-center gap-3">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
          >
            {line.trim().match(/^(\d+)/)?.[1]}
          </div>
          <h3 className="text-base font-bold text-white">
            {line.trim().replace(/^\d+\.\s+/, '')}
          </h3>
        </div>
      );
    }
    // Подзаголовки через дефис или маркер
    else if (/^\s+[-•]\s/.test(line) || /^[-•]\s/.test(line.trim())) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-4 my-1">
          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <p className="text-slate-300 text-sm leading-relaxed">
            {line.trim().replace(/^[-•]\s+/, '')}
          </p>
        </div>
      );
    }
    // Строки с жирным маркером "Слово: текст"
    else if (/^[А-ЯA-Z][^:]{1,40}:\s/.test(line.trim()) && line.trim().length < 120) {
      const colonIdx = line.indexOf(':');
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      elements.push(
        <p key={i} className="ml-4 my-1 text-sm text-slate-300">
          <strong className="text-slate-100">{label}: </strong>
          {value}
        </p>
      );
    }
    // Строка "Я представляю интересы..." — выделенный баннер
    else if (/^Я представляю интересы/i.test(line.trim())) {
      elements.push(
        <div key={i} className="my-4 px-4 py-2.5 rounded-xl inline-block"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', fontWeight: 600 }}>
          {line.trim()}
        </div>
      );
    }
    // Пустая строка
    else if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
    }
    // Обычный текст
    else {
      elements.push(
        <p key={i} className="ml-4 my-1 text-sm text-slate-300 leading-relaxed">
          {line.trim()}
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function ResultsView({ analysis, onReset }: Props) {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'protocol'>('analysis');

  const risk = RISK_META[analysis.overallRisk] || RISK_META.medium;

  const handleDownloadAnalysisPdf = () => {
    sessionStorage.setItem('contractAnalysis', JSON.stringify({ ...analysis, printType: 'analysis' }));
    window.open('/print', '_blank');
  };

  const handleDownloadJustificationsPdf = () => {
    sessionStorage.setItem('contractAnalysis', JSON.stringify({ ...analysis, printType: 'justifications' }));
    window.open('/print', '_blank');
  };

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      });
      if (!response.ok) throw new Error('Ошибка генерации');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Протокол разногласий.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Не удалось создать документ. Попробуйте ещё раз.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <div className="section-enter">
      {/* Шапка с кнопками */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-slate-400 text-sm">Анализ завершён · {analysis.analysisDate}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{analysis.contractTitle}</h2>
            <p className="text-slate-400 text-sm mt-1">
              Позиция: <span className="text-indigo-300 font-medium">
                {analysis.role === 'customer' ? 'Заказчик' : 'Подрядчик'}
              </span>
            </p>
          </div>
          <div className="px-5 py-3 rounded-xl text-center"
            style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
            <div className="text-xs font-medium mb-0.5" style={{ color: risk.text }}>Уровень риска</div>
            <div className="text-xl font-bold" style={{ color: risk.text }}>{risk.label}</div>
          </div>
        </div>

        {/* Кнопки скачивания */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-bg-border">
          {/* Анализ PDF */}
          <button onClick={handleDownloadAnalysisPdf}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Анализ (PDF)
          </button>

          {/* Протокол DOCX */}
          <button onClick={handleDownloadDocx} disabled={downloadingDocx}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
            {downloadingDocx ? (
              <><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />Создаём...</>
            ) : (
              <><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>Протокол (DOCX)</>
            )}
          </button>

          {/* Обоснования PDF */}
          <button onClick={handleDownloadJustificationsPdf}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#67e8f9' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Обоснования (PDF)
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <button onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Новый анализ
          </button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => setActiveTab('analysis')}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'analysis'
            ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
            : { color: '#64748b' }}>
          Анализ договора
        </button>
        <button onClick={() => setActiveTab('protocol')}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'protocol'
            ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
            : { color: '#64748b' }}>
          Протокол разногласий ({(analysis.protocolItems || []).length} пунктов)
        </button>
      </div>

      {/* ─── Вкладка: Анализ ─── */}
      {activeTab === 'analysis' && (
        <div className="card p-6 section-enter">
          <AnalysisText text={analysis.analysisText} />
        </div>
      )}

      {/* ─── Вкладка: Протокол ─── */}
      {activeTab === 'protocol' && (
        <div className="space-y-4 section-enter">
          <div className="card p-4 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-indigo-300 font-medium text-sm mb-0.5">Два документа готовы к скачиванию</div>
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">Протокол разногласий (DOCX)</strong> — официальный документ с таблицей правок, готовый к подписанию.
                <br />
                <strong className="text-slate-300">Обоснования (PDF)</strong> — отдельный документ с правовыми аргументами по каждой правке.
              </p>
            </div>
          </div>

          {(analysis.protocolItems || []).map((item) => (
            <div key={item.number} className="card overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                  {item.number}
                </span>
                <div>
                  <span className="text-indigo-400 text-xs font-mono">{item.clauseRef}</span>
                  <h4 className="text-white font-medium text-sm">{item.clauseTitle}</h4>
                </div>
                {item.legalRef && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(34,211,238,0.1)', color: '#67e8f9', border: '1px solid rgba(34,211,238,0.2)' }}>
                    {item.legalRef}
                  </span>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#fca5a5' }}>📄 Редакция договора</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.originalText || '—'}</p>
                </div>
                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#6ee7b7' }}>✏️ Предлагаемая редакция</div>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">{item.proposedText || '—'}</p>
                </div>
              </div>

              {item.justification && (
                <div className="px-5 pb-4">
                  <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="shrink-0">⚖️</span>
                    <span className="text-slate-400">
                      <strong className="text-slate-300">Обоснование: </strong>
                      {item.justification}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3 justify-center pt-2 pb-8">
            <button onClick={handleDownloadDocx} disabled={downloadingDocx}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
              {downloadingDocx
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Создаём...</>
                : <>📝 Протокол разногласий (DOCX)</>}
            </button>
            <button onClick={handleDownloadJustificationsPdf}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#67e8f9' }}>
              ⚖️ Обоснования (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
