import {
  Item,
  Recipe,
  CraftingTreeNode,
  RawMaterialSummary,
  ModpackDataSet
} from '../types/recipe';

/**
 * 脱クラフト（家具・建材からのリサイクルなど）と疑われるキーワード
 */
const DECRAFTING_KEYWORDS = [
  'fence', 'wall', 'platform', 'door', 'chair', 'table', 'workbench', 'chest', 'bed',
  'bathtub', 'piano', 'clock', 'dresser', 'sofa', 'bookcase', 'lamp', 'lantern', 'candle',
  'chandelier', 'candelabra', 'sink', 'toilet', 'beam', 'column', 'brick'
];

/**
 * 天然素材・原材料（鉱石、原木、自然ブロック、モンスターの天然ドロップ品など）
 * これらは「採掘や採取で直接手に入れる」のが基本であり、
 * シマーや抽出機などの変換レシピが存在していてもツリー探索では末端（Raw Material）として扱う
 */
export function isNaturalRawMaterial(itemId: string, item?: Item): boolean {
  const internal = (item?.internalName || itemId).toLowerCase();

  // 1. 鉱石類（Ore, Hellstone, Luminite 等）
  if (
    internal.endsWith('ore') ||
    internal.includes('ore_') ||
    internal === 'hellstone' ||
    internal === 'luminite' ||
    internal.includes('meteorite') ||
    internal.includes('amber') ||
    internal.includes('amethyst') ||
    internal.includes('diamond') ||
    internal.includes('emerald') ||
    internal.includes('ruby') ||
    internal.includes('sapphire') ||
    internal.includes('topaz')
  ) {
    return true;
  }

  // 2. 原木類（Wood系）
  if (
    internal === 'wood' ||
    internal.endsWith('wood') ||
    internal === 'richmahogany' ||
    internal === 'dynastywood'
  ) {
    return true;
  }

  // 3. 自然ブロック・採掘ブロック
  if (
    internal === 'dirtblock' ||
    internal === 'stoneblock' ||
    internal === 'mudblock' ||
    internal === 'sandblock' ||
    internal === 'clayblock' ||
    internal === 'iceblock' ||
    internal === 'snowblock' ||
    internal === 'ashblock' ||
    internal === 'siltblock' ||
    internal === 'slushblock' ||
    internal === 'desertfossil' ||
    internal === 'obsidian' ||
    internal === 'cobweb'
  ) {
    return true;
  }

  // 4. 天然ドロップ・採取素材・ソウル
  if (
    internal === 'gel' ||
    internal === 'fallenstar' ||
    internal === 'lens' ||
    internal === 'blacklens' ||
    internal === 'rottenchunk' ||
    internal === 'vertebrae' ||
    internal === 'shadowscale' ||
    internal === 'tissuesample' ||
    internal === 'bone' ||
    internal === 'stinger' ||
    internal === 'junglespores' ||
    internal === 'vine' ||
    internal === 'feather' ||
    internal === 'sharkfin' ||
    internal.startsWith('soul') ||
    internal === 'ectoplasm' ||
    internal === 'beetlehusk' ||
    internal === 'truffleworm' ||
    internal === 'cursedflame' ||
    internal === 'ichor' ||
    internal === 'pixiedust' ||
    internal === 'unicornhorn'
  ) {
    return true;
  }

  // 5. 植物・ハーブ・キノコ
  if (
    internal === 'daybloom' ||
    internal === 'moonglow' ||
    internal === 'blinkroot' ||
    internal === 'deathweed' ||
    internal === 'waterleaf' ||
    internal === 'fireblossom' ||
    internal === 'shiverthorn' ||
    internal === 'mushroom' ||
    internal === 'glowingmushroom' ||
    internal === 'vilemushroom' ||
    internal === 'viciousmushroom'
  ) {
    return true;
  }

  return false;
}

/**
 * 逆クラフト（上位加工品から下位素材への分解）や同格相互変換（Ore ⇄ Ore）であるかを判定する
 */
