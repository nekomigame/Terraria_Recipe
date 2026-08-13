import { storeBatchItemImages } from './imageStorage';
import { matchItemIdFromFilename } from './itemImage';

/**
 * 複数の画像ファイル（File[]）を読み込んで IndexedDB に一括登録する
 */
export async function importImageFiles(
  files: FileList | File[],
  knownItemIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; skippedCount: number }> {
  const fileArray = Array.from(files).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));
  const total = fileArray.length;
  if (total === 0) return { successCount: 0, skippedCount: 0 };

  const batch: Array<{ id: string; dataUrl: string }> = [];
  let processed = 0;
  let skipped = 0;

  for (const file of fileArray) {
    const matchedId = matchItemIdFromFilename(file.name, knownItemIds);
    if (!matchedId) {
      skipped++;
      processed++;
      if (onProgress) onProgress(processed, total);
      continue;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      batch.push({ id: matchedId, dataUrl });
    } catch {
      skipped++;
    }

    processed++;
    if (onProgress && processed % 50 === 0) {
      onProgress(processed, total);
    }
  }

  if (batch.length > 0) {
    await storeBatchItemImages(batch);
  }

  if (onProgress) onProgress(total, total);
  return { successCount: batch.length, skippedCount: skipped };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
