'use client';

import { useState } from 'react';
import type { AnalysisResult, ContractRisk } from '@/lib/types';

interface Props {
  analysis: AnalysisResult;
  onReset: () => void;
}

const RISK_LABELS = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
const RISK_COLORS = {
  high: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d', dot: '#f59e0b' },
  low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', dot: '#10b981' },
};

function RiskBadge({ severity }: { severity: ContractRisk['severity'] }) {
  const c = RISK_COLORS[severity];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {RISK_LABELS[severity]}
    </span>
  );
}

function SectionHeader({ icon, title, count }: { icon: string; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {count !== undefined && (
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
          {count}
        </span>
      )}
    </div>
  );
}

export default function ResultsView({ analysis, onReset }: Props) {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'protocol'>('analysis');

  const overallRisk = analysis.overallRisk || 'medium';
  const riskColor = RISK_COLORS[overallRisk];

  const handleDownloadPdf = () => {
    sessionStorage.setItem('contractAnalysis', JSON.stringify(analysis));
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

      if (!response.ok) throw new Error('Ошибка генерации документа');

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
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

          {/* Overall risk */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ background: riskColor.bg, border: `1px solid ${riskColor.border}` }}>
            <div className="text-center">
              <div className="text-xs font-medium mb-1" style={{ color: riskColor.text }}>
                Общий уровень риска
              </div>
              <div className="text-2xl font-bold" style={{ color: riskColor.text }}>
                {RISK_LABELS[overallRisk]}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-bg-border">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Скачать анализ (PDF)
          </button>
          <button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
            {downloadingDocx ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Создаём документ...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Скачать протокол разногласий (DOCX)
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 ml-auto"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Новый анализ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setActiveTab('analysis')}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'analysis'
            ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
            : { color: '#64748b' }}>
          Анализ договора
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'protocol'
            ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
            : { color: '#64748b' }}>
          Протокол разногласий ({(analysis.disagreementProtocol || []).length})
        </button>
      </div>

      {activeTab === 'analysis' && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="card p-6">
            <SectionHeader icon="📋" title="Резюме" />
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{analysis.summary}</p>
          </div>

          {/* Risks */}
          <div className="card p-6">
            <SectionHeader icon="⚠️" title="Риски для вашей стороны" count={(analysis.risks || []).length} />
            <div className="space-y-4">
              {(analysis.risks || []).map((risk, i) => (
                <div key={i} className="p-4 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: RISK_COLORS[risk.severity]?.bg || 'rgba(99,102,241,0.08)',
                    border: `1px solid ${RISK_COLORS[risk.severity]?.border || 'rgba(99,102,241,0.2)'}`,
                  }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-medium text-white text-sm">
                      {risk.clause && <span className="text-slate-400 text-xs mr-2">{risk.clause}</span>}
                      {risk.description}
                    </div>
                    <RiskBadge severity={risk.severity} />
                  </div>
                  {risk.recommendation && (
                    <div className="mt-2 flex items-start gap-2 text-sm"
                      style={{ color: '#94a3b8' }}>
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      {risk.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Problematic clauses */}
          <div className="card p-6">
            <SectionHeader icon="🔍" title="Проблемные пункты" count={(analysis.problematicClauses || []).length} />
            <div className="space-y-3">
              {(analysis.problematicClauses || []).map((clause, i) => (
                <div key={i} className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                      {clause.number || i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm mb-1">{clause.title}</div>
                      <div className="text-slate-400 text-sm mb-2">{clause.issue}</div>
                      {clause.risk && (
                        <div className="flex items-start gap-1.5 text-xs"
                          style={{ color: '#fca5a5' }}>
                          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {clause.risk}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing clauses */}
          {(analysis.missingClauses || []).length > 0 && (
            <div className="card p-6">
              <SectionHeader icon="❌" title="Чего не хватает в договоре" count={(analysis.missingClauses || []).length} />
              <ul className="space-y-2">
                {(analysis.missingClauses || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-6">
              <SectionHeader icon="✅" title="Сильные стороны" />
              <ul className="space-y-2">
                {(analysis.strengths || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <SectionHeader icon="⚡" title="Слабые стороны" />
              <ul className="space-y-2">
                {(analysis.weaknesses || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <SectionHeader icon="💡" title="Рекомендации" count={(analysis.recommendations || []).length} />
            <div className="space-y-3">
              {(analysis.recommendations || []).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'protocol' && (
        <div className="space-y-5">
          <div className="card p-5 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-indigo-300 font-medium text-sm mb-1">Готовый протокол разногласий</div>
              <p className="text-slate-400 text-sm">
                Ниже представлены конкретные альтернативные формулировки для каждого спорного пункта.
                Нажмите «Скачать протокол разногласий (DOCX)» для получения официального документа.
              </p>
            </div>
          </div>

          {(analysis.disagreementProtocol || []).map((item, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                  {i + 1}
                </span>
                <div>
                  <span className="text-slate-400 text-xs">Пункт {item.clauseNumber}</span>
                  <h4 className="text-white font-medium text-sm">{item.clauseTitle}</h4>
                </div>
              </div>

              <div className="p-6">
                {item.issue && (
                  <div className="mb-4 flex items-start gap-2 text-sm p-3 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {item.issue}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: '#fca5a5' }}>
                      <span>📄</span> Редакция договора
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.originalText || '—'}</p>
                  </div>
                  <div className="p-4 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: '#6ee7b7' }}>
                      <span>✏️</span> Протокол разногласий
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">{item.proposedText || '—'}</p>
                  </div>
                </div>

                {item.justification && (
                  <div className="flex items-start gap-2 text-sm"
                    style={{ color: '#94a3b8' }}>
                    <span className="shrink-0">⚖️</span>
                    <span><strong className="text-slate-400">Обоснование: </strong>{item.justification}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Bottom download button */}
          <div className="flex justify-center pt-2 pb-8">
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
              {downloadingDocx ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Создаём документ...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать протокол разногласий (DOCX)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
