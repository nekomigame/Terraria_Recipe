import { storeBatchBlobs } from './imageStorage';
import { createItemIdLookup, matchItemIdFromFilenameFast } from './itemImage';

/**
 * 複数の画像ファイル（File[]）を非同期チャンク分割で高速インポート
 * （メインスレッドをブロックせず、Blob直接保存で15,000件でも一瞬で完了）
 */
export async function importImageFiles(
  files: FileList | File[],
  knownItemIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; skippedCount: number }> {
  const fileArray = Array.from(files).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));
  const total = fileArray.length;
  if (total === 0) return { successCount: 0, skippedCount: 0 };

  // O(1) 高速ルックアップテーブルを事前に1回だけ作成
  const lookup = createItemIdLookup(knownItemIds);

  let successCount = 0;
  let skippedCount = 0;
  const CHUNK_SIZE = 250; // 250ファイルごとにIndexedDB保存 & UIスレッド解放

  let currentBatch: Array<{ id: string; blob: File }> = [];

  for (let i = 0; i < total; i++) {
    const file = fileArray[i];
    const matchedId = matchItemIdFromFilenameFast(file.name, lookup);

    if (matchedId) {
      currentBatch.push({ id: matchedId, blob: file });
      successCount++;
    } else {
      skippedCount++;
    }

    // チャンクが溜まったらIndexedDBにバッチ保存してUIイベントループを回す
    if (currentBatch.length >= CHUNK_SIZE) {
      await storeBatchBlobs(currentBatch);
      currentBatch = [];
      if (onProgress) onProgress(i + 1, total);
      // UIがフリーズしないようブラウザに描画・制御を戻す
      await new Promise(resolve => setTimeout(resolve, 0));
    } else if (i % 50 === 0 && onProgress) {
      onProgress(i + 1, total);
    }
  }

  // 残りのバッチを保存
  if (currentBatch.length > 0) {
    await storeBatchBlobs(currentBatch);
  }

  if (onProgress) onProgress(total, total);
  return { successCount, skippedCount };
}
