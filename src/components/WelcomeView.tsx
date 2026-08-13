import React, { useState, useRef } from 'react';
import { ModpackDataSet } from '../types/recipe';
import { normalizeModpackData } from '../utils/importer';
import { Sparkles, Upload, GitFork, ListOrdered, Compass, FileCode, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface WelcomeViewProps {
  language: 'ja' | 'en';
  onImport: (dataset: ModpackDataSet) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  language,
  onImport
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

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
            ? `読み込み成功！ ${normalized.mods.length} MOD / ${itemCount} アイテム / ${recipeCount} レシピ`
            : `Success! ${normalized.mods.length} Mods / ${itemCount} Items / ${recipeCount} Recipes`
        );

        setTimeout(() => {
          onImport(normalized);
          setIsLoading(false);
        }, 400);
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
    <div className="welcome-container">
      <div className="welcome-card">
        {/* メインアイコン & タイトル */}
        <div className="welcome-hero">
          <div className="welcome-icon-glow">
            <Sparkles size={40} color="var(--accent-gold)" />
          </div>
          <h1 className="welcome-title">
            {language === 'ja'
              ? 'Terraria Cross-Mod Recipe Viewer'
              : 'Terraria Cross-Mod Recipe Viewer'}
          </h1>
          <p className="welcome-subtitle">
            {language === 'ja'
              ? 'tModLoader の MODパック環境に対応したレシピツリー＆素材集計ビューアー'
              : 'Interactive DAG Crafting Tree & Raw Material Aggregator for tModLoader Modpacks'}
          </p>
        </div>

        {/* ドロップゾーン / アクション */}
        <div className="welcome-action-section">
          <div
            className={`welcome-dropzone ${isDragging ? 'drag-active' : ''}`}
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={38} color="var(--accent-gold)" className="animate-spin" />
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {language === 'ja' ? 'MODデータを解析中...' : 'Processing MOD Data...'}
                </div>
              </div>
            ) : successMsg ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={38} color="#4caf50" />
                <div style={{ fontWeight: 600, color: '#aaffaa' }}>{successMsg}</div>
              </div>
            ) : (
              <>
                <Upload size={38} color="var(--accent-gold)" className="welcome-dropzone-icon" />
                <div className="welcome-dropzone-title">
                  {language === 'ja' ? 'modpack_data.json をここにドラッグ＆ドロップ' : 'Drag & drop modpack_data.json here'}
                </div>
                <div className="welcome-dropzone-desc">
                  {language === 'ja'
                    ? 'またはここをクリックしてファイルを選択'
                    : 'or click here to select file from computer'}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              style={{ fontSize: '0.85rem', padding: '8px 18px' }}
            >
              <Upload size={15} />
              <span>{language === 'ja' ? 'ファイルを選択して開く' : 'Browse File...'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="welcome-error-banner">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 主な特徴・機能ガイド */}
        <div className="welcome-features-grid">
          <div className="welcome-feature-box">
            <div className="welcome-feature-icon" style={{ color: 'var(--accent-cyan)' }}>
              <GitFork size={22} />
            </div>
            <div className="welcome-feature-title">
              {language === 'ja' ? '多段クラフトツリー (DAG)' : 'Multi-tier Crafting Tree'}
            </div>
            <div className="welcome-feature-desc">
              {language === 'ja'
                ? '巨大な派生ツリーや多重中間素材をノード階層で視覚化。'
                : 'Visualize complex multi-step crafting paths as an interactive DAG.'}
            </div>
          </div>

          <div className="welcome-feature-box">
            <div className="welcome-feature-icon" style={{ color: 'var(--accent-gold)' }}>
              <ListOrdered size={22} />
            </div>
            <div className="welcome-feature-title">
              {language === 'ja' ? '末端素材の自動集計' : 'Raw Materials Calculation'}
            </div>
            <div className="welcome-feature-desc">
              {language === 'ja'
                ? '最終作成に必要な「原木・鉱石・ドロップ品」の合計数を瞬時に算出。'
                : 'Instantly compute total raw resources required from scratch.'}
            </div>
          </div>

          <div className="welcome-feature-box">
            <div className="welcome-feature-icon" style={{ color: 'var(--accent-mana)' }}>
              <Compass size={22} />
            </div>
            <div className="welcome-feature-title">
              {language === 'ja' ? 'Cross-Mod 相互連携' : 'Cross-Mod Synergy'}
            </div>
            <div className="welcome-feature-desc">
              {language === 'ja'
                ? '複数MOD間のレシピやレシピグループ、作業台を横断検索。'
                : 'Explore synergies, crafting stations, and recipes across all active mods.'}
            </div>
          </div>
        </div>

        {/* Exporter MOD からの出力手順 */}
        <div className="welcome-guide-box">
          <div className="welcome-guide-title">
            <FileCode size={16} color="var(--accent-gold)" />
            <span>{language === 'ja' ? 'データの出力・読み込み手順' : 'How to export & load data'}</span>
          </div>
          <ol className="welcome-guide-steps">
            <li>
              {language === 'ja'
                ? 'tModLoader で Recipe Exporter MOD を有効化してワールドまたはゲームを起動'
                : 'Enable the Recipe Exporter MOD in tModLoader and launch the game'}
            </li>
            <li>
              {language === 'ja'
                ? '出力された modpack_data.json をこの画面にドラッグ＆ドロップ（またはファイルを選択）'
                : 'Drop the generated modpack_data.json into this window or select file'}
            </li>
            <li>
              {language === 'ja'
                ? '読み込み完了後、全MODのレシピとクラフトツリーが即座に閲覧可能になります'
                : 'Browse recipes and interactive crafting trees for your entire modpack'}
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
