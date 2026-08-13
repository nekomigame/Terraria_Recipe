import React from 'react';
import { Item, CraftingStation } from '../types/recipe';
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
  // アイテム画像URLが存在する場合
  if (item?.icon) {
    return (
      <img
        src={item.icon}
        alt={item.name.ja}
        width={size}
        height={size}
        className={`pixel-art-img ${className}`}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

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

  // カテゴリや名前に応じたシンボルアイコン
  const id = item.id.toLowerCase();
  const cat = item.category;

  if (id.includes('soul') || id.includes('essence') || id.includes('energy')) {
    return <Sparkles size={size} color="#00ffff" />;
  }
  if (id.includes('bar') || id.includes('ore')) {
    return <Layers size={size} color="#ffaa00" />;
  }
  if (cat === 'weapon' || id.includes('sword') || id.includes('blade') || id.includes('zenith')) {
    return <Sword size={size} color="#9696ff" />;
  }
  if (cat === 'armor' || id.includes('shield')) {
    return <Shield size={size} color="#4caf50" />;
  }
  if (cat === 'accessory') {
    return <Gem size={size} color="#ff64ff" />;
  }
  if (cat === 'tool' || id.includes('pickaxe')) {
    return <Pickaxe size={size} color="#ffaa55" />;
  }
  if (item.mod === 'CalamityMod') {
    return <Flame size={size} color="#ff5722" />;
  }
  if (item.mod.includes('Fargo')) {
    return <Cpu size={size} color="#bf00ff" />;
  }

  return <Box size={size} color="#8b9bb4" />;
};
