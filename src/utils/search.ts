import { Item, ModpackDataSet } from '../types/recipe';

export interface FilterOptions {
  query: string;
  selectedMods: string[];
  selectedCategory: string;
  isMaterialOnly: boolean;
  language: 'ja' | 'en';
}

/**
 * アイテムリストをクエリとフィルター条件で高速フィルタリング
 */
export function filterItems(
  items: Record<string, Item>,
  filters: FilterOptions
): Item[] {
  const query = filters.query.trim().toLowerCase();
  const allItems = Object.values(items);

  return allItems.filter(item => {
    // MODフィルター
    if (filters.selectedMods.length > 0 && !filters.selectedMods.includes(item.mod)) {
      return false;
    }

    // カテゴリフィルター
    if (filters.selectedCategory && filters.selectedCategory !== 'all') {
      if (item.category !== filters.selectedCategory) {
        return false;
      }
    }

    // 素材のみフィルター
    if (filters.isMaterialOnly && !item.isMaterial) {
      return false;
    }

    // 検索クエリがない場合は通過
    if (!query) return true;

    // 日本語名
    const nameJa = item.name.ja.toLowerCase();
    // 英語名
    const nameEn = item.name.en.toLowerCase();
    // 内部名 (Internal Name)
    const internalName = item.internalName.toLowerCase();
    // MOD名
    const modName = item.mod.toLowerCase();
    const modDisplayName = (item.modDisplayName || '').toLowerCase();

    // 部分一致判定
    if (
      nameJa.includes(query) ||
      nameEn.includes(query) ||
      internalName.includes(query) ||
      modName.includes(query) ||
      modDisplayName.includes(query)
    ) {
      return true;
    }

    // ツールチップ内の検索
    if (item.tooltip) {
      const matchTooltip = item.tooltip.some(t =>
        t.ja.toLowerCase().includes(query) || t.en.toLowerCase().includes(query)
      );
      if (matchTooltip) return true;
    }

    return false;
  });
}

/**
 * レアリティに応じたカラーコードを返す
 */
export function getRarityColor(rarity: number, rarityName?: string): string {
  if (rarityName === 'Rainbow' || rarityName === 'Rainbow Cosmic') {
    return 'linear-gradient(135deg, #ff0055, #ff9900, #33cc33, #3399ff, #cc33ff)';
  }
  if (rarityName === 'Calamity Violet') {
    return '#bf00ff';
  }

  switch (rarity) {
    case -1: return '#9e9e9e'; // Gray
    case 0: return '#ffffff';  // White
    case 1: return '#9696ff';  // Blue
    case 2: return '#96ff96';  // Green
    case 3: return '#ffaa55';  // Orange
    case 4: return '#ff6464';  // Light Red
    case 5: return '#ff64ff';  // Pink
    case 6: return '#bf80ff';  // Light Purple
    case 7: return '#bfff00';  // Lime
    case 8: return '#ffff00';  // Yellow
    case 9: return '#00ffff';  // Cyan
    case 10: return '#ff2a2a'; // Red
    case 11: return '#bf00ff'; // Purple
    case 12: return '#ff7700'; // Expert
    case 13: return '#e11948'; // Master
    case 14: return '#ff4081'; // Calamity High Tier
    case 15: return '#00e5ff'; // Fargo High Tier
    default: return '#ffffff';
  }
}

/**
 * MODに応じたテーマカラーを返す
 */
export function getModColor(modId: string, dataset: ModpackDataSet): string {
  const modInfo = dataset.mods.find(m => m.id === modId);
  if (modInfo && modInfo.color) return modInfo.color;

  // デフォルトカラー
  switch (modId) {
    case 'Terraria': return '#4CAF50';
    case 'CalamityMod': return '#FF5722';
    case 'FargowiltasSouls': return '#9C27B0';
    case 'FargowiltasCrossmod': return '#E91E63';
    case 'ThoriumMod': return '#00BCD4';
    default: return '#8b9bb4';
  }
}
