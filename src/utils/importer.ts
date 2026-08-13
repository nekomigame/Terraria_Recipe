import { ModpackDataSet, Item, Recipe, RecipeGroup, CraftingStation } from '../types/recipe';

/**
 * 読み込んだ JSON データを ModpackDataSet に安全に正規化・検証する
 */
export function normalizeModpackData(raw: any): ModpackDataSet {
  if (!raw || typeof raw !== 'object') {
    throw new Error('JSONの形式が無効です（オブジェクトではありません）。');
  }

  // items の正規化 (Array または Record<string, ItemEntry>)
  const itemsMap: Record<string, Item> = {};
  if (raw.items) {
    if (Array.isArray(raw.items)) {
      for (const it of raw.items) {
        if (!it) continue;
        const id = it.id || it.internalName || `Item_${Object.keys(itemsMap).length}`;
        itemsMap[id] = normalizeItem(it, id);
      }
    } else if (typeof raw.items === 'object') {
      for (const [key, it] of Object.entries<any>(raw.items)) {
        if (!it) continue;
        const id = it.id || key;
        itemsMap[id] = normalizeItem(it, id);
      }
    }
  }

  // recipes の正規化
  const recipesList: Recipe[] = [];
  if (Array.isArray(raw.recipes)) {
    for (let i = 0; i < raw.recipes.length; i++) {
      const r = raw.recipes[i];
      if (!r || !r.result) continue;
      recipesList.push({
        id: r.id || `rec_${i}`,
        result: {
          itemId: r.result.itemId || r.result.id || '',
          stack: typeof r.result.stack === 'number' ? r.result.stack : 1
        },
        ingredients: Array.isArray(r.ingredients)
          ? r.ingredients.map((ing: any) => ({
              itemId: ing.itemId || ing.id || undefined,
              recipeGroupId: ing.recipeGroupId || ing.groupId || undefined,
              stack: typeof ing.stack === 'number' ? ing.stack : 1,
              note: ing.note || undefined
            }))
          : [],
        requiredTiles: Array.isArray(r.requiredTiles) ? r.requiredTiles : [],
        requiredConditions: Array.isArray(r.requiredConditions) ? r.requiredConditions : [],
        mod: r.mod || 'Terraria'
      });
    }
  }

  // recipeGroups の正規化
  const recipeGroupsMap: Record<string, RecipeGroup> = {};
  if (raw.recipeGroups && typeof raw.recipeGroups === 'object') {
    if (Array.isArray(raw.recipeGroups)) {
      for (const rg of raw.recipeGroups) {
        if (!rg || !rg.id) continue;
        recipeGroupsMap[rg.id] = normalizeRecipeGroup(rg, rg.id);
      }
    } else {
      for (const [key, rg] of Object.entries<any>(raw.recipeGroups)) {
        if (!rg) continue;
        const id = rg.id || key;
        recipeGroupsMap[id] = normalizeRecipeGroup(rg, id);
      }
    }
  }

  // stations の正規化
  const stationsMap: Record<string, CraftingStation> = {};
  if (raw.stations && typeof raw.stations === 'object') {
    if (Array.isArray(raw.stations)) {
      for (const st of raw.stations) {
        if (!st || !st.id) continue;
        stationsMap[st.id] = normalizeStation(st, st.id);
      }
    } else {
      for (const [key, st] of Object.entries<any>(raw.stations)) {
        if (!st) continue;
        const id = st.id || key;
        stationsMap[id] = normalizeStation(st, id);
      }
    }
  }

  // mods の正規化
  const modsList = Array.isArray(raw.mods)
    ? raw.mods.map((m: any) => ({
        id: m.id || m.name || 'UnknownMod',
        name: m.name || m.displayName || m.id || 'Unknown Mod',
        version: m.version || '1.0.0',
        color: m.color
      }))
    : [];

  const totalItems = Object.keys(itemsMap).length;
  if (totalItems === 0 && recipesList.length === 0) {
    throw new Error('有効なアイテムまたはレシピが見つかりませんでした。');
  }

  return {
    version: raw.version || '1.0.0',
    exportedAt: raw.exportedAt || new Date().toISOString(),
    gameVersion: raw.gameVersion || 'Terraria',
    tModLoaderVersion: raw.tModLoaderVersion || 'tModLoader',
    mods: modsList,
    items: itemsMap,
    recipes: recipesList,
    recipeGroups: recipeGroupsMap,
    stations: stationsMap
  };
}

function normalizeItem(it: any, defaultId: string): Item {
  const nameEn = typeof it.name === 'object' ? (it.name?.en || it.name?.ja || it.internalName || defaultId) : String(it.name || it.internalName || defaultId);
  const nameJa = typeof it.name === 'object' ? (it.name?.ja || it.name?.en || it.internalName || defaultId) : nameEn;

  return {
    id: it.id || defaultId,
    internalName: it.internalName || it.id || defaultId,
    mod: it.mod || 'Terraria',
    modDisplayName: it.modDisplayName || it.mod || 'Terraria',
    name: {
      en: nameEn,
      ja: nameJa
    },
    rarity: typeof it.rarity === 'number' ? it.rarity : 0,
    rarityName: it.rarityName || undefined,
    maxStack: typeof it.maxStack === 'number' ? it.maxStack : 999,
    isMaterial: Boolean(it.isMaterial),
    category: it.category || 'material',
    icon: it.icon || undefined
  };
}

function normalizeRecipeGroup(rg: any, defaultId: string): RecipeGroup {
  const nameEn = typeof rg.name === 'object' ? (rg.name?.en || defaultId) : String(rg.name || defaultId);
  const nameJa = typeof rg.name === 'object' ? (rg.name?.ja || nameEn) : nameEn;

  return {
    id: rg.id || defaultId,
    name: { en: nameEn, ja: nameJa },
    defaultItemId: rg.defaultItemId || (Array.isArray(rg.validItemIds) ? rg.validItemIds[0] : ''),
    validItemIds: Array.isArray(rg.validItemIds) ? rg.validItemIds : []
  };
}

function normalizeStation(st: any, defaultId: string): CraftingStation {
  const nameEn = typeof st.name === 'object' ? (st.name?.en || defaultId) : String(st.name || defaultId);
  const nameJa = typeof st.name === 'object' ? (st.name?.ja || nameEn) : nameEn;

  return {
    id: st.id || defaultId,
    name: { en: nameEn, ja: nameJa },
    mod: st.mod || 'Terraria'
  };
}
