import React, { useState } from 'react';
import { Item, CraftingTreeNode, ModpackDataSet, Recipe } from '../types/recipe';
import { getRarityColor, getModColor } from '../utils/search';
import { buildCraftingTree } from '../utils/craftingTree';
import { ItemIcon } from './ItemIcon';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Sparkles, Layers } from 'lucide-react';

interface CraftingTreeViewerProps {
  rootNode: CraftingTreeNode | null;
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  selectedRecipeIds: Record<string, string>;
  selectedGroupVariants: Record<string, string>;
  onSelectItem: (item: Item) => void;
  onSelectRecipe: (itemId: string, recipeId: string) => void;
  onSelectGroupVariant?: (groupId: string, variantItemId: string) => void;
}

export const CraftingTreeViewer: React.FC<CraftingTreeViewerProps> = ({
  rootNode,
  dataset,
  language,
  selectedRecipeIds,
  selectedGroupVariants,
  onSelectItem,
  onSelectRecipe,
  onSelectGroupVariant
}) => {
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState<number>(1);
  const [viewAllRecipes, setViewAllRecipes] = useState<boolean>(false);

  if (!rootNode) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {language === 'ja' ? 'クラフトツリーデータがありません' : 'No Crafting Tree available'}
      </div>
    );
  }

  // ルートアイテムの全作成可能レシピ一覧
  const rootPossibleRecipes = rootNode.availableRecipes || (rootNode.recipe ? [rootNode.recipe] : []);
  const hasMultipleRootRecipes = rootPossibleRecipes.length > 1;

  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 作業台名フォーマット
  const getStationNames = (recipe: Recipe) => {
    if (!recipe.requiredTiles || recipe.requiredTiles.length === 0) {
      return language === 'ja' ? '手作業（作業台不要）' : 'By Hand (No Station)';
    }
    return recipe.requiredTiles
      .map(t => dataset.stations[t]?.name[language] || dataset.stations[t]?.name.en || t.replace(/^.*:/, ''))
      .join(' + ');
  };

  // 単一ツリーノードのレンダラー
  const renderNode = (node: CraftingTreeNode, isRoot: boolean = false) => {
    const isCollapsed = collapsedNodeIds.has(node.nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const rarityColor = getRarityColor(node.item.rarity, node.item.rarityName);
    const modColor = getModColor(node.item.mod, dataset);
    const modName = dataset.mods.find(m => m.id === node.item.mod)?.name || node.item.mod;

    const availableRecipes = node.availableRecipes || (node.recipe ? [node.recipe] : []);
    const hasAlternativeRecipes = availableRecipes.length > 1;
    const currentRecipeId = node.recipe?.id || availableRecipes[0]?.id;

    // Cross-Mod判定 (親のMODと子のMODが異なる場合)
    const isCrossMod = node.recipe && node.children.some(c => c.item.mod !== node.item.mod);

    return (
      <div
        key={node.nodeId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          margin: '6px 0',
          position: 'relative'
        }}
      >
        <div
          className={`tree-node-card ${node.isRawMaterial ? 'raw-material' : ''} ${isCrossMod ? 'cross-mod' : ''}`}
          onClick={() => onSelectItem(node.item)}
          style={{ cursor: 'pointer', minWidth: '320px' }}
        >
          {/* 折りたたみボタン */}
          {hasChildren && (
            <button
              onClick={e => toggleCollapse(node.nodeId, e)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title={isCollapsed ? '展開' : '折りたたむ'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          <div className="item-icon-box" style={{ width: '32px', height: '32px' }}>
            <ItemIcon item={node.item} size={22} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: rarityColor
                  }}
                >
                  {node.item.name[language] || node.item.name.en}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.7rem',
                    color: 'var(--accent-gold)',
                    background: 'hsl(220, 25%, 10%)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  x{node.requiredAmount}
                </span>
              </div>

              {/* 中間ノードの代替レシピ切り替えドロップダウン */}
              {!isRoot && hasAlternativeRecipes && (
                <div onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
                  <select
                    value={currentRecipeId}
                    onChange={e => onSelectRecipe(node.itemId, e.target.value)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      background: 'hsl(220, 25%, 12%)',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '4px',
                      color: 'var(--accent-gold)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    title={language === 'ja' ? '代替レシピの切り替え' : 'Switch Recipe Option'}
                  >
                    {availableRecipes.map((r, idx) => {
                      const st = getStationNames(r);
                      const mod = r.mod || 'Vanilla';
                      return (
                        <option key={r.id} value={r.id}>
                          {language === 'ja' ? `レシピ ${idx + 1} (${st}) [${mod}]` : `Recipe ${idx + 1} (${st}) [${mod}]`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                className="mod-tag-pill"
                style={{ backgroundColor: modColor, fontSize: '0.65rem' }}
              >
                {modName}
              </span>

              {node.isRawMaterial ? (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-crimson)', fontWeight: 600 }}>
                  ● {language === 'ja' ? '基本素材（採掘・ドロップ品）' : 'Raw Material'}
                </span>
              ) : (
                node.recipe && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                    🛠 {getStationNames(node.recipe)}
                  </span>
                )
              )}

              {/* レシピグループ代替選択 */}
              {node.isRecipeGroup && node.recipeGroupId && dataset.recipeGroups[node.recipeGroupId] && (
                <div onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                    ({dataset.recipeGroups[node.recipeGroupId].name[language] || dataset.recipeGroups[node.recipeGroupId].name.en}):
                  </span>
                  {onSelectGroupVariant && dataset.recipeGroups[node.recipeGroupId].validItemIds.length > 1 ? (
                    <select
                      value={node.selectedVariantId || node.itemId}
                      onChange={e => onSelectGroupVariant(node.recipeGroupId!, e.target.value)}
                      style={{
                        fontSize: '0.65rem',
                        padding: '1px 4px',
                        background: 'hsl(220, 25%, 10%)',
                        border: '1px solid var(--accent-gold)',
                        borderRadius: '3px',
                        color: 'var(--accent-gold)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {dataset.recipeGroups[node.recipeGroupId].validItemIds.map(vId => {
                        const vItem = dataset.items[vId];
                        return (
                          <option key={vId} value={vId}>
                            {vItem ? (vItem.name[language] || vItem.name.en) : vId}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                      {node.item.name[language] || node.item.name.en}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 子ノードリスト */}
        {hasChildren && !isCollapsed && (
          <div
            style={{
              marginLeft: '28px',
              paddingLeft: '14px',
              borderLeft: '2px dashed var(--border-medium)',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {node.children.map(child => renderNode(child, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* ズーム & コントロールバー */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: '6px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {hasMultipleRootRecipes && (
          <button
            className={`btn-secondary ${viewAllRecipes ? 'active' : ''}`}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderColor: viewAllRecipes ? 'var(--accent-gold)' : undefined,
              color: viewAllRecipes ? 'var(--accent-gold)' : undefined
            }}
            onClick={() => setViewAllRecipes(!viewAllRecipes)}
            title={language === 'ja' ? 'すべての代替レシピツリーを並べて表示' : 'Show All Recipe Trees Side-by-Side'}
          >
            <Layers size={14} />
            <span>{language === 'ja' ? '全レシピ同時表示' : 'View All Trees'}</span>
          </button>
        )}

        <button
          className="btn-secondary"
          style={{ padding: '4px 8px' }}
          onClick={() => setScale(s => Math.min(s + 0.1, 1.5))}
          title="ズームイン"
        >
          <ZoomIn size={16} />
        </button>
        <button
          className="btn-secondary"
          style={{ padding: '4px 8px' }}
          onClick={() => setScale(s => Math.max(s - 0.1, 0.6))}
          title="ズームアウト"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="btn-secondary"
          style={{ padding: '4px 8px' }}
          onClick={() => setScale(1)}
          title="リセット"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* 代替レシピ切り替えヘッダー（作成方法が複数ある場合） */}
      {hasMultipleRootRecipes && (
        <div
          style={{
            background: 'hsl(220, 24%, 11%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '12px 16px',
            marginBottom: '12px',
            borderRadius: '8px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              {language === 'ja'
                ? `このアイテムには ${rootPossibleRecipes.length} 通りの作成レシピがあります:`
                : `This item has ${rootPossibleRecipes.length} different crafting recipes:`}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: '8px' }}>
            {rootPossibleRecipes.map((recipe, idx) => {
              const isSelected = (rootNode.recipe?.id || rootPossibleRecipes[0]?.id) === recipe.id;
              const stationName = getStationNames(recipe);
              const modName = dataset.mods.find(m => m.id === recipe.mod)?.name || recipe.mod;

              return (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(rootNode.itemId, recipe.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--bg-card-selected)' : 'var(--bg-card)',
                    border: isSelected ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                      {language === 'ja' ? `レシピ #${idx + 1}` : `Recipe #${idx + 1}`}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: isSelected ? 'var(--accent-gold)' : 'var(--bg-darkest)',
                        color: isSelected ? '#000' : 'var(--text-dim)',
                        fontWeight: 600
                      }}
                    >
                      {isSelected ? (language === 'ja' ? '選択中' : 'Active') : modName}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    🛠 {stationName}
                  </div>

                  {/* 必要素材サマリープレビュー */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                    {recipe.ingredients.map((ing, iIdx) => {
                      const ingItem = ing.itemId ? dataset.items[ing.itemId] : null;
                      const group = ing.recipeGroupId ? dataset.recipeGroups[ing.recipeGroupId] : null;
                      const name = ingItem ? (ingItem.name[language] || ingItem.name.en) : group ? (group.name[language] || group.name.en) : '???';

                      return (
                        <span
                          key={iIdx}
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            background: 'hsl(220, 25%, 9%)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {name} x{ing.stack}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* グラフ描画エリア */}
      <div
        className="tree-workspace"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease',
          overflow: 'auto',
          flex: 1
        }}
      >
        {viewAllRecipes && hasMultipleRootRecipes ? (
          /* 全レシピ同時並列表示 */
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            {rootPossibleRecipes.map((r, rIdx) => {
              // 各レシピごとの個別ツリーを構築
              const customSelectedRecipes = { ...selectedRecipeIds, [rootNode.itemId]: r.id };
              const subTree = buildCraftingTree(
                rootNode.itemId,
                rootNode.requiredAmount,
                dataset,
                new Set(),
                0,
                15,
                customSelectedRecipes,
                selectedGroupVariants
              );

              if (!subTree) return null;

              return (
                <div
                  key={r.id}
                  style={{
                    minWidth: '380px',
                    background: 'hsl(220, 24%, 10%)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: (rootNode.recipe?.id || rootPossibleRecipes[0]?.id) === r.id ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
                      {language === 'ja' ? `レシピパターン #${rIdx + 1}` : `Recipe Pattern #${rIdx + 1}`}
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => onSelectRecipe(rootNode.itemId, r.id)}
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    >
                      {language === 'ja' ? 'このレシピを選択' : 'Select This Recipe'}
                    </button>
                  </div>
                  {renderNode(subTree, true)}
                </div>
              );
            })}
          </div>
        ) : (
          /* 通常の選択中ツリー表示 */
          renderNode(rootNode, true)
        )}
      </div>
    </div>
  );
};
