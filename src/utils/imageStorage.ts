/**
 * IndexedDB を用いたアイテム画像のローカルストレージ & キャッシュ管理
 * （Blobネイティブ対応で超低メモリ・超高速）
 */

const DB_NAME = 'TerrariaRecipeViewer_ImageDB';
const DB_VERSION = 2; // Blobサポートのためバージョンアップ
const STORE_NAME = 'item_icons';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// メモリ内 Blob URL キャッシュ
const objectUrlCache = new Map<string, string>();

/**
 * アイテムの保存済み画像（Blob Object URL または Data URL）を取得
 */
export async function getStoredItemImage(itemId: string): Promise<string | null> {
  if (objectUrlCache.has(itemId)) {
    return objectUrlCache.get(itemId)!;
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(itemId);

      req.onsuccess = () => {
        const res = req.result;
        if (!res) {
          resolve(null);
          return;
        }

        if (res.blob instanceof Blob) {
          const url = URL.createObjectURL(res.blob);
          objectUrlCache.set(itemId, url);
          resolve(url);
        } else if (res.dataUrl) {
          objectUrlCache.set(itemId, res.dataUrl);
          resolve(res.dataUrl);
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
 * 複数アイテムの画像（BlobまたはFile）をバッチ保存
 */
export async function storeBatchBlobs(items: Array<{ id: string; blob: Blob | File }>): Promise<number> {
  if (items.length === 0) return 0;

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const item of items) {
      store.put({ id: item.id, blob: item.blob, savedAt: Date.now() });
      // すぐに使えるようにObject URLをキャッシュ
      const url = URL.createObjectURL(item.blob);
      objectUrlCache.set(item.id, url);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(items.length);
      tx.onerror = () => resolve(items.length);
    });
  } catch {
    return items.length;
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
  objectUrlCache.forEach(url => URL.revokeObjectURL(url));
  objectUrlCache.clear();
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch {
    // ignore
  }
}