export function isInvalidOrReverseRecipe(recipe: Recipe, resultItemId: string, dataset: ModpackDataSet): boolean {
  const resultItem = dataset.items[resultItemId];
  const resultInternal = (resultItem?.internalName || resultItemId).toLowerCase();

  // 1. 鉱石（Ore）を作るレシピで、素材が「インゴット（Bar）」や「他鉱石（Ore）」である場合は逆変換・相互変換
  if (isNaturalRawMaterial(resultItemId, resultItem)) {
    // 鉱石・天然素材を作るレシピは通常の順方向クラフトではない（脱クラフト / シマー / 抽出機など）
    return true;
  }

  // 2. インゴット（Bar）を作るレシピで、素材に「インゴット（Bar）」「装備（Sword/Pickaxe等）」「建材（Fence等）」が含まれる場合
  if (resultInternal.includes('bar') || resultInternal.includes('ingot')) {
    const hasReverseIngredient = recipe.ingredients.some(ing => {
      if (!ing.itemId) return false;
      const ingInternal = (dataset.items[ing.itemId]?.internalName || ing.itemId).toLowerCase();
      return (
        ingInternal.includes('bar') ||
        ingInternal.includes('ingot') ||
        DECRAFTING_KEYWORDS.some(kw => ingInternal.includes(kw)) ||
        ingInternal.includes('pickaxe') ||
        ingInternal.includes('sword') ||
        ingInternal.includes('axe') ||
        ingInternal.includes('hammer') ||
        ingInternal.includes('helmet') ||
        ingInternal.includes('breastplate') ||
        ingInternal.includes('greaves')
      );
    });

    if (hasReverseIngredient) {
      return true;
    }
  }

  // 3. ターゲットアイテムが建材ではないのに、素材に建材（Fence/Wall等）が含まれる場合
  const isResultDecraftingProduct = DECRAFTING_KEYWORDS.some(kw => resultInternal.includes(kw));
  if (!isResultDecraftingProduct) {
    const usesDecraftingItem = recipe.ingredients.some(ing => {
      if (!ing.itemId) return false;
      const ingInternal = (dataset.items[ing.itemId]?.internalName || ing.itemId).toLowerCase();
      return DECRAFTING_KEYWORDS.some(kw => ingInternal.includes(kw));
    });
    if (usesDecraftingItem) {
      return true;
    }
  }

  return false;
}

/**
 * レシピの自然さ・王道度をスコアリングして優先順位を計算する
 */
export function scoreRecipe(recipe: Recipe, itemId: string, dataset: ModpackDataSet): number {
  let score = 100;
  const targetItem = dataset.items[itemId];
  const targetInternal = (targetItem?.internalName || itemId).toLowerCase();

  // 逆クラフトや循環レシピは大幅減点
  if (isInvalidOrReverseRecipe(recipe, itemId, dataset)) {
    score -= 2000;
  }

  // インゴット（Bar）作成時の判定：鉱石からの精錬を最優先
  if (targetInternal.includes('bar') || targetInternal.includes('ingot')) {
    const usesOre = recipe.ingredients.some(ing => {
      if (!ing.itemId) return false;
      const ingInternal = (dataset.items[ing.itemId]?.internalName || ing.itemId).toLowerCase();
      return ingInternal.includes('ore') || ingInternal === 'hellstone';
    });

    if (usesOre) {
      score += 1000;
    }
  }

  // 素材の原材料度（天然素材を直接使うレシピを優遇）
  let rawIngredientCount = 0;
  for (const ing of recipe.ingredients) {
    if (ing.itemId) {
      const ingItem = dataset.items[ing.itemId];
      if (isNaturalRawMaterial(ing.itemId, ingItem)) {
        rawIngredientCount++;
      }
    }
  }
  score += rawIngredientCount * 50;

  // シンプルな素材構成
  if (recipe.ingredients.length > 0 && recipe.ingredients.length <= 4) {
    score += 30;
  }

  return score;
}

/**
 * レシピ一覧を自然な優先順位の高い順にソートし、不適切な逆変換レシピを除外または後回しにする
 */
export function sortRecipesByPriority(
  recipes: Recipe[],
  itemId: string,
  dataset: ModpackDataSet
): Recipe[] {
  // 逆クラフトではない正常なレシピを優先的に抽出
  const validRecipes = recipes.filter(r => !isInvalidOrReverseRecipe(r, itemId, dataset));
  const fallbackRecipes = recipes.filter(r => isInvalidOrReverseRecipe(r, itemId, dataset));

  const sortedValid = [...validRecipes].sort((a, b) => scoreRecipe(b, itemId, dataset) - scoreRecipe(a, itemId, dataset));
  const sortedFallback = [...fallbackRecipes].sort((a, b) => scoreRecipe(b, itemId, dataset) - scoreRecipe(a, itemId, dataset));

  return [...sortedValid, ...sortedFallback];
}

/**
 * アイテムのクラフトツリー（DAG）を再帰的に構築する
 */
