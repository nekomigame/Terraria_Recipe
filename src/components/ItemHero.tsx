import React from 'react';
import { Item, ModpackDataSet } from '../types/recipe';
import { getRarityColor, getModColor } from '../utils/search';
import { ItemIcon } from './ItemIcon';
import { Info } from 'lucide-react';

interface ItemHeroProps {
  item: Item;
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
}

export const ItemHero: React.FC<ItemHeroProps> = ({ item, dataset, language }) => {
  const rarityColor = getRarityColor(item.rarity, item.rarityName);
  const modColor = getModColor(item.mod, dataset);
  const modInfo = dataset.mods.find(m => m.id === item.mod);

  return (
    <div className="item-detail-hero">
      <div className="hero-main-info">
        <div className="hero-large-icon">
          <ItemIcon item={item} size={40} />
        </div>

        <div className="hero-titles">
          <h2 style={{ color: rarityColor }}>
            {item.name[language] || item.name.en}
          </h2>

          <div className="hero-sub-titles">
            <span
              className="mod-tag-pill"
              style={{ backgroundColor: modColor, fontSize: '0.75rem', padding: '2px 8px' }}
            >
              {modInfo?.name || item.mod}
            </span>

            <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>
              ID: {item.id}
            </span>

            {item.isMaterial && (
              <span
                style={{
                  color: 'var(--accent-cyan)',
                  fontSize: '0.75rem',
                  border: '1px solid var(--accent-cyan)',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                {language === 'ja' ? '素材アイテム' : 'Material'}
              </span>
            )}
          </div>

          {/* 入手方法情報 */}
          {item.obtainInfo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                fontSize: '0.8rem',
                color: 'var(--accent-gold)'
              }}
            >
              <Info size={14} />
              <span>{item.obtainInfo[language] || item.obtainInfo.en}</span>
            </div>
          )}

          {/* ツールチップ行 */}
          {item.tooltip && item.tooltip.length > 0 && (
            <div className="hero-tooltip-box">
              {item.tooltip.map((tip, idx) => (
                <div key={idx}>{tip[language] || tip.en}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
