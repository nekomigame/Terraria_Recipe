import React, { useState, useRef, useEffect } from 'react';
import { ModpackDataSet } from '../types/recipe';
import { normalizeModpackData } from '../utils/importer';
import { importImageFiles } from '../utils/imageImporter';
import { getStoredImageCount, clearAllStoredImages } from '../utils/imageStorage';
import { X, Upload, CheckCircle2, AlertCircle, FileCode, Loader2, Image, Trash2 } from 'lucide-react';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (dataset: ModpackDataSet) => void;
  dataset?: ModpackDataSet;
  language: 'ja' | 'en';
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  dataset,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'images'>('json');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [storedCount, setStoredCount] = useState<number>(0);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (isOpen) {
      getStoredImageCount().then(setStoredCount);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJsonProcess = (file: File) => {
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

  const handleImagesProcess = async (files: FileList | File[]) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgress(language === 'ja' ? '画像を読み込み中...' : 'Processing images...');

    const knownIds = dataset ? Object.keys(dataset.items) : [];
    try {
      const result = await importImageFiles(files, knownIds, (current, total) => {
        setProgress(
          language === 'ja'
            ? `画像登録中: ${current} / ${total} 件`
            : `Importing images: ${current} / ${total}`
        );
      });

      const updatedCount = await getStoredImageCount();
      setStoredCount(updatedCount);
      setIsLoading(false);
      setProgress(null);
      setSuccessMsg(
        language === 'ja'
          ? `画像インポート完了！ 登録: ${result.successCount} 件 (スキップ: ${result.skippedCount} 件)`
          : `Images imported! Added: ${result.successCount} (Skipped: ${result.skippedCount})`
      );
    } catch (err: any) {
      setIsLoading(false);
      setProgress(null);
      setErrorMsg(err.message || (language === 'ja' ? '画像インポートに失敗しました' : 'Failed to import images'));
    }
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
    if (!files || files.length === 0) return;

    if (activeTab === 'json') {
      const jsonFile = Array.from(files).find(f => f.name.endsWith('.json'));
      if (jsonFile) handleJsonProcess(jsonFile);
    } else {
      handleImagesProcess(files);
    }
  };

  const handleClearImages = async () => {
    if (window.confirm(language === 'ja' ? '保存された画像キャッシュをすべて削除しますか？' : 'Clear all cached images?')) {
      await clearAllStoredImages();
      setStoredCount(0);
      setSuccessMsg(language === 'ja' ? '画像キャッシュを削除しました' : 'Image cache cleared');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <FileCode size={20} color="var(--accent-gold)" />
            <span>{language === 'ja' ? 'データ＆画像インポート' : 'Import Data & Images'}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* タブ切り替え */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'hsl(220, 25%, 10%)'
          }}
        >
          <button
            onClick={() => { setActiveTab('json'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'json' ? 'var(--bg-dark)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'json' ? '2px solid var(--accent-gold)' : 'none',
              color: activeTab === 'json' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileCode size={16} />
            <span>{language === 'ja' ? '1. MODレシピデータ (JSON)' : '1. MOD Recipe Data (JSON)'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('images'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'images' ? 'var(--bg-dark)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'images' ? '2px solid var(--accent-cyan)' : 'none',
              color: activeTab === 'images' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Image size={16} />
            <span>{language === 'ja' ? '2. アイテム画像 (Icons)' : '2. Item Images (Icons)'}</span>
            {storedCount > 0 && (
              <span style={{ fontSize: '0.7rem', background: 'var(--bg-card-selected)', padding: '1px 6px', borderRadius: '10px', color: '#fff' }}>
                {storedCount}
              </span>
            )}
          </button>
        </div>

        {/* モーダル本文 */}
        <div className="modal-body">
          {activeTab === 'json' ? (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {language === 'ja'
                  ? 'tModLoaderのRecipe Exporter MODから出力された `modpack_data.json` を読み込むことで、全MODのレシピ・クラフトツリーを反映します。'
                  : 'Import `modpack_data.json` exported from tModLoader to view recipes from all your mods.'}
              </p>

              {/* JSON ドロップゾーン */}
              <div
                className={`dropzone-area ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => jsonInputRef.current?.click()}
                style={{ cursor: isLoading ? 'wait' : 'pointer' }}
              >
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleJsonProcess(e.target.files[0])}
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
                      {language === 'ja' ? 'modpack_data.json をここにドラッグ＆ドロップ' : 'Drag & drop modpack_data.json here'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {language === 'ja' ? 'またはクリックしてファイルを選択' : 'or click to browse from computer'}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {language === 'ja'
                  ? 'tModLoader内で `/exporticons` コマンドを実行して出力された `RecipeViewer_Icons` フォルダ内の画像（PNG）をドラッグ＆ドロップすると、全MODのアイコンがブラウザに永続保存されます。'
                  : 'Run `/exporticons` in tModLoader, then drop the generated PNG icon files here to cache all mod textures permanently.'}
              </p>

              {/* 画像ドロップゾーン */}
              <div
                className={`dropzone-area ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => imgInputRef.current?.click()}
                style={{ cursor: isLoading ? 'wait' : 'pointer' }}
              >
                <input
                  ref={imgInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && handleImagesProcess(e.target.files)}
                />

                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={32} color="var(--accent-cyan)" className="animate-spin" />
                    <div style={{ fontWeight: 600 }}>{progress || 'Loading...'}</div>
                  </div>
                ) : successMsg ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={32} color="#4caf50" />
                    <div style={{ color: '#aaffaa', fontWeight: 600 }}>{successMsg}</div>
                  </div>
                ) : (
                  <>
                    <Image size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {language === 'ja' ? '画像ファイル（PNG）をまとめてドロップ' : 'Drop PNG icon files here'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {language === 'ja' ? 'またはクリックして複数ファイルを選択' : 'or click to select multiple files'}
                    </div>
                  </>
                )}
              </div>

              {/* キャッシュ情報 & クリア */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>
                  {language === 'ja' ? `現在保存中の画像: ${storedCount} 件` : `Cached icons: ${storedCount}`}
                </span>
                {storedCount > 0 && (
                  <button
                    onClick={handleClearImages}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={13} />
                    <span>{language === 'ja' ? '画像キャッシュを削除' : 'Clear Cache'}</span>
                  </button>
                )}
              </div>
            </>
          )}

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
              marginTop: '6px',
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
