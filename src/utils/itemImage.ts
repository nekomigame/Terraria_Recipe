import { Item } from '../types/recipe';

/**
 * 高速オープンソースCDN（GitHub / jsDelivr）の画像URLを生成する
 */
export function getFastCdnImageUrl(item?: Item | null): string | null {
  if (!item) return null;

  // 1. エクスポートされたテクスチャ（Base64または埋め込みURL）
  if (item.icon && item.icon.length > 0) {
    return item.icon;
  }

  const internal = item.internalName || item.id.replace(/^.*:/, '');
  const cleanInternal = internal.replace(/\s+/g, '_');

  // 2. バニラ Terraria アイテム (jsDelivr / GitHub 高速 CDN)
  if (item.mod === 'Terraria' || item.id.startsWith('Terraria:')) {
    return `https://cdn.jsdelivr.net/gh/Terraria-Wiki/assets@master/items/${cleanInternal}.png`;
  }

  // 3. Calamity Mod (GitHub CDN)
  if (item.mod === 'CalamityMod' || item.id.startsWith('CalamityMod:')) {
    return `https://raw.githubusercontent.com/CalamityTeam/CalamityModPublic/master/Items/${cleanInternal}.png`;
  }

  return null;
}

/**
 * ファイル名高速ルックアップ用のハッシュマップ構造体
 */
export interface ItemIdLookup {
  exactSet: Set<string>;
  baseNameMap: Map<string, string>; // "terramod_blade" -> "TerraMod:Blade", "terrablade" -> "Terraria:TerraBlade"
}

export function createItemIdLookup(knownItemIds: string[]): ItemIdLookup {
  const exactSet = new Set<string>(knownItemIds);
  const baseNameMap = new Map<string, string>();

  for (const id of knownItemIds) {
    // 例: "Terraria:TerraBlade" -> "terraria_terrablade", "terrablade"
    const lowerId = id.toLowerCase();
    const underscoreId = lowerId.replace(':', '_');
    baseNameMap.set(underscoreId, id);

    const colonIdx = id.indexOf(':');
    if (colonIdx !== -1) {
      const namePart = id.substring(colonIdx + 1).toLowerCase();
      if (!baseNameMap.has(namePart)) {
        baseNameMap.set(namePart, id);
      }
    }
  }

  return { exactSet, baseNameMap };
}

/**
 * O(1) 高速ファイル名判定
 */
export function matchItemIdFromFilenameFast(filename: string, lookup: ItemIdLookup): string | null {
  const baseName = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');

  // 1. 完全一致
  if (lookup.exactSet.has(baseName)) {
    return baseName;
  }

  const lowerBase = baseName.toLowerCase();

  // 2. ハッシュマップから O(1) 検索
  const mapped = lookup.baseNameMap.get(lowerBase);
  if (mapped) return mapped;

  // 3. アンダースコア -> コロン
  const colonCandidate = baseName.replace('_', ':');
  if (lookup.exactSet.has(colonCandidate)) {
    return colonCandidate;
  }

  // 4. バニラ候補
  const vanillaCandidate = `Terraria:${baseName}`;
  if (lookup.exactSet.has(vanillaCandidate)) {
    return vanillaCandidate;
  }

  return null;
}
