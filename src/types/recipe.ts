/**
 * Terraria & tModLoader レシピビューアー用 型定義
 */

// アイテムの多言語表記
export interface LocalizedText {
  en: string;
  ja: string;
}

// アイテム定義
export interface Item {
  id: string;              // 一意なID (例: "Terraria:TerraBlade", "CalamityMod:AuricBar")
  internalName: string;    // ゲーム内内部名 (例: "TerraBlade")
  mod: string;             // MOD識別子 (例: "Terraria", "CalamityMod", "FargowiltasSouls")
  modDisplayName?: string; // MOD表示名 (例: "Vanilla", "Calamity Mod", "Fargo's Souls")
  name: LocalizedText;     // 多言語表示名
  tooltip?: LocalizedText[]; // ツールチップ行
  rarity: number;          // レアリティ (-1: Gray, 0: White, 1: Blue, 2: Green ... 10: Red, 11: Purple, 12+: Master/Expert/Mod)
  rarityName?: string;     // レアリティ特殊名 (例: "Expert", "Master", "Calamity Violet", "Rainbow")
  icon?: string;           // 画像URL または Base64 / SVGプレースホルダー
  maxStack?: number;       // 最大スタック数
  isMaterial: boolean;     // 素材として使えるか
  category?: 'weapon' | 'armor' | 'accessory' | 'material' | 'consumable' | 'tool' | 'placeable' | 'other';
  obtainInfo?: LocalizedText; // ドロップ敵・入手方法（鉱石採掘、ボスドロップ等）
}

// レシピ素材定義
export interface RecipeIngredient {
  itemId?: string;         // アイテムID（固定アイテムの場合）
  recipeGroupId?: string;  // レシピグループID（「Any Iron Bar」等）
  stack: number;           // 必要個数
  note?: string;           // 備考（例: "Cross-Mod素材"）
}

// レシピ定義
export interface Recipe {
  id: string;              // レシピID
  result: {
    itemId: string;
    stack: number;
  };
  ingredients: RecipeIngredient[];
  requiredTiles: string[]; // 必要な作業台ID (例: "Terraria:Anvils", "Terraria:MythrilAnvil")
  requiredConditions?: string[]; // 作成条件 (例: "Near Water", "In Graveyard")
  mod: string;             // レシピを追加/変更したMOD
}

// レシピグループ定義（代替可能素材）
export interface RecipeGroup {
  id: string;              // グループID (例: "IronBar", "Wood", "MythrilAnvil")
  name: LocalizedText;     // 表示名 (例: "任意の鉄のインゴット")
  defaultItemId: string;   // デフォルトの代表アイテムID
  validItemIds: string[];  // 対象となるアイテムID一覧
}

// 作業台・タイル定義
export interface CraftingStation {
  id: string;
  name: LocalizedText;
  icon?: string;
  mod: string;
}

// クラフトツリーのノードデータ（DAG計算用）
export interface CraftingTreeNode {
  nodeId: string;
  itemId: string;
  item: Item;
  requiredAmount: number;
  depth: number;
  recipe?: Recipe;
  children: CraftingTreeNode[];
  isRawMaterial: boolean;  // これ以上クラフトできない末端素材（鉱石やドロップ品）
  isRecipeGroup?: boolean;
  recipeGroupId?: string;
  selectedVariantId?: string; // レシピグループで選択された具体的なアイテムID
  craftStep?: number;
  collapsed?: boolean;
}

// 集計された末端基本素材
export interface RawMaterialSummary {
  itemId: string;
  item: Item;
  totalRequired: number;
  ownedCount: number;
  isRecipeGroup?: boolean;
  recipeGroupId?: string;
}

// 全データセットの構造（JSONエクスポート/インポート用）
export interface ModpackDataSet {
  version: string;
  exportedAt: string;
  gameVersion: string;
  tModLoaderVersion: string;
  mods: Array<{
    id: string;
    name: string;
    version: string;
    color?: string;
  }>;
  items: Record<string, Item>;
  recipes: Recipe[];
  recipeGroups: Record<string, RecipeGroup>;
  stations: Record<string, CraftingStation>;
}
