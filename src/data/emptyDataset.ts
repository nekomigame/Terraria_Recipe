import { ModpackDataSet } from '../types/recipe';

/**
 * 初期状態用 空のデータセット
 */
export const emptyDataset: ModpackDataSet = {
  version: '1.0.0',
  exportedAt: '',
  gameVersion: '',
  tModLoaderVersion: '',
  mods: [],
  items: {},
  recipes: [],
  recipeGroups: {},
  stations: {}
};