export function buildCraftingTree(
  itemId: string,
  requiredAmount: number,
  dataset: ModpackDataSet,
  visitedItems: Set<string> = new Set(),
  depth: number = 0,
  maxDepth: number = 15,
  selectedRecipeIds: Record<string, string> = {}, // アイテムごとの選択レシピID
  selectedGroupVariants: Record<string, string> = {} // レシピグループごとの選択アイテムID
): CraftingTreeNode | null {
  const item = dataset.items[itemId];
  if (!item) return null;

  // 1. 循環参照検知
  if (visitedItems.has(itemId) || depth > maxDepth) {
    return {
      nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      item,
      requiredAmount,
      depth,
      children: [],
      isRawMaterial: isNaturalRawMaterial(itemId, item)
    };
  }

  // 2. 天然素材・原材料（鉱石、原木、天然ドロップ品等）の末端停止
  // （ルートノード自身でない場合は、これ以上子ノードを展開せず Raw Material として停止）
  if (depth > 0 && isNaturalRawMaterial(itemId, item) && !selectedRecipeIds[itemId]) {
    return {
      nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      item,
      requiredAmount,
      depth,
      children: [],
      isRawMaterial: true
    };
  }

  // 3. 作成可能なレシピを検索し、自然な王道順にソート
  const rawPossibleRecipes = dataset.recipes.filter(r => r.result.itemId === itemId);
  const possibleRecipes = sortRecipesByPriority(rawPossibleRecipes, itemId, dataset);
  
  // レシピが存在しない場合、または有効な正方向レシピがない天然素材
  if (possibleRecipes.length === 0 || (depth > 0 && isNaturalRawMaterial(itemId, item))) {
    return {
      nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      item,
      requiredAmount,
      depth,
      children: [],
      isRawMaterial: true
    };
  }

  // 指定されたレシピ、なければ最もスコアの高い（王道の）レシピを使用
  const chosenRecipe = possibleRecipes.find(r => r.id === selectedRecipeIds[itemId]) || possibleRecipes[0];
  
  // もし選ばれたレシピが逆変換（シマーや鉱石相互変換）であり、手動指定されていない場合は末端停止
  if (depth > 0 && isInvalidOrReverseRecipe(chosenRecipe, itemId, dataset) && !selectedRecipeIds[itemId]) {
    return {
      nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      item,
      requiredAmount,
      depth,
      children: [],
      isRawMaterial: true
    };
  }

  const yieldStack = chosenRecipe.result.stack || 1;
  const craftTimes = Math.ceil(requiredAmount / yieldStack);

  const nextVisited = new Set(visitedItems);
  nextVisited.add(itemId);

  const children: CraftingTreeNode[] = [];

  for (const ingredient of chosenRecipe.ingredients) {
    const totalIngredientNeeded = ingredient.stack * craftTimes;

    if (ingredient.recipeGroupId) {
      const group = dataset.recipeGroups[ingredient.recipeGroupId];
      const actualItemId = (group && selectedGroupVariants[group.id]) || (group && group.defaultItemId) || ingredient.itemId || '';
      const actualItem = dataset.items[actualItemId];

      if (actualItem) {
        const childNode = buildCraftingTree(
          actualItemId,
          totalIngredientNeeded,
          dataset,
          nextVisited,
          depth + 1,
          maxDepth,
          selectedRecipeIds,
          selectedGroupVariants
        );
        if (childNode) {
          childNode.isRecipeGroup = true;
          childNode.recipeGroupId = ingredient.recipeGroupId;
          childNode.selectedVariantId = actualItemId;
          children.push(childNode);
        }
      }
    } else if (ingredient.itemId) {
      const childNode = buildCraftingTree(
        ingredient.itemId,
        totalIngredientNeeded,
        dataset,
        nextVisited,
        depth + 1,
        maxDepth,
        selectedRecipeIds,
        selectedGroupVariants
      );
      if (childNode) {
        children.push(childNode);
      }
    }
  }

  return {
    nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
    itemId,
    item,
    requiredAmount,
    depth,
    recipe: chosenRecipe,
    availableRecipes: possibleRecipes,
    children,
    isRawMaterial: false,
    craftStep: craftTimes
  };
}

/**
 * クラフトツリー全体から末端基本素材（Raw Materials）を集計する
 */
export function aggregateRawMaterials(
  rootNode: CraftingTreeNode | null
): RawMaterialSummary[] {
  if (!rootNode) return [];

  const rawMap = new Map<string, { item: Item; totalRequired: number; isRecipeGroup?: boolean; recipeGroupId?: string }>();

  function traverse(node: CraftingTreeNode) {
    if (node.isRawMaterial || node.children.length === 0) {
      const existing = rawMap.get(node.itemId);
      if (existing) {
        existing.totalRequired += node.requiredAmount;
      } else {
        rawMap.set(node.itemId, {
          item: node.item,
          totalRequired: node.requiredAmount,
          isRecipeGroup: node.isRecipeGroup,
          recipeGroupId: node.recipeGroupId
        });
      }
    } else {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(rootNode);

  return Array.from(rawMap.entries()).map(([itemId, val]) => ({
    itemId,
    item: val.item,
    totalRequired: val.totalRequired,
    ownedCount: 0,
    isRecipeGroup: val.isRecipeGroup,
    recipeGroupId: val.recipeGroupId
  }));
}

/**
 * 指定アイテムを素材として使う全レシピ（逆引き Used In）を検索する
 */
export function findRecipesUsingItem(
  itemId: string,
  dataset: ModpackDataSet
): Array<{ recipe: Recipe; resultItem: Item }> {
  // アイテムが属するレシピグループも特定
  const groupIds = Object.values(dataset.recipeGroups)
    .filter(g => g.validItemIds.includes(itemId))
    .map(g => g.id);

  const results: Array<{ recipe: Recipe; resultItem: Item }> = [];

  for (const recipe of dataset.recipes) {
    const isUsed = recipe.ingredients.some(
      ing => (ing.itemId && ing.itemId === itemId) || (ing.recipeGroupId && groupIds.includes(ing.recipeGroupId))
    );

    if (isUsed) {
      const resultItem = dataset.items[recipe.result.itemId];
      if (resultItem) {
        results.push({ recipe, resultItem });
      }
    }
  }

  return results;
}
