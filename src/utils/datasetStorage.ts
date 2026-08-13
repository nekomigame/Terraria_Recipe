import { ModpackDataSet } from '../types/recipe';

const DB_NAME = 'TerrariaRecipeViewer_DatasetDB';
const DB_VERSION = 1;
const STORE_NAME = 'modpack_dataset';
const DATASET_KEY = 'active_dataset';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDatasetDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * データベース（IndexedDB）から保存済みレシピデータセットを取得
 */
export async function getSavedDataset(): Promise<ModpackDataSet | null> {
  try {
    const db = await getDatasetDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DATASET_KEY);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Failed to load dataset from IndexedDB:', err);
    return null;
  }
}

/**
 * レシピデータセットをデータベース（IndexedDB）に永続保存（容量制限なし）
 */
export async function saveDatasetToDB(dataset: ModpackDataSet): Promise<boolean> {
  try {
    const db = await getDatasetDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataset, DATASET_KEY);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => {
        console.error('Failed to save dataset to IndexedDB:', e);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('Failed to save dataset to IndexedDB:', err);
    return false;
  }
}

/**
 * 保存されたレシピデータセットをデータベースから削除
 */
export async function clearDatasetFromDB(): Promise<void> {
  try {
    const db = await getDatasetDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(DATASET_KEY);
  } catch (err) {
    console.error('Failed to clear dataset from IndexedDB:', err);
  }
}
