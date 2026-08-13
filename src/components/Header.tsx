import React from 'react';
import { ModpackDataSet } from '../types/recipe';
import { Sparkles, Upload, Globe, Database, Trash2 } from 'lucide-react';

interface HeaderProps {
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  onLanguageChange: (lang: 'ja' | 'en') => void;
  onOpenImportModal: () => void;
  onResetDataset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  language,
  onLanguageChange,
  onOpenImportModal,
  onResetDataset
}) => {
  const totalItems = Object.keys(dataset.items).length;
  const totalRecipes = dataset.recipes.length;
  const totalMods = dataset.mods.length;
  const isLoaded = totalItems > 0;

  return (
    <header className="app-header">
      <div className="brand-area">
        <div className="brand-title">
          <Sparkles size={22} color="var(--accent-gold)" />
          Terraria Recipe Tree
        </div>
        <span className="brand-badge">Cross-Mod DAG</span>
      </div>

      <div className="header-actions">
        {/* データセット情報バッジ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Database size={14} color={isLoaded ? 'var(--accent-cyan)' : 'var(--text-dim)'} />
          <span>
            {isLoaded
              ? `${totalMods} MODs | ${totalItems} Items | ${totalRecipes} Recipes`
              : language === 'ja'
              ? 'MODデータ未読み込み'
              : 'No MOD Data Loaded'}
          </span>
        </div>

        {/* 言語切替ボタン */}
        <button
          className="btn-secondary"
          onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
          title="言語切り替え / Toggle Language"
        >
          <Globe size={15} />
          <span>{language === 'ja' ? '日本語' : 'English'}</span>
        </button>

        {/* データリセットボタン（データ読み込み時のみ表示） */}
        {isLoaded && onResetDataset && (
          <button
            className="btn-secondary"
            onClick={onResetDataset}
            title={language === 'ja' ? '読み込んだデータをクリアして初期状態に戻す' : 'Clear loaded data'}
            style={{ color: 'var(--accent-crimson)' }}
          >
            <Trash2 size={15} />
            <span>{language === 'ja' ? 'データクリア' : 'Clear Data'}</span>
          </button>
        )}

        {/* ユーザー環境JSONインポートボタン */}
        <button
          className="btn-primary"
          onClick={onOpenImportModal}
          title="tModLoaderから出力したJSONをインポート"
        >
          <Upload size={15} />
          <span>{language === 'ja' ? 'MODデータ読込' : 'Import MOD Data'}</span>
        </button>
      </div>
    </header>
  );
};
