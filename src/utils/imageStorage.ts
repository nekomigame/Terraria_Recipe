/**
 * IndexedDB を用いたアイテム画像のローカルストレージ & キャッシュ管理
 */

const DB_NAME = 'TerrariaRecipeViewer_ImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'item_icons';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// メモリ内高速キャッシュ
const memoryCache = new Map<string, string>();

/**
 * アイテムの保存済み画像（Base64 Data URL または Blob URL）を取得
 */
export async function getStoredItemImage(itemId: string): Promise<string | null> {
  if (memoryCache.has(itemId)) {
    return memoryCache.get(itemId)!;
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(itemId);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          memoryCache.set(itemId, req.result.dataUrl);
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * 単一アイテムの画像を保存
 */
export async function storeItemImage(itemId: string, dataUrl: string): Promise<void> {
  memoryCache.set(itemId, dataUrl);

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: itemId, dataUrl, savedAt: Date.now() });
  } catch {
    // ignore
  }
}

/**
 * 複数アイテムの画像を一括保存（フォルダやzipのインポート時）
 */
export async function storeBatchItemImages(images: Array<{ id: string; dataUrl: string }>): Promise<number> {
  if (images.length === 0) return 0;

  for (const img of images) {
    memoryCache.set(img.id, img.dataUrl);
  }

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const img of images) {
      store.put({ id: img.id, dataUrl: img.dataUrl, savedAt: Date.now() });
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(images.length);
      tx.onerror = () => resolve(images.length);
    });
  } catch {
    return images.length;
  }
}

/**
 * 保存されているすべての画像数を取得
 */
export async function getStoredImageCount(): Promise<number> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * 保存された全画像キャッシュをクリア
 */
export async function clearAllStoredImages(): Promise<void> {
  memoryCache.clear();
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch {
    // ignore
  }
}
