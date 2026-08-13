import JSZip from 'jszip';
import { storeBatchBlobs } from './imageStorage';
import { createItemIdLookup, matchItemIdFromFilenameFast } from './itemImage';

/**
 * 1つの ZIP ファイル（modpack_icons.zip）を解凍し、IndexedDB に展開保存
 * （※14,000個の個別ファイルをOSで触る必要がなく、PCフリーズが完全にゼロ）
 */
export async function importZipFile(
  zipFile: File,
  knownItemIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; skippedCount: number }> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  const lookup = createItemIdLookup(knownItemIds);
  const imageEntries = Object.keys(zipContent.files).filter(filename =>
    !zipContent.files[filename].dir && /\.(png|jpg|jpeg|webp)$/i.test(filename)
  );

  const total = imageEntries.length;
  if (total === 0) return { successCount: 0, skippedCount: 0 };

  let successCount = 0;
  let skippedCount = 0;
  const CHUNK_SIZE = 200;
  let currentBatch: Array<{ id: string; blob: Blob }> = [];

  for (let i = 0; i < total; i++) {
    const entryPath = imageEntries[i];
    // パスからファイル名のみ抽出
    const fileName = entryPath.replace(/^.*[\\\/]/, '');
    const matchedId = matchItemIdFromFilenameFast(fileName, lookup);

    if (matchedId) {
      const blob = await zipContent.files[entryPath].async('blob');
      currentBatch.push({ id: matchedId, blob });
      successCount++;
    } else {
      skippedCount++;
    }

    if (currentBatch.length >= CHUNK_SIZE) {
      await storeBatchBlobs(currentBatch);
      currentBatch = [];
      if (onProgress) onProgress(i + 1, total);
      await new Promise(resolve => setTimeout(resolve, 0));
    } else if (i % 50 === 0 && onProgress) {
      onProgress(i + 1, total);
    }
  }

  if (currentBatch.length > 0) {
    await storeBatchBlobs(currentBatch);
  }

  if (onProgress) onProgress(total, total);
  return { successCount, skippedCount };
}

/**
 * フォルダ選択（webkitdirectory）またはファイル一覧から高速インポート
 */
export async function importImageFiles(
  files: FileList | File[],
  knownItemIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; skippedCount: number }> {
  // もし 1 つの ZIP ファイルだった場合は自動で ZIP 解凍ルーチンへ分岐
  if (files.length === 1 && (files[0].name.endsWith('.zip') || files[0].type.includes('zip'))) {
    return importZipFile(files[0], knownItemIds, onProgress);
  }

  const fileArray = Array.from(files).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));
  const total = fileArray.length;
  if (total === 0) return { successCount: 0, skippedCount: 0 };

  const lookup = createItemIdLookup(knownItemIds);

  let successCount = 0;
  let skippedCount = 0;
  const CHUNK_SIZE = 250;

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

    if (currentBatch.length >= CHUNK_SIZE) {
      await storeBatchBlobs(currentBatch);
      currentBatch = [];
      if (onProgress) onProgress(i + 1, total);
      await new Promise(resolve => setTimeout(resolve, 0));
    } else if (i % 50 === 0 && onProgress) {
      onProgress(i + 1, total);
    }
  }

  if (currentBatch.length > 0) {
    await storeBatchBlobs(currentBatch);
  }

  if (onProgress) onProgress(total, total);
  return { successCount, skippedCount };
}

/**
 * File System Access API（showDirectoryPicker）でフォルダを直接選択してインポート
 */
export async function importFromDirectoryPicker(
  knownItemIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; skippedCount: number }> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('お使いのブラウザはフォルダ直接選択APIに対応していません。ZIPファイルまたはフォルダ選択ボタンをご利用ください。');
  }

  const dirHandle = await (window as any).showDirectoryPicker();

  const files: File[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && /\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
      const file = await entry.getFile();
      files.push(file);
    }
  }

  return importImageFiles(files, knownItemIds, onProgress);
}
