import React, { useState, useRef } from 'react';
import { ModpackDataSet } from '../types/recipe';
import { normalizeModpackData } from '../utils/importer';
import { X, Upload, CheckCircle2, AlertCircle, FileCode, Loader2 } from 'lucide-react';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (dataset: ModpackDataSet) => void;
  language: 'ja' | 'en';
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  language
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error(language === 'ja' ? 'ファイルが空です' : 'File is empty');
        }
        const json = JSON.parse(text);
        const normalized = normalizeModpackData(json);
        const itemCount = Object.keys(normalized.items).length;
        const recipeCount = normalized.recipes.length;

        setSuccessMsg(
          language === 'ja'
            ? `インポート成功！ MOD: ${normalized.mods.length}個 / アイテム: ${itemCount}個 / レシピ: ${recipeCount}個`
            : `Imported successfully! Mods: ${normalized.mods.length} / Items: ${itemCount} / Recipes: ${recipeCount}`
        );

        setTimeout(() => {
          onImport(normalized);
          setIsLoading(false);
          onClose();
        }, 500);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMsg(err.message || (language === 'ja' ? 'JSONの解析に失敗しました' : 'Failed to parse JSON'));
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setErrorMsg(language === 'ja' ? 'ファイルの読み込み中にエラーが発生しました' : 'Error reading file');
    };

    reader.readAsText(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <FileCode size={20} color="var(--accent-gold)" />
            <span>{language === 'ja' ? 'tModLoader MODデータ（JSON）インポート' : 'Import tModLoader JSON Data'}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* モーダル本文 */}
        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'ja'
              ? 'tModLoaderのRecipe Exporter MODから出力された `modpack_data.json` を読み込むことで、現在導入されているすべてのMOD・拡張MOD・Cross-Modレシピをこのビューアーに反映できます。'
              : 'Import your `modpack_data.json` exported from the tModLoader Recipe Exporter MOD to view recipes from all your loaded mods.'}
          </p>

          {/* ドロップゾーン */}
          <div
            className={`dropzone-area ${isDragging ? 'drag-active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: isLoading ? 'wait' : 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={32} color="var(--accent-gold)" className="animate-spin" />
                <div style={{ fontWeight: 600 }}>
                  {language === 'ja' ? 'MODデータを解析中...' : 'Processing JSON...'}
                </div>
              </div>
            ) : successMsg ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={32} color="#4caf50" />
                <div style={{ color: '#aaffaa', fontWeight: 600 }}>{successMsg}</div>
              </div>
            ) : (
              <>
                <Upload size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {language === 'ja' ? 'JSONファイルをここにドラッグ＆ドロップ' : 'Drag & drop JSON file here'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {language === 'ja' ? 'またはクリックしてファイルを選択' : 'or click to browse from computer'}
                </div>
              </>
            )}
          </div>

          {/* エラーメッセージ */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'hsla(0, 70%, 25%, 0.4)',
                border: '1px solid var(--accent-crimson)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#ff9999'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* フッターアクション */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <button className="btn-secondary" onClick={onClose} style={{ fontSize: '0.8rem' }}>
              {language === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
