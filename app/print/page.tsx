'use client';

import { useEffect, useState } from 'react';
import type { AnalysisResult } from '@/lib/types';

type PrintData = AnalysisResult & { printType?: 'analysis' | 'justifications' };

export default function PrintPage() {
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('contractAnalysis');
    if (raw) {
      setData(JSON.parse(raw));
      setTimeout(() => window.print(), 900);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#555' }}>
        <p>Откройте страницу через кнопку скачивания на главной.</p>
      </div>
    );
  }

  const isJustifications = data.printType === 'justifications';

  return isJustifications
    ? <JustificationsPrint data={data} />
    : <AnalysisPrint data={data} />;
}

/* ──────────────────────────────────────────────────────────
   Документ 1: Анализ договора → PDF
─────────────────────────────────────────────────────────── */
function AnalysisPrint({ data }: { data: PrintData }) {
  const roleLabel = data.role === 'customer' ? 'Заказчик' : 'Подрядчик';

  return (
    <>
      <PrintStyles />
      <PrintBar title="Анализ договора" onPrint={() => window.print()} />

      <div className="print-wrap">
        {/* Шапка */}
        <div style={{ textAlign: 'center', marginBottom: '28pt', borderBottom: '2px solid #4338ca', paddingBottom: '16pt' }}>
          <div style={{ fontSize: '22pt', fontWeight: 'bold', color: '#1a1a3e', fontFamily: 'Arial, sans-serif', marginBottom: '6pt' }}>
            АНАЛИЗ ДОГОВОРА
          </div>
          <div style={{ fontSize: '14pt', color: '#4338ca', fontStyle: 'italic', marginBottom: '12pt' }}>
            {data.contractTitle}
          </div>
          <div style={{ fontSize: '11pt', color: '#475569' }}>
            Дата: <strong>{data.analysisDate}</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            Позиция: <strong>{roleLabel}</strong>
          </div>
          <div style={{ marginTop: '10pt' }}>
            <RiskBadge risk={data.overallRisk} />
          </div>
        </div>

        {/* Тело анализа — plain text с минимальным форматированием */}
        <AnalysisTextPrint text={data.analysisText} />

        <div style={{ marginTop: '32pt', borderTop: '1px solid #e2e8f0', paddingTop: '10pt', textAlign: 'center', color: '#94a3b8', fontSize: '9pt' }}>
          Анализ подготовлен системой AI-анализа договоров · {data.analysisDate}<br />
          Данный документ носит информационный характер и не является юридической консультацией
        </div>
      </div>
    </>
  );
}

