import React from 'react';
import { ModpackDataSet } from '../types/recipe';
import { Sparkles, Upload, Globe, Database } from 'lucide-react';

interface HeaderProps {
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  onLanguageChange: (lang: 'ja' | 'en') => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  language,
  onLanguageChange,
  onOpenImportModal
}) => {
  const totalItems = Object.keys(dataset.items).length;
  const totalRecipes = dataset.recipes.length;
  const totalMods = dataset.mods.length;

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
          <Database size={14} color="var(--accent-cyan)" />
          <span>
            {totalMods} MODs | {totalItems} Items | {totalRecipes} Recipes
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
