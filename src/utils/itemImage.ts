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
    // jsDelivr の高速 CDN
    return `https://cdn.jsdelivr.net/gh/Terraria-Wiki/assets@master/items/${cleanInternal}.png`;
  }

  // 3. Calamity Mod (GitHub CDN)
  if (item.mod === 'CalamityMod' || item.id.startsWith('CalamityMod:')) {
    return `https://raw.githubusercontent.com/CalamityTeam/CalamityModPublic/master/Items/${cleanInternal}.png`;
  }

  return null;
}

/**
 * ファイル名からアイテムIDを推定・正規化する
 * 例: "Terraria_TerraBlade.png" -> "Terraria:TerraBlade"
 * 例: "TerraBlade.png" -> "Terraria:TerraBlade"
 * 例: "CalamityMod_AuricBar.png" -> "CalamityMod:AuricBar"
 */
export function matchItemIdFromFilename(filename: string, knownItemIds: string[]): string | null {
  const baseName = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');

  // 1. 完全一致 (例: "Terraria:TerraBlade")
  if (knownItemIds.includes(baseName)) {
    return baseName;
  }

  // 2. アンダースコア区切り (例: "Terraria_TerraBlade" -> "Terraria:TerraBlade")
  const colonName = baseName.replace('_', ':');
  if (knownItemIds.includes(colonName)) {
    return colonName;
  }

  // 3. 内部名のみ (例: "TerraBlade" -> "Terraria:TerraBlade")
  const vanillaCandidate = `Terraria:${baseName}`;
  if (knownItemIds.includes(vanillaCandidate)) {
    return vanillaCandidate;
  }

  // 4. 登録アイテム一覧から末尾一致を検索
  const match = knownItemIds.find(id => id.endsWith(`:${baseName}`) || id.toLowerCase() === baseName.toLowerCase());
  return match || null;
}
