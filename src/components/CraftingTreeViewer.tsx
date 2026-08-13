import React, { useState } from 'react';
import { Item, CraftingTreeNode, ModpackDataSet } from '../types/recipe';
import { getRarityColor, getModColor } from '../utils/search';
import { ItemIcon } from './ItemIcon';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface CraftingTreeViewerProps {
  rootNode: CraftingTreeNode | null;
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  onSelectItem: (item: Item) => void;
}

export const CraftingTreeViewer: React.FC<CraftingTreeViewerProps> = ({
  rootNode,
  dataset,
  language,
  onSelectItem
}) => {
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState<number>(1);

  if (!rootNode) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {language === 'ja' ? 'クラフトツリーデータがありません' : 'No Crafting Tree available'}
      </div>
    );
  }

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

  // 再帰的ツリーノードレンダラー
  const renderNode = (node: CraftingTreeNode) => {
    const isCollapsed = collapsedNodeIds.has(node.nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const rarityColor = getRarityColor(node.item.rarity, node.item.rarityName);
    const modColor = getModColor(node.item.mod, dataset);
    const modName = dataset.mods.find(m => m.id === node.item.mod)?.name || node.item.mod;

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
          style={{ cursor: 'pointer' }}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                className="mod-tag-pill"
                style={{ backgroundColor: modColor, fontSize: '0.65rem' }}
              >
                {modName}
              </span>

              {node.isRawMaterial ? (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-crimson)', fontWeight: 600 }}>
                  ● {language === 'ja' ? '基本素材' : 'Raw Material'}
                </span>
              ) : (
                node.recipe && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                    🛠 {node.recipe.requiredTiles.map(t => dataset.stations[t]?.name[language] || t).join(', ') || '手作業'}
                  </span>
                )
              )}

              {node.isRecipeGroup && (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                  (代替可能グループ)
                </span>
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
            {node.children.map(child => renderNode(child))}
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

      {/* ガイド注記 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '10px'
        }}
      >
        <AlertTriangle size={14} color="var(--accent-gold)" />
        <span>
          {language === 'ja'
            ? 'アイテムをクリックすると詳細を表示します。左端が赤のノードは末端の基本素材（Raw Material）です。'
            : 'Click on any item to view its details. Red-accented nodes represent base raw materials.'}
        </span>
      </div>

      {/* グラフ描画エリア */}
      <div
        className="tree-workspace"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease'
        }}
      >
        {renderNode(rootNode)}
      </div>
    </div>
  );
};
