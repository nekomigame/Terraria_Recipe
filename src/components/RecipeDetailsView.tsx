import React from 'react';
import { Item, Recipe, ModpackDataSet } from '../types/recipe';
import { getRarityColor, getModColor } from '../utils/search';
import { ItemIcon } from './ItemIcon';
import { Hammer, AlertCircle } from 'lucide-react';

interface RecipeDetailsViewProps {
  item: Item;
  recipesHowToCraft: Recipe[];
  recipesUsedIn: Array<{ recipe: Recipe; resultItem: Item }>;
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  activeTab: 'howTo' | 'usedIn';
  onSelectItem: (item: Item) => void;
}

export const RecipeDetailsView: React.FC<RecipeDetailsViewProps> = ({
  recipesHowToCraft,
  recipesUsedIn,
  dataset,
  language,
  activeTab,
  onSelectItem
}) => {
  // 正引き（作成方法）表示
  if (activeTab === 'howTo') {
    if (recipesHowToCraft.length === 0) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={28} style={{ margin: '0 auto 10px', color: 'var(--accent-crimson)' }} />
          <p>{language === 'ja' ? 'このアイテムにはクラフトレシピがありません（直接ドロップ・採掘または購入アイテムです）' : 'This item has no craft recipes (Direct drop, mined, or purchased).'}</p>
        </div>
      );
    }

    return (
      <div className="recipe-card-container">
        {recipesHowToCraft.map((recipe, index) => {
          const modColor = getModColor(recipe.mod, dataset);
          const modName = dataset.mods.find(m => m.id === recipe.mod)?.name || recipe.mod;

          return (
            <div key={recipe.id || index} className="recipe-box">
              {/* レシピヘッダー（作業台・条件・MOD） */}
              <div className="recipe-box-header">
                <div className="recipe-station-info">
                  <Hammer size={16} />
                  <span>
                    {language === 'ja' ? '必要作業台: ' : 'Required Stations: '}
                    {recipe.requiredTiles.length > 0
                      ? recipe.requiredTiles.map(t => dataset.stations[t]?.name[language] || t).join(' / ')
                      : language === 'ja' ? '手作業 (手元)' : 'By Hand'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {recipe.requiredConditions && recipe.requiredConditions.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-gold)',
                        background: 'hsl(220, 25%, 10%)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      ★ {recipe.requiredConditions.join(', ')}
                    </span>
                  )}
                  <span className="mod-tag-pill" style={{ backgroundColor: modColor }}>
                    {modName}
                  </span>
                </div>
              </div>

              {/* 必要素材グリッド */}
              <div className="ingredients-grid">
                {recipe.ingredients.map((ing, iIdx) => {
                  let ingItem: Item | undefined;
                  let isGroup = false;
                  let groupName = '';

                  if (ing.recipeGroupId) {
                    isGroup = true;
                    const grp = dataset.recipeGroups[ing.recipeGroupId];
                    groupName = grp?.name[language] || ing.recipeGroupId;
                    ingItem = dataset.items[grp?.defaultItemId || ''];
                  } else if (ing.itemId) {
                    ingItem = dataset.items[ing.itemId];
                  }

                  if (!ingItem) return null;

                  const rarityColor = getRarityColor(ingItem.rarity, ingItem.rarityName);
                  const ingModColor = getModColor(ingItem.mod, dataset);

                  return (
                    <div
                      key={iIdx}
                      className="ingredient-item-chip"
                      onClick={() => onSelectItem(ingItem!)}
                    >
                      <div className="item-icon-box" style={{ width: '32px', height: '32px' }}>
                        <ItemIcon item={ingItem} size={22} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: rarityColor,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {isGroup ? groupName : (ingItem.name[language] || ingItem.name.en)}
                        </span>

                        <span style={{ fontSize: '0.65rem', color: ingModColor }}>
                          {dataset.mods.find(m => m.id === ingItem!.mod)?.name || ingItem.mod}
                          {ing.note && ` (${ing.note})`}
                        </span>
                      </div>

                      <span className="ingredient-stack-count">
                        x{ing.stack}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 逆引き（素材としての用途）表示
  if (recipesUsedIn.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>{language === 'ja' ? 'このアイテムを素材として使用するレシピはありません' : 'No recipes use this item as material.'}</p>
      </div>
    );
  }

  return (
    <div className="recipe-card-container">
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {language === 'ja'
          ? `このアイテムから作成可能な全 ${recipesUsedIn.length} 種類のアイテム:`
          : `Total ${recipesUsedIn.length} craftable items using this as material:`}
      </div>

      <div className="ingredients-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {recipesUsedIn.map(({ resultItem, recipe }, index) => {
          const rarityColor = getRarityColor(resultItem.rarity, resultItem.rarityName);
          const modColor = getModColor(resultItem.mod, dataset);
          const modName = dataset.mods.find(m => m.id === resultItem.mod)?.name || resultItem.mod;

          return (
            <div
              key={index}
              className="ingredient-item-chip"
              style={{ padding: '12px' }}
              onClick={() => onSelectItem(resultItem)}
            >
              <div className="item-icon-box" style={{ width: '38px', height: '38px' }}>
                <ItemIcon item={resultItem} size={26} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: rarityColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {resultItem.name[language] || resultItem.name.en}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className="mod-tag-pill" style={{ backgroundColor: modColor }}>
                    {modName}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    🛠 {recipe.requiredTiles.map(t => dataset.stations[t]?.name[language] || t).join(', ') || '手作業'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
