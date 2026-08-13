import React, { useState, useMemo, useEffect } from 'react';
import { Item, ModpackDataSet } from './types/recipe';
import { initialSampleDataset } from './data/sampleDataset';
import { buildCraftingTree, aggregateRawMaterials, findRecipesUsingItem } from './utils/craftingTree';
import { filterItems, FilterOptions } from './utils/search';

import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { ItemHero } from './components/ItemHero';
import { CraftingTreeViewer } from './components/CraftingTreeViewer';
import { RawMaterialsBreakdown } from './components/RawMaterialsBreakdown';
import { RecipeDetailsView } from './components/RecipeDetailsView';
import { JsonImportModal } from './components/JsonImportModal';

import { Hammer, GitFork, ListOrdered, Sparkles, Compass, Bookmark, BookmarkCheck } from 'lucide-react';

const STORAGE_KEY_DATASET = 'terraria_recipe_dataset';
const STORAGE_KEY_FAVORITES = 'terraria_recipe_favorites';

export const App: React.FC = () => {
  // データセット状態（ローカルストレージから復元）
  const [dataset, setDataset] = useState<ModpackDataSet>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATASET);
      return saved ? JSON.parse(saved) : initialSampleDataset;
    } catch {
      return initialSampleDataset;
    }
  });

  // お気に入り / ピン留めアイテムIDリスト
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return saved ? JSON.parse(saved) : ['FargowiltasSouls:EternitySoul', 'Terraria:Zenith'];
    } catch {
      return ['FargowiltasSouls:EternitySoul', 'Terraria:Zenith'];
    }
  });

  // 言語状態 (ja / en)
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');

  // 選択中アイテム
  const [selectedItemId, setSelectedItemId] = useState<string>('FargowiltasSouls:EternitySoul');

  // アクティブタブ
  const [activeTab, setActiveTab] = useState<'tree' | 'rawMaterials' | 'howTo' | 'usedIn'>('tree');

  // インポートモーダルの表示状態
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // 検索・フィルター設定
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    selectedMods: [],
    selectedCategory: 'all',
    isMaterialOnly: false,
    language: 'ja'
  });

  // お気に入りの永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  // データセットの永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATASET, JSON.stringify(dataset));
    } catch {
      // ignore
    }
  }, [dataset]);

  // お気に入りトグル
  const handleToggleFavorite = (itemId: string) => {
    setFavoriteIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // 言語切替時のフィルター同期
  const handleLanguageChange = (lang: 'ja' | 'en') => {
    setLanguage(lang);
    setFilters(prev => ({ ...prev, language: lang }));
  };

  // フィルタリング済みアイテム一覧
  const filteredItems = useMemo(() => {
    return filterItems(dataset.items, { ...filters, language });
  }, [dataset.items, filters, language]);

  // 選択中アイテムのオブジェクト
  const selectedItem: Item | null = useMemo(() => {
    return dataset.items[selectedItemId] || Object.values(dataset.items)[0] || null;
  }, [dataset.items, selectedItemId]);

  // 選択中アイテムのクラフトツリー（DAG）
  const craftingTree = useMemo(() => {
    if (!selectedItem) return null;
    return buildCraftingTree(selectedItem.id, 1, dataset);
  }, [selectedItem, dataset]);

  // 選択中アイテムの末端基本素材（Raw Materials）集計
  const rawMaterials = useMemo(() => {
    return aggregateRawMaterials(craftingTree);
  }, [craftingTree]);

  // 選択中アイテムの作成レシピ（正引き）
  const recipesHowToCraft = useMemo(() => {
    if (!selectedItem) return [];
    return dataset.recipes.filter(r => r.result.itemId === selectedItem.id);
  }, [selectedItem, dataset.recipes]);

  // 選択中アイテムを素材として使うレシピ（逆引き）
  const recipesUsedIn = useMemo(() => {
    if (!selectedItem) return [];
    return findRecipesUsingItem(selectedItem.id, dataset);
  }, [selectedItem, dataset]);

  // アイテム選択ハンドラー
  const handleSelectItem = (item: Item) => {
    setSelectedItemId(item.id);
  };

  // フィルター更新ハンドラー
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // データインポートハンドラー
  const handleImportDataset = (newDataset: ModpackDataSet) => {
    setDataset(newDataset);
    const firstItem = Object.values(newDataset.items)[0];
    if (firstItem) {
      setSelectedItemId(firstItem.id);
    }
  };

  return (
    <div className="app-container">
      {/* グローバルヘッダー */}
      <Header
        dataset={dataset}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* メインスプリットレイアウト */}
      <main className="main-layout">
        {/* 左ペイン: アイテム検索 & フィルター */}
        <ItemList
          dataset={dataset}
          items={filteredItems}
          selectedItem={selectedItem}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectItem={handleSelectItem}
        />

        {/* 右ペイン: 選択アイテム詳細 & クラフト解析 */}
        <section className="content-workspace">
          {/* ピン留めクイックアクセスバー */}
          {favoriteIds.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 20px',
                background: 'hsl(220, 24%, 10%)',
                borderBottom: '1px solid var(--border-subtle)',
                overflowX: 'auto'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bookmark size={14} />
                {language === 'ja' ? '目標ピン留め:' : 'Pinned:'}
              </span>
              {favoriteIds.map(fId => {
                const fItem = dataset.items[fId];
                if (!fItem) return null;
                const isSelected = selectedItemId === fId;
                return (
                  <button
                    key={fId}
                    onClick={() => handleSelectItem(fItem)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--bg-card-selected)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <BookmarkCheck size={12} color={isSelected ? 'var(--accent-gold)' : '#888'} />
                    <span>{fItem.name[language] || fItem.name.en}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedItem ? (
            <>
              {/* アイテム情報ヒーローヘッダー */}
              <ItemHero
                item={selectedItem}
                dataset={dataset}
                language={language}
                isFavorite={favoriteIds.includes(selectedItem.id)}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* タブナビゲーション */}
              <nav className="tabs-header-bar">
                {/* クラフトツリー (DAG) */}
                <button
                  className={`tab-nav-btn ${activeTab === 'tree' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tree')}
                >
                  <GitFork size={16} />
                  <span>{language === 'ja' ? 'クラフトツリー (DAG)' : 'Crafting Tree (DAG)'}</span>
                </button>

                {/* 必要総素材 (Raw Materials) */}
                <button
                  className={`tab-nav-btn ${activeTab === 'rawMaterials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rawMaterials')}
                >
                  <ListOrdered size={16} />
                  <span>{language === 'ja' ? '必要総素材の集計' : 'Raw Materials'}</span>
                  {rawMaterials.length > 0 && (
                    <span className="tab-nav-badge">{rawMaterials.length}</span>
                  )}
                </button>

                {/* 作成方法 (How to Craft) */}
                <button
                  className={`tab-nav-btn ${activeTab === 'howTo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('howTo')}
                >
                  <Hammer size={16} />
                  <span>{language === 'ja' ? '作成方法' : 'How to Craft'}</span>
                  {recipesHowToCraft.length > 0 && (
                    <span className="tab-nav-badge">{recipesHowToCraft.length}</span>
                  )}
                </button>

                {/* 素材としての用途 (Used In) */}
                <button
                  className={`tab-nav-btn ${activeTab === 'usedIn' ? 'active' : ''}`}
                  onClick={() => setActiveTab('usedIn')}
                >
                  <Compass size={16} />
                  <span>{language === 'ja' ? '用途・派生先' : 'Used In'}</span>
                  {recipesUsedIn.length > 0 && (
                    <span className="tab-nav-badge">{recipesUsedIn.length}</span>
                  )}
                </button>
              </nav>

              {/* タブコンテンツ領域 */}
              <div className="tab-content-viewport">
                {activeTab === 'tree' && (
                  <CraftingTreeViewer
                    rootNode={craftingTree}
                    dataset={dataset}
                    language={language}
                    onSelectItem={handleSelectItem}
                  />
                )}

                {activeTab === 'rawMaterials' && (
                  <RawMaterialsBreakdown
                    materials={rawMaterials}
                    dataset={dataset}
                    language={language}
                    onSelectItem={handleSelectItem}
                  />
                )}

                {(activeTab === 'howTo' || activeTab === 'usedIn') && (
                  <RecipeDetailsView
                    item={selectedItem}
                    recipesHowToCraft={recipesHowToCraft}
                    recipesUsedIn={recipesUsedIn}
                    dataset={dataset}
                    language={language}
                    activeTab={activeTab}
                    onSelectItem={handleSelectItem}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="var(--accent-gold)" style={{ margin: '0 auto 16px' }} />
              <p>{language === 'ja' ? '左側のリストからアイテムを選択してください' : 'Select an item from the left list'}</p>
            </div>
          )}
        </section>
      </main>

      {/* JSONインポートモーダル */}
      <JsonImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportDataset}
        language={language}
      />
    </div>
  );
};

export default App;