function AnalysisTextPrint({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} style={{ height: '6pt' }} />);
    } else if (/^\d+\.\s+[А-ЯA-Z]/.test(trimmed)) {
      elements.push(
        <div key={i} style={{ marginTop: '16pt', marginBottom: '6pt', display: 'flex', alignItems: 'center', gap: '8pt', pageBreakInside: 'avoid' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '22pt', height: '22pt', borderRadius: '4pt',
            background: '#4338ca', color: 'white', fontWeight: 'bold', fontSize: '11pt', flexShrink: 0,
          }}>
            {trimmed.match(/^(\d+)/)?.[1]}
          </span>
          <strong style={{ fontSize: '13pt', color: '#1a1a3e', fontFamily: 'Arial, sans-serif' }}>
            {trimmed.replace(/^\d+\.\s+/, '')}
          </strong>
        </div>
      );
    } else if (/^[-•]\s/.test(trimmed)) {
      elements.push(
        <div key={i} style={{ marginLeft: '14pt', marginBottom: '3pt', display: 'flex', gap: '6pt' }}>
          <span style={{ color: '#4338ca', flexShrink: 0, marginTop: '2pt' }}>•</span>
          <span style={{ fontSize: '11pt', color: '#374151', lineHeight: '1.5' }}>
            {trimmed.replace(/^[-•]\s+/, '')}
          </span>
        </div>
      );
    } else if (/^Я представляю интересы/i.test(trimmed)) {
      elements.push(
        <div key={i} style={{
          margin: '10pt 0', padding: '8pt 14pt', borderRadius: '6pt',
          background: '#ede9fe', border: '1px solid #a78bfa',
          fontWeight: 'bold', color: '#4338ca', fontSize: '12pt',
        }}>
          {trimmed}
        </div>
      );
    } else {
      elements.push(
        <p key={i} style={{ marginLeft: '8pt', marginBottom: '3pt', fontSize: '11pt', color: '#374151', lineHeight: '1.55' }}>
          {trimmed}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

/* ──────────────────────────────────────────────────────────
   Документ 2: Обоснования к протоколу → PDF
─────────────────────────────────────────────────────────── */
function JustificationsPrint({ data }: { data: PrintData }) {
  const roleLabel = data.role === 'customer' ? 'Заказчик' : 'Подрядчик';
  const items = data.protocolItems || [];

  return (
    <>
      <PrintStyles />
      <PrintBar title="Обоснования к протоколу разногласий" onPrint={() => window.print()} />

      <div className="print-wrap">
        {/* Шапка */}
        <div style={{ textAlign: 'center', marginBottom: '24pt', borderBottom: '2px solid #4338ca', paddingBottom: '14pt' }}>
          <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a1a3e', fontFamily: 'Arial, sans-serif', marginBottom: '6pt' }}>
            ОБОСНОВАНИЯ К ПРОТОКОЛУ РАЗНОГЛАСИЙ
          </div>
          <div style={{ fontSize: '13pt', color: '#4338ca', fontStyle: 'italic', marginBottom: '10pt' }}>
            {data.contractTitle}
          </div>
          <div style={{ fontSize: '11pt', color: '#475569' }}>
            Дата: <strong>{data.analysisDate}</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            Позиция: <strong>{roleLabel}</strong>
          </div>
        </div>

        <p style={{ fontSize: '11pt', color: '#475569', marginBottom: '20pt', fontStyle: 'italic' }}>
          Настоящий документ содержит правовые обоснования к каждому пункту Протокола разногласий.
          Обоснования составлены в соответствии с нормами Гражданского кодекса Российской Федерации
          и иными применимыми нормативными актами.
        </p>

        {/* Таблица обоснований */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
          <thead>
            <tr>
              {['№', 'Пункт договора', 'Обоснование правки', 'Норма права'].map((h) => (
                <th key={h} style={{
                  padding: '8pt 10pt', textAlign: 'left',
                  background: '#1e1e4a', color: 'white', fontFamily: 'Arial, sans-serif',
                  border: '1px solid #888', fontSize: '11pt',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.number} style={{ background: idx % 2 === 0 ? '#f8f8ff' : 'white', pageBreakInside: 'avoid' }}>
                <td style={{ padding: '8pt 10pt', border: '1px solid #ccc', width: '4%', textAlign: 'center', fontWeight: 'bold', color: '#4338ca' }}>
                  {item.number}
                </td>
                <td style={{ padding: '8pt 10pt', border: '1px solid #ccc', width: '14%' }}>
                  <div style={{ fontWeight: 'bold', color: '#1a1a3e' }}>{item.clauseRef}</div>
                  <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '10pt' }}>{item.clauseTitle}</div>
                </td>
                <td style={{ padding: '8pt 10pt', border: '1px solid #ccc', width: '60%', lineHeight: '1.55', color: '#374151' }}>
                  {item.justification}
                </td>
                <td style={{ padding: '8pt 10pt', border: '1px solid #ccc', width: '22%', color: '#4338ca', fontWeight: 600, fontSize: '10pt' }}>
                  {item.legalRef}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '32pt', borderTop: '1px solid #e2e8f0', paddingTop: '10pt', textAlign: 'center', color: '#94a3b8', fontSize: '9pt' }}>
          Обоснования подготовлены системой AI-анализа договоров · {data.analysisDate}<br />
          Данный документ носит информационный характер и не является юридической консультацией
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   Вспомогательные компоненты
─────────────────────────────────────────────────────────── */
function PrintBar({ title, onPrint }: { title: string; onPrint: () => void }) {
  return (
    <div className="no-print" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#4338ca', padding: '10px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'sans-serif',
    }}>
      <span style={{ color: 'white', fontWeight: 600 }}>{title} — готов к печати</span>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onPrint} style={{
          background: 'white', color: '#4338ca', border: 'none',
          padding: '7px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
        }}>
          🖨️ Сохранить как PDF
        </button>
        <button onClick={() => window.close()} style={{
          background: 'rgba(255,255,255,0.15)', color: 'white',
          border: '1px solid rgba(255,255,255,0.4)',
          padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    high: { bg: '#fee2e2', color: '#991b1b', label: 'Высокий уровень риска' },
    medium: { bg: '#fef3c7', color: '#92400e', label: 'Средний уровень риска' },
    low: { bg: '#d1fae5', color: '#065f46', label: 'Низкий уровень риска' },
  };
  const s = map[risk] || map.medium;
  return (
    <span style={{
      display: 'inline-block', padding: '4pt 14pt', borderRadius: '20pt',
      background: s.bg, color: s.color, fontWeight: 700, fontSize: '12pt',
    }}>
      {s.label}
    </span>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        @page { margin: 2cm 2.5cm; size: A4; }
        body { margin: 0; }
        .print-wrap { padding-top: 0 !important; }
      }
      * { box-sizing: border-box; }
      body { font-family: 'Times New Roman', Times, serif; color: #1a1a1a; background: white; margin: 0; }
      .print-wrap { max-width: 800px; margin: 0 auto; padding: 56pt 0 40pt; }
    `}</style>
  );
}
