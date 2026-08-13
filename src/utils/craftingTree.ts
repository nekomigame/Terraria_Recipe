import {
  Item,
  Recipe,
  CraftingTreeNode,
  RawMaterialSummary,
  ModpackDataSet
} from '../types/recipe';

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

  // 循環参照検知
  if (visitedItems.has(itemId) || depth > maxDepth) {
    return {
      nodeId: `${itemId}_${depth}_${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      item,
      requiredAmount,
      depth,
      children: [],
      isRawMaterial: false
    };
  }

  // 作成可能なレシピを検索
  const possibleRecipes = dataset.recipes.filter(r => r.result.itemId === itemId);
  
  // レシピが存在しない場合は末端の基本素材
  if (possibleRecipes.length === 0) {
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

  // 指定されたレシピ、なければ最初のレシピを使用
  const chosenRecipe = possibleRecipes.find(r => r.id === selectedRecipeIds[itemId]) || possibleRecipes[0];
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
