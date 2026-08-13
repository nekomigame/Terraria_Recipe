import React, { useState } from 'react';
import { ModpackDataSet } from '../types/recipe';
import { X, Upload, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

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
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const processJson = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString) as ModpackDataSet;
      if (!data.items || !data.recipes) {
        throw new Error(
          language === 'ja'
            ? '有効なModpackデータ形式ではありません（items または recipes が見つかりません）'
            : 'Invalid modpack format (missing items or recipes)'
        );
      }
      setErrorMsg(null);
      setSuccessMsg(
        language === 'ja'
          ? `インポート成功！ MOD: ${data.mods?.length || 0}個 / アイテム: ${Object.keys(data.items).length}個 / レシピ: ${data.recipes.length}個`
          : `Imported successfully! Mods: ${data.mods?.length || 0} / Items: ${Object.keys(data.items).length} / Recipes: ${data.recipes.length}`
      );
      setTimeout(() => {
        onImport(data);
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setSuccessMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      processJson(text);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        processJson(text);
      };
      reader.readAsText(file);
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
          <label
            className={`dropzone-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {language === 'ja' ? 'JSONファイルをここにドラッグ＆ドロップ' : 'Drag & drop JSON file here'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {language === 'ja' ? 'またはクリックしてファイルを選択' : 'or click to browse from computer'}
            </div>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>

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
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 成功メッセージ */}
          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'hsla(120, 50%, 20%, 0.4)',
                border: '1px solid #4caf50',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#aaffaa'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
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
