'use client';

import { useEffect, useState } from 'react';
import type { AnalysisResult, ContractRisk } from '@/lib/types';

const RISK_LABELS = { high: 'Высокий риск', medium: 'Средний риск', low: 'Низкий риск' };

function RiskBadge({ severity }: { severity: ContractRisk['severity'] }) {
  const styles = {
    high: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
    medium: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    low: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  };
  return (
    <span style={{
      ...styles[severity],
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-block',
    }}>
      {RISK_LABELS[severity]}
    </span>
  );
}

export default function PrintPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('contractAnalysis');
    if (data) {
      setAnalysis(JSON.parse(data));
      setTimeout(() => window.print(), 800);
    }
  }, []);

  if (!analysis) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Данные анализа не найдены.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Откройте эту страницу через кнопку «Скачать анализ» на главной странице.</p>
        </div>
      </div>
    );
  }

  const roleText = analysis.role === 'customer' ? 'Заказчик' : 'Подрядчик';
  const overallRiskStyle = {
    high: { background: '#fee2e2', color: '#991b1b' },
    medium: { background: '#fef3c7', color: '#92400e' },
    low: { background: '#d1fae5', color: '#065f46' },
  }[analysis.overallRisk];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 2cm 2.5cm; size: A4; }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; color: #1a1a1a; background: white; font-size: 12pt; line-height: 1.6; }
        h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; }
        .section { margin-bottom: 24pt; break-inside: avoid-page; }
        .section-title { font-size: 14pt; font-weight: bold; color: #1a1a3e; border-bottom: 2px solid #6366f1; padding-bottom: 6pt; margin-bottom: 12pt; display: flex; align-items: center; gap: 8px; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12pt; margin-bottom: 10pt; break-inside: avoid; }
        .risk-high { background: #fff5f5; border-color: #fca5a5; }
        .risk-medium { background: #fffbeb; border-color: #fcd34d; }
        .risk-low { background: #f0fdf4; border-color: #6ee7b7; }
        .item-num { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #6366f1; color: white; border-radius: 50%; font-size: 10pt; font-weight: bold; margin-right: 8px; flex-shrink: 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16pt; }
        .check { color: #059669; font-weight: bold; }
        .cross { color: #dc2626; font-weight: bold; }
        ul { margin: 0; padding-left: 20pt; }
        li { margin-bottom: 4pt; }
      `}</style>

      {/* Print button - hidden when printing */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#6366f1', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: 600 }}>
          Анализ договора — готов к печати
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.print()} style={{
            background: 'white', color: '#6366f1', border: 'none',
            padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'sans-serif', fontSize: '14px',
          }}>
            🖨️ Сохранить как PDF
          </button>
          <button onClick={() => window.close()} style={{
            background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'sans-serif', fontSize: '14px',
          }}>
            Закрыть
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60pt 0 40pt' }}>

        {/* Cover */}
        <div style={{ textAlign: 'center', marginBottom: '32pt', paddingTop: '20pt' }}>
          <div style={{ fontSize: '24pt', fontWeight: 'bold', color: '#1a1a3e', marginBottom: '8pt', fontFamily: 'Arial, sans-serif' }}>
            АНАЛИЗ ДОГОВОРА
          </div>
          <div style={{ fontSize: '16pt', color: '#4338ca', marginBottom: '16pt', fontStyle: 'italic' }}>
            {analysis.contractTitle}
          </div>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6pt', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24pt', fontSize: '11pt', color: '#475569' }}>
              <span>Дата анализа: <strong>{analysis.analysisDate}</strong></span>
              <span>Позиция: <strong>{roleText}</strong></span>
            </div>
            <div style={{ marginTop: '8pt', padding: '6pt 20pt', borderRadius: '20pt', ...overallRiskStyle, fontWeight: 600, fontSize: '12pt' }}>
              Общий уровень риска: {RISK_LABELS[analysis.overallRisk]}
            </div>
          </div>
          <hr style={{ marginTop: '24pt', borderColor: '#e2e8f0' }} />
        </div>

        {/* Summary */}
        <div className="section">
          <div className="section-title">📋 Резюме</div>
          <p style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{analysis.summary}</p>
        </div>

        {/* Risks */}
        <div className="section">
          <div className="section-title">⚠️ Риски для {roleText === 'Заказчик' ? 'заказчика' : 'подрядчика'}</div>
          {(analysis.risks || []).map((risk, i) => (
            <div key={i} className={`card risk-${risk.severity}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12pt', marginBottom: '6pt' }}>
                <div>
                  {risk.clause && <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '10pt', marginRight: '8pt' }}>{risk.clause}</span>}
                  <span style={{ fontWeight: 600 }}>{risk.description}</span>
                </div>
                <RiskBadge severity={risk.severity} />
              </div>
              {risk.recommendation && (
                <div style={{ fontSize: '11pt', color: '#475569', marginTop: '4pt' }}>
                  <span style={{ fontWeight: 600 }}>Рекомендация: </span>{risk.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Problematic clauses */}
        <div className="section">
          <div className="section-title">🔍 Проблемные пункты договора</div>
          {(analysis.problematicClauses || []).map((clause, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8pt', marginBottom: '4pt' }}>
                <span className="item-num">{i + 1}</span>
                <div>
                  <strong>{clause.title}</strong>
                  {clause.number && <span style={{ color: '#6366f1', fontSize: '10pt', marginLeft: '8pt' }}>п. {clause.number}</span>}
                </div>
              </div>
              <p style={{ margin: '4pt 0', color: '#374151' }}>{clause.issue}</p>
              {clause.risk && (
                <p style={{ margin: '4pt 0', color: '#dc2626', fontSize: '11pt' }}>
                  <span style={{ fontWeight: 600 }}>Угроза: </span>{clause.risk}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Missing clauses */}
        {(analysis.missingClauses || []).length > 0 && (
          <div className="section">
            <div className="section-title">❌ Отсутствующие условия</div>
            <ul>
              {(analysis.missingClauses || []).map((item, i) => (
                <li key={i} style={{ marginBottom: '6pt' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="section">
          <div className="section-title">⚡ Сильные и слабые стороны</div>
          <div className="two-col">
            <div>
              <div style={{ fontWeight: 'bold', color: '#059669', marginBottom: '8pt', fontSize: '12pt' }}>✅ Сильные стороны</div>
              <ul>
                {(analysis.strengths || []).map((s, i) => (
                  <li key={i} style={{ marginBottom: '4pt' }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#d97706', marginBottom: '8pt', fontSize: '12pt' }}>⚠️ Слабые стороны</div>
              <ul>
                {(analysis.weaknesses || []).map((w, i) => (
                  <li key={i} style={{ marginBottom: '4pt' }}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="section">
          <div className="section-title">💡 Рекомендации</div>
          <ol style={{ paddingLeft: '20pt' }}>
            {(analysis.recommendations || []).map((rec, i) => (
              <li key={i} style={{ marginBottom: '6pt' }}>{rec}</li>
            ))}
          </ol>
        </div>

        {/* Disagreement protocol summary */}
        {(analysis.disagreementProtocol || []).length > 0 && (
          <div className="section">
            <div className="section-title">📝 Протокол разногласий (сводка)</div>
            <p style={{ color: '#475569', fontSize: '11pt', marginBottom: '12pt' }}>
              Подготовлен протокол разногласий по {analysis.disagreementProtocol.length} пунктам договора.
              Скачайте полный документ DOCX с официальными формулировками.
            </p>
            {(analysis.disagreementProtocol || []).map((item, i) => (
              <div key={i} className="card" style={{ marginBottom: '8pt' }}>
                <div style={{ fontWeight: 600, marginBottom: '4pt' }}>
                  п. {item.clauseNumber}: {item.clauseTitle}
                </div>
                <div style={{ color: '#475569', fontSize: '11pt' }}>{item.issue}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16pt', marginTop: '32pt', textAlign: 'center', color: '#94a3b8', fontSize: '10pt' }}>
          Анализ подготовлен системой AI-анализа договоров · {analysis.analysisDate}
          <br />
          Данный анализ носит информационный характер и не является юридической консультацией
        </div>
      </div>
    </>
  );
}
