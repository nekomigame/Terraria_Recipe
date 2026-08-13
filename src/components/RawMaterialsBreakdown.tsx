import React, { useState } from 'react';
import { RawMaterialSummary, ModpackDataSet, Item } from '../types/recipe';
import { getRarityColor, getModColor } from '../utils/search';
import { ItemIcon } from './ItemIcon';
import { CheckCircle2, Circle, Calculator } from 'lucide-react';

interface RawMaterialsBreakdownProps {
  materials: RawMaterialSummary[];
  dataset: ModpackDataSet;
  language: 'ja' | 'en';
  onSelectItem: (item: Item) => void;
}

export const RawMaterialsBreakdown: React.FC<RawMaterialsBreakdownProps> = ({
  materials,
  dataset,
  language,
  onSelectItem
}) => {
  const [ownedCounts, setOwnedCounts] = useState<Record<string, number>>({});

  const handleCountChange = (itemId: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setOwnedCounts(prev => ({ ...prev, [itemId]: num }));
  };

  const handleToggleComplete = (itemId: string, total: number) => {
    setOwnedCounts(prev => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: current >= total ? 0 : total };
    });
  };

  if (materials.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {language === 'ja' ? '必要な基本素材はありません' : 'No base raw materials required'}
      </div>
    );
  }

  // 進捗率の計算
  const totalRequiredSum = materials.reduce((acc, m) => acc + m.totalRequired, 0);
  const totalOwnedSum = materials.reduce((acc, m) => {
    const owned = ownedCounts[m.itemId] || 0;
    return acc + Math.min(owned, m.totalRequired);
  }, 0);
  const progressPercent = totalRequiredSum > 0 ? Math.round((totalOwnedSum / totalRequiredSum) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 全体進捗バー */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Calculator size={18} color="var(--accent-gold)" />
            <span>{language === 'ja' ? '素材収集進捗' : 'Material Gathering Progress'}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
            {progressPercent}%
          </span>
        </div>

        <div
          style={{
            height: '10px',
            background: 'var(--bg-darkest)',
            borderRadius: '5px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-crimson), var(--accent-gold))',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* 素材集計テーブル */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'hsl(220, 22%, 12%)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>{language === 'ja' ? '素材' : 'Material'}</th>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>MOD</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>{language === 'ja' ? '必要数' : 'Required'}</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>{language === 'ja' ? '所持数' : 'Owned'}</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>{language === 'ja' ? '不足数' : 'Remaining'}</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>{language === 'ja' ? '完了' : 'Done'}</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(mat => {
              const owned = ownedCounts[mat.itemId] || 0;
              const remaining = Math.max(0, mat.totalRequired - owned);
              const isDone = remaining === 0;
              const rarityColor = getRarityColor(mat.item.rarity, mat.item.rarityName);
              const modColor = getModColor(mat.item.mod, dataset);
              const modName = dataset.mods.find(m => m.id === mat.item.mod)?.name || mat.item.mod;

              return (
                <tr
                  key={mat.itemId}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isDone ? 'hsla(120, 40%, 15%, 0.3)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* アイテム名 & アイコン */}
                  <td style={{ padding: '10px 14px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      onClick={() => onSelectItem(mat.item)}
                    >
                      <div className="item-icon-box" style={{ width: '30px', height: '30px' }}>
                        <ItemIcon item={mat.item} size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: rarityColor }}>
                          {mat.item.name[language] || mat.item.name.en}
                        </span>
                        {mat.item.obtainInfo && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {mat.item.obtainInfo[language] || mat.item.obtainInfo.en}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* MOD */}
                  <td style={{ padding: '10px 14px' }}>
                    <span className="mod-tag-pill" style={{ backgroundColor: modColor }}>
                      {modName}
                    </span>
                  </td>

                  {/* 必要数 */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-pixel)', color: 'var(--accent-gold)' }}>
                    {mat.totalRequired}
                  </td>

                  {/* 所持数入力 */}
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={owned || ''}
                      placeholder="0"
                      onChange={e => handleCountChange(mat.itemId, e.target.value)}
                      style={{
                        width: '70px',
                        padding: '4px 8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '4px',
                        color: 'var(--text-main)',
                        textAlign: 'center',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.75rem'
                      }}
                    />
                  </td>

                  {/* 不足数 */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-pixel)', color: isDone ? 'var(--accent-cyan)' : 'var(--accent-crimson)' }}>
                    {remaining}
                  </td>

                  {/* チェック */}
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleComplete(mat.itemId, mat.totalRequired)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isDone ? '#4caf50' : 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
