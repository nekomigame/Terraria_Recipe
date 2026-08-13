import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Item, ModpackDataSet } from './types/recipe';
import { emptyDataset } from './data/emptyDataset';
import { buildCraftingTree, aggregateRawMaterials, findRecipesUsingItem } from './utils/craftingTree';
import { filterItems, FilterOptions } from './utils/search';
import { normalizeModpackData } from './utils/importer';
import { importImageFiles } from './utils/imageImporter';

import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { ItemHero } from './components/ItemHero';
import { CraftingTreeViewer } from './components/CraftingTreeViewer';
import { RawMaterialsBreakdown } from './components/RawMaterialsBreakdown';
import { RecipeDetailsView } from './components/RecipeDetailsView';
import { JsonImportModal } from './components/JsonImportModal';
import { WelcomeView } from './components/WelcomeView';

import { Hammer, GitFork, ListOrdered, Sparkles, Compass, Bookmark, BookmarkCheck, UploadCloud, Loader2 } from 'lucide-react';

import { getSavedDataset, saveDatasetToDB, clearDatasetFromDB } from './utils/datasetStorage';

const STORAGE_KEY_FAVORITES = 'terraria_recipe_favorites';

export const App: React.FC = () => {
  // データセット状態
  const [dataset, setDataset] = useState<ModpackDataSet>(emptyDataset);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // 起動時にデータベース（IndexedDB）から前回のMODレシピデータを自動復元
  useEffect(() => {
    getSavedDataset().then(saved => {
      if (saved && saved.items && Object.keys(saved.items).length > 0) {
        setDataset(saved);
        const firstItem = Object.values(saved.items)[0];
        if (firstItem) {
          setSelectedItemId(firstItem.id);
        }
      }
      setIsInitializing(false);
    }).catch(() => {
      setIsInitializing(false);
    });
  }, []);

  // お気に入り / ピン留めアイテムIDリスト
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 言語状態 (ja / en)
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');

  // 選択中アイテムID（初期状態は空）
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // アイテムごとの選択中レシピIDマップ（代替レシピ切り替え用）
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Record<string, string>>({});

  // レシピグループごとの選択中アイテムIDマップ
  const [selectedGroupVariants, setSelectedGroupVariants] = useState<Record<string, string>>({});

  // アクティブタブ
  const [activeTab, setActiveTab] = useState<'tree' | 'rawMaterials' | 'howTo' | 'usedIn'>('tree');

  // インポートモーダルの表示状態
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // 全画面ドラッグ中オーバーレイ状態
  const [isGlobalDragging, setIsGlobalDragging] = useState<boolean>(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const dragCounter = useRef(0);

  // 検索・フィルター設定
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    selectedMods: [],
    selectedCategory: 'all',
    isMaterialOnly: false,
    language: 'ja'
  });

  // データがロードされているかどうか
  const isDatasetLoaded = useMemo(() => {
    return Object.keys(dataset.items).length > 0;
  }, [dataset.items]);

  // お気に入りの永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  // レシピ切り替えハンドラー
  const handleSelectRecipe = (itemId: string, recipeId: string) => {
    setSelectedRecipeIds(prev => ({
      ...prev,
      [itemId]: recipeId
    }));
  };

  // レシピグループバリアント切り替えハンドラー
  const handleSelectGroupVariant = (groupId: string, variantItemId: string) => {
    setSelectedGroupVariants(prev => ({
      ...prev,
      [groupId]: variantItemId
    }));
  };

  // ウィンドウ全体のドラッグ＆ドロップイベントリスナー（ブラウザの別窓ファイルオープン防止＆全画面ドロップ受付）
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsGlobalDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        setIsGlobalDragging(false);
        dragCounter.current = 0;
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsGlobalDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const jsonFile = Array.from(files).find(f => f.name.endsWith('.json'));
        const imageFiles = Array.from(files).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));

        if (jsonFile) {
          setIsGlobalLoading(true);
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const text = event.target?.result as string;
              const json = JSON.parse(text);
              const normalized = normalizeModpackData(json);
              handleImportDataset(normalized);
            } catch (err: any) {
              alert(
                (language === 'ja' ? 'MODデータのインポートに失敗しました: ' : 'Failed to import MOD data: ') +
                (err.message || String(err))
              );
            } finally {
              setIsGlobalLoading(false);
            }
          };
          reader.onerror = () => {
            setIsGlobalLoading(false);
            alert(language === 'ja' ? 'ファイルの読み込みに失敗しました' : 'Failed to read file');
          };
          reader.readAsText(jsonFile);
        } else if (imageFiles.length > 0) {
          setIsGlobalLoading(true);
          const knownIds = Object.keys(dataset.items);
          importImageFiles(imageFiles, knownIds)
            .then(res => {
              setIsGlobalLoading(false);
              alert(
                language === 'ja'
                  ? `画像インポート完了: ${res.successCount} 件のアイコンを登録しました`
                  : `Imported ${res.successCount} item icons successfully`
              );
              // レンダリング強制更新
              setDataset({ ...dataset });
            })
            .catch(() => {
              setIsGlobalLoading(false);
            });
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [language]);

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
    if (!isDatasetLoaded) return [];
    return filterItems(dataset.items, { ...filters, language });
  }, [dataset.items, filters, language, isDatasetLoaded]);

  // 選択中アイテムのオブジェクト
  const selectedItem: Item | null = useMemo(() => {
    if (!selectedItemId) return null;
    return dataset.items[selectedItemId] || null;
  }, [dataset.items, selectedItemId]);

  // 選択中アイテムのクラフトツリー（DAG）
  const craftingTree = useMemo(() => {
    if (!selectedItem) return null;
    return buildCraftingTree(
      selectedItem.id,
      1,
      dataset,
      new Set(),
      0,
      15,
      selectedRecipeIds,
      selectedGroupVariants
    );
  }, [selectedItem, dataset, selectedRecipeIds, selectedGroupVariants]);

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

  // データインポートハンドラー（データベースに自動永続化）
  const handleImportDataset = (newDataset: ModpackDataSet) => {
    setDataset(newDataset);
    saveDatasetToDB(newDataset);
    const firstItem = Object.values(newDataset.items)[0];
    if (firstItem) {
      setSelectedItemId(firstItem.id);
    }
  };

  // データリセットハンドラー（初期状態に戻す & データベースクリア）
  const handleResetDataset = () => {
    setDataset(emptyDataset);
    setSelectedItemId('');
    setFavoriteIds([]);
    clearDatasetFromDB();
    try {
      localStorage.removeItem(STORAGE_KEY_FAVORITES);
    } catch {
      // ignore
    }
  };

  return (
    <div className="app-container">
      {/* 全画面ドラッグ時のオーバーレイ */}
      {isGlobalDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(10, 15, 25, 0.88)',
            backdropFilter: 'blur(6px)',
            border: '4px dashed var(--accent-gold)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            pointerEvents: 'none'
          }}
        >
          <UploadCloud size={64} color="var(--accent-gold)" className="animate-bounce" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
            {language === 'ja' ? 'ここに modpack_data.json をドロップ' : 'Drop modpack_data.json here'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {language === 'ja'
              ? '全MODのレシピデータを自動解析して読み込みます'
              : 'Automatically parses and loads all MOD recipes'}
          </p>
        </div>
      )}

      {/* グローバル読み込み中オーバーレイ */}
      {isGlobalLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 10, 20, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}
        >
          <Loader2 size={48} color="var(--accent-gold)" className="animate-spin" />
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
            {language === 'ja' ? 'MODデータを解析中...' : 'Processing MOD Data...'}
          </div>
        </div>
      )}

      {/* グローバルヘッダー */}
      <Header
        dataset={dataset}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onResetDataset={handleResetDataset}
      />

      {/* 初回起動時（MODデータ未読み込み時）: 専用ウェルカム画面を表示 */}
      {isInitializing ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
          <Loader2 size={40} color="var(--accent-gold)" className="animate-spin" />
          <p>{language === 'ja' ? '保存済みレシピデータを読み込み中...' : 'Loading saved recipe database...'}</p>
        </div>
      ) : !isDatasetLoaded ? (
        <WelcomeView
          language={language}
          onImport={handleImportDataset}
        />
      ) : (
        /* MODデータ読み込み完了後: メインスプリットレイアウト */
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
                      selectedRecipeIds={selectedRecipeIds}
                      selectedGroupVariants={selectedGroupVariants}
                      onSelectItem={handleSelectItem}
                      onSelectRecipe={handleSelectRecipe}
                      onSelectGroupVariant={handleSelectGroupVariant}
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
      )}

      {/* JSON & 画像インポートモーダル */}
      <JsonImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportDataset}
        dataset={dataset}
        language={language}
      />
    </div>
  );
};

export default App;
