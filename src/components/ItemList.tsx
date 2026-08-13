import React from 'react';
import { Item, ModpackDataSet } from '../types/recipe';
import { FilterOptions, getRarityColor, getModColor } from '../utils/search';
import { ItemIcon } from './ItemIcon';
import { Search, Filter } from 'lucide-react';

interface ItemListProps {
  dataset: ModpackDataSet;
  items: Item[];
  selectedItem: Item | null;
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onSelectItem: (item: Item) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  dataset,
  items,
  selectedItem,
  filters,
  onFilterChange,
  onSelectItem
}) => {
  const lang = filters.language;

  const handleModToggle = (modId: string) => {
    let nextMods: string[];
    if (filters.selectedMods.includes(modId)) {
      nextMods = filters.selectedMods.filter(id => id !== modId);
    } else {
      nextMods = [...filters.selectedMods, modId];
    }
    onFilterChange({ selectedMods: nextMods });
  };

  return (
    <aside className="sidebar-panel">
      {/* 検索 & フィルターセクション */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder={lang === 'ja' ? 'アイテム名・MOD・内部名で検索...' : 'Search items, mods, internal names...'}
            value={filters.query}
            onChange={e => onFilterChange({ query: e.target.value })}
          />
        </div>

        {/* MOD別フィルターチップ */}
        <div className="filter-tags-row">
          {dataset.mods.map(mod => {
            const isActive = filters.selectedMods.length === 0 || filters.selectedMods.includes(mod.id);
            const modColor = getModColor(mod.id, dataset);

            return (
              <button
                key={mod.id}
                type="button"
                className={`mod-filter-chip ${isActive ? 'active' : ''}`}
                style={{ '--chip-color': modColor } as React.CSSProperties}
                onClick={() => handleModToggle(mod.id)}
              >
                <span className="mod-dot" style={{ backgroundColor: modColor }} />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* 素材のみチェック & 件数サマリー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.isMaterialOnly}
              onChange={e => onFilterChange({ isMaterialOnly: e.target.checked })}
            />
            <span>{lang === 'ja' ? '素材のみ表示' : 'Materials Only'}</span>
          </label>

          <span>
            {items.length} {lang === 'ja' ? '件' : 'items'}
          </span>
        </div>
      </div>

      {/* アイテム一覧 */}
      <div className="item-list-container">
        {items.length === 0 ? (
          <div
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.85rem'
            }}
          >
            <Filter size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p>{lang === 'ja' ? '一致するアイテムが見つかりません' : 'No items match your criteria'}</p>
          </div>
        ) : (
          items.map(item => {
            const isSelected = selectedItem?.id === item.id;
            const rarityColor = getRarityColor(item.rarity, item.rarityName);
            const modColor = getModColor(item.mod, dataset);
            const modName = dataset.mods.find(m => m.id === item.mod)?.name || item.mod;

            return (
              <div
                key={item.id}
                className={`item-list-row ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectItem(item)}
              >
                <div className="item-icon-box">
                  <ItemIcon item={item} size={26} />
                </div>

                <div className="item-row-info">
                  <div
                    className="item-row-name"
                    style={{ color: rarityColor }}
                  >
                    {item.name[lang] || item.name.en}
                  </div>

                  <div className="item-row-meta">
                    <span
                      className="mod-tag-pill"
                      style={{ backgroundColor: modColor }}
                    >
                      {modName}
                    </span>
                    {item.category && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
