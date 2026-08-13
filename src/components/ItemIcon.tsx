import React, { useState, useEffect } from 'react';
import { Item, CraftingStation } from '../types/recipe';
import { getFastCdnImageUrl } from '../utils/itemImage';
import { getStoredItemImage } from '../utils/imageStorage';
import {
  Sword,
  Shield,
  Gem,
  Pickaxe,
  Box,
  Layers,
  Sparkles,
  Flame,
  Anvil,
  Cpu,
  Hammer
} from 'lucide-react';

interface ItemIconProps {
  item?: Item;
  station?: CraftingStation;
  size?: number;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  item,
  station,
  size = 24,
  className = ''
}) => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

  // IndexedDB ローカル保存画像の非同期ロード
  useEffect(() => {
    let isMounted = true;
    if (item?.id) {
      // 埋め込み icon があれば即設定
      if (item.icon) {
        setLocalImageUrl(item.icon);
        return;
      }

      getStoredItemImage(item.id).then(stored => {
        if (isMounted && stored) {
          setLocalImageUrl(stored);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [item?.id, item?.icon]);

  // 作業台アイコン
  if (station) {
    if (station.id.includes('Anvil')) return <Anvil size={size} color="#8b9bb4" />;
    if (station.id.includes('Forge') || station.id.includes('Furnace')) return <Flame size={size} color="#ff7700" />;
    if (station.id.includes('Crucible') || station.id.includes('Manipulator')) return <Sparkles size={size} color="#bf00ff" />;
    return <Hammer size={size} color="#8b9bb4" />;
  }

  if (!item) {
    return <Box size={size} color="#555" />;
  }

  // 表示する画像URLの決定（ローカル保存画像 > 高速CDN画像）
  const activeUrl = localImageUrl || getFastCdnImageUrl(item);

  if (activeUrl && !imgError) {
    return (
      <img
        src={activeUrl}
        alt={item.name?.ja || item.name?.en || item.id}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`pixel-art-img ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          imageRendering: 'pixelated',
          display: 'block'
        }}
        loading="lazy"
      />
    );
  }

  // フォールバック: カテゴリや名前に応じたシンボルアイコン
  const id = (item.internalName || item.id).toLowerCase();
  const cat = item.category;

  if (id.includes('soul') || id.includes('essence') || id.includes('energy')) {
    return <Sparkles size={size} color="#00ffff" />;
  }
  if (id.includes('bar') || id.includes('ore') || id.includes('ingot')) {
    return <Layers size={size} color="#ffaa00" />;
  }
  if (cat === 'weapon' || id.includes('sword') || id.includes('blade') || id.includes('zenith') || id.includes('bow')) {
    return <Sword size={size} color="#9696ff" />;
  }
  if (cat === 'armor' || id.includes('shield') || id.includes('helmet') || id.includes('breastplate') || id.includes('greaves')) {
    return <Shield size={size} color="#4caf50" />;
  }
  if (cat === 'accessory' || id.includes('ring') || id.includes('band') || id.includes('charm') || id.includes('boots')) {
    return <Gem size={size} color="#ff64ff" />;
  }
  if (cat === 'tool' || id.includes('pickaxe') || id.includes('axe') || id.includes('hammer')) {
    return <Pickaxe size={size} color="#ffaa55" />;
  }
  if (item.mod === 'CalamityMod') {
    return <Flame size={size} color="#ff5722" />;
  }
  if (item.mod && item.mod.includes('Fargo')) {
    return <Cpu size={size} color="#bf00ff" />;
  }

  return <Box size={size} color="#8b9bb4" />;
};
