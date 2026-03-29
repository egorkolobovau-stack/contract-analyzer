'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  doc: '📝',
  txt: '📃',
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
};

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function FileUploadZone({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    onChange([...files, ...Array.from(newFiles)]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`upload-zone rounded-2xl cursor-pointer transition-all ${isDragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
        />
        <div className="py-10 px-6 flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
            style={{
              background: isDragging
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(99,102,241,0.15)',
              boxShadow: isDragging ? '0 0 30px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: isDragging ? 'white' : '#818cf8' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">
              {isDragging ? 'Отпустите файлы' : 'Перетащите файлы или нажмите'}
            </p>
            <p className="text-slate-500 text-sm">
              PDF, Word (DOCX), TXT, JPG, PNG · Можно несколько файлов
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const ext = getExt(file.name);
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)' }}
                >
                  {FILE_ICONS[ext] || '📎'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="p-1.5 rounded-lg transition-all hover:opacity-80 shrink-0"
                  style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
