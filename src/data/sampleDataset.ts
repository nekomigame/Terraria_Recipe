import { ModpackDataSet } from '../types/recipe';

/**
 * Terraria & tModLoader Cross-Mod サンプルデータセット
 * (Vanilla + Calamity Mod + Fargo's Souls + Fargo's DLC + Thorium Mod)
 */
export const initialSampleDataset: ModpackDataSet = {
  version: "1.0.0",
  exportedAt: "2026-08-14T05:40:00Z",
  gameVersion: "Terraria v1.4.4.9",
  tModLoaderVersion: "tModLoader v2024.08",
  mods: [
    { id: "Terraria", name: "Terraria (Vanilla)", version: "1.4.4.9", color: "#4CAF50" },
    { id: "CalamityMod", name: "Calamity Mod", version: "2.0.4.003", color: "#FF5722" },
    { id: "FargowiltasSouls", name: "Fargo's Souls Mod", version: "1.6.0", color: "#9C27B0" },
    { id: "FargowiltasCrossmod", name: "Fargo's DLC (Cross-Mod)", version: "1.2.0", color: "#E91E63" },
    { id: "ThoriumMod", name: "Thorium Mod", version: "1.7.1.6", color: "#00BCD4" }
  ],
  stations: {
    "Terraria:WorkBenches": {
      id: "Terraria:WorkBenches",
      name: { en: "Work Bench", ja: "作業台" },
      mod: "Terraria"
    },
    "Terraria:IronAnvil": {
      id: "Terraria:IronAnvil",
      name: { en: "Iron / Lead Anvil", ja: "鉄 / 鉛の金床" },
      mod: "Terraria"
    },
    "Terraria:MythrilAnvil": {
      id: "Terraria:MythrilAnvil",
      name: { en: "Mythril / Orichalcum Anvil", ja: "ミスリル / オリハルコンの金床" },
      mod: "Terraria"
    },
    "Terraria:DemonAltar": {
      id: "Terraria:DemonAltar",
      name: { en: "Demon Altar / Crimson Altar", ja: "悪魔の祭壇 / 真紅の祭壇" },
      mod: "Terraria"
    },
    "Terraria:Furnaces": {
      id: "Terraria:Furnaces",
      name: { en: "Furnace", ja: "かまど" },
      mod: "Terraria"
    },
    "Terraria:Hellforge": {
      id: "Terraria:Hellforge",
      name: { en: "Hellforge", ja: "地獄のかまど" },
      mod: "Terraria"
    },
    "Terraria:AdamantiteForge": {
      id: "Terraria:AdamantiteForge",
      name: { en: "Adamantite / Titanium Forge", ja: "アダマンタイト / チタニウムのかまど" },
      mod: "Terraria"
    },
    "Terraria:LunarCraftingStation": {
      id: "Terraria:LunarCraftingStation",
      name: { en: "Ancient Manipulator", ja: "マニピュレーター" },
      mod: "Terraria"
    },
    "Fargowiltas:CrucibleOfTheCosmos": {
      id: "Fargowiltas:CrucibleOfTheCosmos",
      name: { en: "Crucible of the Cosmos", ja: "宇宙のるつぼ (Crucible of the Cosmos)" },
      mod: "FargowiltasSouls"
    },
    "CalamityMod:DraedonsForge": {
      id: "CalamityMod:DraedonsForge",
      name: { en: "Draedon's Forge", ja: "ドレドンの鍛冶場 (Draedon's Forge)" },
      mod: "CalamityMod"
    }
  },
  recipeGroups: {
    "IronBar": {
      id: "IronBar",
      name: { en: "Any Iron Bar", ja: "任意の鉄のインゴット" },
      defaultItemId: "Terraria:IronBar",
      validItemIds: ["Terraria:IronBar", "Terraria:LeadBar"]
    },
    "GoldBar": {
      id: "GoldBar",
      name: { en: "Any Gold Bar", ja: "任意の金のインゴット" },
      defaultItemId: "Terraria:GoldBar",
      validItemIds: ["Terraria:GoldBar", "Terraria:PlatinumBar"]
    },
    "EvilBar": {
      id: "EvilBar",
      name: { en: "Any Evil Bar", ja: "任意の邪悪なインゴット" },
      defaultItemId: "Terraria:DemoniteBar",
      validItemIds: ["Terraria:DemoniteBar", "Terraria:CrimtaneBar"]
    },
    "Wood": {
      id: "Wood",
      name: { en: "Any Wood", ja: "任意の木材" },
      defaultItemId: "Terraria:Wood",
      validItemIds: ["Terraria:Wood", "Terraria:BorealWood", "Terraria:RichMahogany", "Terraria:PalmWood", "Terraria:Ebonwood", "Terraria:Shadewood"]
    }
  },
  items: {
    // ---------------- Vanilla Swords & Zenith Tree ----------------
    "Terraria:Zenith": {
      id: "Terraria:Zenith",
      internalName: "Zenith",
      mod: "Terraria",
      name: { en: "Zenith", ja: "ゼニス (Zenith)" },
      tooltip: [
        { en: "Shoots a storm of flying swords across the screen", ja: "画面全体に無数の飛翔する剣の嵐を放つ" },
        { en: "'The final culmination of your journey'", ja: "「旅路の集大成」" }
      ],
      rarity: 10,
      rarityName: "Red",
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:TerraBlade": {
      id: "Terraria:TerraBlade",
      internalName: "TerraBlade",
      mod: "Terraria",
      name: { en: "Terra Blade", ja: "テラブレード (Terra Blade)" },
      tooltip: [{ en: "Fires piercing green energy beams", ja: "貫通する緑のエネルギー弾を放つ" }],
      rarity: 8,
      rarityName: "Yellow",
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:TrueNightsEdge": {
      id: "Terraria:TrueNightsEdge",
      internalName: "TrueNightsEdge",
      mod: "Terraria",
      name: { en: "True Night's Edge", ja: "トゥルーナイトエッジ (True Night's Edge)" },
      rarity: 8,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:TrueExcalibur": {
      id: "Terraria:TrueExcalibur",
      internalName: "TrueExcalibur",
      mod: "Terraria",
      name: { en: "True Excalibur", ja: "トゥルーエクスカリバー (True Excalibur)" },
      rarity: 8,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:NightsEdge": {
      id: "Terraria:NightsEdge",
      internalName: "NightsEdge",
      mod: "Terraria",
      name: { en: "Night's Edge", ja: "ナイトエッジ (Night's Edge)" },
      rarity: 3,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:LightsBane": {
      id: "Terraria:LightsBane",
      internalName: "LightsBane",
      mod: "Terraria",
      name: { en: "Light's Bane", ja: "ライトベイン (Light's Bane)" },
      rarity: 1,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:Muramasa": {
      id: "Terraria:Muramasa",
      internalName: "Muramasa",
      mod: "Terraria",
      name: { en: "Muramasa", ja: "ムラマサ (Muramasa)" },
      tooltip: [{ en: "Found in Dungeon Golden Chests", ja: "ダンジョンの金の宝箱から入手" }],
      rarity: 2,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dungeon Gold Chest", ja: "ダンジョンの鍵付き金の宝箱" }
    },
    "Terraria:BladeofGrass": {
      id: "Terraria:BladeofGrass",
      internalName: "BladeofGrass",
      mod: "Terraria",
      name: { en: "Blade of Grass", ja: "グラスブレード (Blade of Grass)" },
      rarity: 3,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:FieryGreatsword": {
      id: "Terraria:FieryGreatsword",
      internalName: "FieryGreatsword",
      mod: "Terraria",
      name: { en: "Volcano", ja: "ボルケーノ (Volcano / 旧Fiery Greatsword)" },
      rarity: 3,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:Excalibur": {
      id: "Terraria:Excalibur",
      internalName: "Excalibur",
      mod: "Terraria",
      name: { en: "Excalibur", ja: "エクスカリバー (Excalibur)" },
      rarity: 5,
      isMaterial: true,
      category: "weapon"
    },
    "Terraria:BrokenHeroSword": {
      id: "Terraria:BrokenHeroSword",
      internalName: "BrokenHeroSword",
      mod: "Terraria",
      name: { en: "Broken Hero Sword", ja: "折れた勇者の剣 (Broken Hero Sword)" },
      rarity: 8,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Mothron during Solar Eclipse", ja: "日食中のモスロンからドロップ" }
    },
    "Terraria:Meowmere": {
      id: "Terraria:Meowmere",
      internalName: "Meowmere",
      mod: "Terraria",
      name: { en: "Meowmere", ja: "ニャウメア (Meowmere)" },
      rarity: 10,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Moon Lord", ja: "ムーンロードからドロップ" }
    },
    "Terraria:StarWrath": {
      id: "Terraria:StarWrath",
      internalName: "StarWrath",
      mod: "Terraria",
      name: { en: "Star Wrath", ja: "スターラス (Star Wrath)" },
      rarity: 10,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Moon Lord", ja: "ムーンロードからドロップ" }
    },
    "Terraria:InfluxWaver": {
      id: "Terraria:InfluxWaver",
      internalName: "InfluxWaver",
      mod: "Terraria",
      name: { en: "Influx Waver", ja: "インフラックスウェイバー" },
      rarity: 8,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Martian Saucer", ja: "マートシャンサウサーからドロップ" }
    },
    "Terraria:TheHorsemanBlade": {
      id: "Terraria:TheHorsemanBlade",
      internalName: "TheHorsemansBlade",
      mod: "Terraria",
      name: { en: "The Horseman's Blade", ja: "ホースマンズブレード" },
      rarity: 8,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Pumpking", ja: "パンプキングからドロップ" }
    },
    "Terraria:Seedler": {
      id: "Terraria:Seedler",
      internalName: "Seedler",
      mod: "Terraria",
      name: { en: "Seedler", ja: "シードラー (Seedler)" },
      rarity: 7,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Plantera", ja: "プランテラからドロップ" }
    },
    "Terraria:Starfury": {
      id: "Terraria:Starfury",
      internalName: "Starfury",
      mod: "Terraria",
      name: { en: "Starfury", ja: "スターフューリー" },
      rarity: 1,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Found in Floating Island Skyware Chests", ja: "浮島の空の宝箱から入手" }
    },
    "Terraria:BeeKeeper": {
      id: "Terraria:BeeKeeper",
      internalName: "BeeKeeper",
      mod: "Terraria",
      name: { en: "Bee Keeper", ja: "ビーキーパー" },
      rarity: 3,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Dropped by Queen Bee", ja: "クイーンビーからドロップ" }
    },
    "Terraria:EnchantedSword": {
      id: "Terraria:EnchantedSword",
      internalName: "EnchantedSword",
      mod: "Terraria",
      name: { en: "Enchanted Sword", ja: "魔法の剣 (Enchanted Sword)" },
      rarity: 2,
      isMaterial: true,
      category: "weapon",
      obtainInfo: { en: "Found in Sword Shrine shrines", ja: "剣の祠（地下の祠）から採掘" }
    },
    "Terraria:CopperShortsword": {
      id: "Terraria:CopperShortsword",
      internalName: "CopperShortsword",
      mod: "Terraria",
      name: { en: "Copper Shortsword", ja: "銅のショートソード" },
      rarity: 0,
      isMaterial: true,
      category: "weapon"
    },

    // ---------------- Vanilla Basic Materials ----------------
    "Terraria:IronBar": {
      id: "Terraria:IronBar",
      internalName: "IronBar",
      mod: "Terraria",
      name: { en: "Iron Bar", ja: "鉄のインゴット" },
      rarity: 0,
      isMaterial: true,
      category: "material"
    },
    "Terraria:IronOre": {
      id: "Terraria:IronOre",
      internalName: "IronOre",
      mod: "Terraria",
      name: { en: "Iron Ore", ja: "鉄鉱石" },
      rarity: 0,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Mined underground", ja: "地下で採掘" }
    },
    "Terraria:LeadBar": {
      id: "Terraria:LeadBar",
      internalName: "LeadBar",
      mod: "Terraria",
      name: { en: "Lead Bar", ja: "鉛のインゴット" },
      rarity: 0,
      isMaterial: true,
      category: "material"
    },
    "Terraria:LeadOre": {
      id: "Terraria:LeadOre",
      internalName: "LeadOre",
      mod: "Terraria",
      name: { en: "Lead Ore", ja: "鉛鉱石" },
      rarity: 0,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Mined underground", ja: "地下で採掘" }
    },
    "Terraria:CopperBar": {
      id: "Terraria:CopperBar",
      internalName: "CopperBar",
      mod: "Terraria",
      name: { en: "Copper Bar", ja: "銅のインゴット" },
      rarity: 0,
      isMaterial: true,
      category: "material"
    },
    "Terraria:CopperOre": {
      id: "Terraria:CopperOre",
      internalName: "CopperOre",
      mod: "Terraria",
      name: { en: "Copper Ore", ja: "銅鉱石" },
      rarity: 0,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Mined underground", ja: "地下で採掘" }
    },
    "Terraria:Wood": {
      id: "Terraria:Wood",
      internalName: "Wood",
      mod: "Terraria",
      name: { en: "Wood", ja: "木材" },
      rarity: 0,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Chopped from trees", ja: "木を伐採" }
    },
    "Terraria:DemoniteBar": {
      id: "Terraria:DemoniteBar",
      internalName: "DemoniteBar",
      mod: "Terraria",
      name: { en: "Demonite Bar", ja: "デモナイトインゴット" },
      rarity: 1,
      isMaterial: true,
      category: "material"
    },
    "Terraria:DemoniteOre": {
      id: "Terraria:DemoniteOre",
      internalName: "DemoniteOre",
      mod: "Terraria",
      name: { en: "Demonite Ore", ja: "デモナイト鉱石" },
      rarity: 1,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Eye of Cthulhu / Eater of Worlds", ja: "クトゥルフの目・イーターオブワールドからドロップ" }
    },
    "Terraria:JungleSpores": {
      id: "Terraria:JungleSpores",
      internalName: "JungleSpores",
      mod: "Terraria",
      name: { en: "Jungle Spores", ja: "ジャングルの胞子" },
      rarity: 1,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Harvested in Underground Jungle", ja: "地下ジャングルで採取" }
    },
    "Terraria:Stinger": {
      id: "Terraria:Stinger",
      internalName: "Stinger",
      mod: "Terraria",
      name: { en: "Stinger", ja: "毒針 (Stinger)" },
      rarity: 1,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Hornets / Spiked Slimes", ja: "ホーネット・スパイクスライムからドロップ" }
    },
    "Terraria:HellstoneBar": {
      id: "Terraria:HellstoneBar",
      internalName: "HellstoneBar",
      mod: "Terraria",
      name: { en: "Hellstone Bar", ja: "ヘルストーンインゴット" },
      rarity: 2,
      isMaterial: true,
      category: "material"
    },
    "Terraria:Hellstone": {
      id: "Terraria:Hellstone",
      internalName: "Hellstone",
      mod: "Terraria",
      name: { en: "Hellstone", ja: "ヘルストーン鉱石" },
      rarity: 2,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Mined in The Underworld", ja: "地獄（アンダーワールド）で採掘" }
    },
    "Terraria:Obsidian": {
      id: "Terraria:Obsidian",
      internalName: "Obsidian",
      mod: "Terraria",
      name: { en: "Obsidian", ja: "黒曜石 (Obsidian)" },
      rarity: 0,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Formed when Water touches Lava", ja: "水と溶岩が接触して生成" }
    },
    "Terraria:HallowedBar": {
      id: "Terraria:HallowedBar",
      internalName: "HallowedBar",
      mod: "Terraria",
      name: { en: "Hallowed Bar", ja: "聖なるインゴット (Hallowed Bar)" },
      rarity: 4,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Mechanical Bosses", ja: "メカニカルボス（ツインズ、デストロイヤー、プライム）からドロップ" }
    },
    "Terraria:SoulofFright": {
      id: "Terraria:SoulofFright",
      internalName: "SoulofFright",
      mod: "Terraria",
      name: { en: "Soul of Fright", ja: "恐怖のソウル (Soul of Fright)" },
      rarity: 5,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Skeletron Prime", ja: "スケルトロン・プライムからドロップ" }
    },
    "Terraria:SoulofMight": {
      id: "Terraria:SoulofMight",
      internalName: "SoulofMight",
      mod: "Terraria",
      name: { en: "Soul of Might", ja: "力のソウル (Soul of Might)" },
      rarity: 5,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by The Destroyer", ja: "デストロイヤーからドロップ" }
    },
    "Terraria:SoulofSight": {
      id: "Terraria:SoulofSight",
      internalName: "SoulofSight",
      mod: "Terraria",
      name: { en: "Soul of Sight", ja: "視覚のソウル (Soul of Sight)" },
      rarity: 5,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by The Twins", ja: "ツインズからドロップ" }
    },

    // ---------------- Fargo's Souls & Cross-Mod Soul of Eternity ----------------
    "FargowiltasSouls:EternitySoul": {
      id: "FargowiltasSouls:EternitySoul",
      internalName: "EternitySoul",
      mod: "FargowiltasSouls",
      modDisplayName: "Fargo's Souls Mod",
      name: { en: "Soul of Eternity", ja: "永遠のソウル (Soul of Eternity)" },
      tooltip: [
        { en: "Grants virtually all effects of accessories in the game", ja: "ゲーム内のほぼすべてのアクセサリー効果を常時付与する" },
        { en: "'Mementos of eternity past, present and future'", ja: "「過去・現在・未来の永遠の記憶」" }
      ],
      rarity: 15,
      rarityName: "Rainbow Cosmic",
      isMaterial: false,
      category: "accessory"
    },
    "FargowiltasSouls:UniverseSoul": {
      id: "FargowiltasSouls:UniverseSoul",
      internalName: "UniverseSoul",
      mod: "FargowiltasSouls",
      modDisplayName: "Fargo's Souls Mod",
      name: { en: "Soul of the Universe", ja: "宇宙のソウル (Soul of the Universe)" },
      rarity: 13,
      isMaterial: true,
      category: "accessory"
    },
    "FargowiltasSouls:DimensionSoul": {
      id: "FargowiltasSouls:DimensionSoul",
      internalName: "DimensionSoul",
      mod: "FargowiltasSouls",
      modDisplayName: "Fargo's Souls Mod",
      name: { en: "Soul of Dimensions", ja: "次元のソウル (Soul of Dimensions)" },
      rarity: 13,
      isMaterial: true,
      category: "accessory"
    },
    "FargowiltasSouls:TerrariaSoul": {
      id: "FargowiltasSouls:TerrariaSoul",
      internalName: "TerrariaSoul",
      mod: "FargowiltasSouls",
      modDisplayName: "Fargo's Souls Mod",
      name: { en: "Soul of Terraria", ja: "テラリアのソウル (Soul of Terraria)" },
      rarity: 13,
      isMaterial: true,
      category: "accessory"
    },
    "FargowiltasSouls:AbomEnergy": {
      id: "FargowiltasSouls:AbomEnergy",
      internalName: "AbomEnergy",
      mod: "FargowiltasSouls",
      name: { en: "Abominationn Energy", ja: "アボミネーション・エネルギー" },
      rarity: 14,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Abominationn boss", ja: "ボス「Abominationn」からドロップ" }
    },
    "FargowiltasSouls:EternalEnergy": {
      id: "FargowiltasSouls:EternalEnergy",
      internalName: "EternalEnergy",
      mod: "FargowiltasSouls",
      name: { en: "Eternal Energy", ja: "エターナルエネルギー" },
      rarity: 15,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Mutant boss in Eternity Mode", ja: "Eternity Modeのボス「Mutant」からドロップ" }
    },

    // ---------------- Calamity Mod Items & Cross-Mod Components ----------------
    "CalamityMod:ShadowspecBar": {
      id: "CalamityMod:ShadowspecBar",
      internalName: "ShadowspecBar",
      mod: "CalamityMod",
      modDisplayName: "Calamity Mod",
      name: { en: "Shadowspec Bar", ja: "シャドウスペックインゴット (Shadowspec Bar)" },
      tooltip: [{ en: "The ultimate catalyst of transcendent creation", ja: "超越的創造の究極触媒" }],
      rarity: 15,
      rarityName: "Calamity Violet",
      isMaterial: true,
      category: "material"
    },
    "CalamityMod:AuricTeslaBar": {
      id: "CalamityMod:AuricTeslaBar",
      internalName: "AuricTeslaBar",
      mod: "CalamityMod",
      modDisplayName: "Calamity Mod",
      name: { en: "Auric Tesla Bar", ja: "オーリックテスラインゴット (Auric Tesla Bar)" },
      rarity: 14,
      isMaterial: true,
      category: "material"
    },
    "CalamityMod:AuricOre": {
      id: "CalamityMod:AuricOre",
      internalName: "AuricOre",
      mod: "CalamityMod",
      name: { en: "Auric Ore", ja: "オーリック鉱石" },
      rarity: 14,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Spawns after defeating Yharon", ja: "ヤロン撃破後にワールド地下に生成" }
    },
    "CalamityMod:YharonSoulFragment": {
      id: "CalamityMod:YharonSoulFragment",
      internalName: "YharonSoulFragment",
      mod: "CalamityMod",
      name: { en: "Yharon Soul Fragment", ja: "ヤロンのソウルフラグメント" },
      rarity: 14,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Jungle Dragon, Yharon", ja: "ジャングルドラゴン「Yharon」からドロップ" }
    },
    "CalamityMod:CalamitousEssence": {
      id: "CalamityMod:CalamitousEssence",
      internalName: "CalamitousEssence",
      mod: "CalamityMod",
      name: { en: "Ashe of Annihilation", ja: "全滅の灰 (Ashe of Annihilation)" },
      rarity: 15,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Dropped by Supreme Witch, Calamitas", ja: "至高の魔女「Supreme Calamitas」からドロップ" }
    },

    // ---------------- Thorium Mod Items ----------------
    "ThoriumMod:TerrariumCore": {
      id: "ThoriumMod:TerrariumCore",
      internalName: "TerrariumCore",
      mod: "ThoriumMod",
      modDisplayName: "Thorium Mod",
      name: { en: "Terrarium Core", ja: "テラリウムコア (Terrarium Core)" },
      rarity: 11,
      isMaterial: true,
      category: "material"
    },
    "ThoriumMod:TerrariumOre": {
      id: "ThoriumMod:TerrariumOre",
      internalName: "TerrariumOre",
      mod: "ThoriumMod",
      name: { en: "Terrarium Ore", ja: "テラリウム鉱石" },
      rarity: 11,
      isMaterial: true,
      category: "material",
      obtainInfo: { en: "Mined in depths after Primordials defeat", ja: "プリモーディアル撃破後に採掘" }
    }
  },

  recipes: [
    // ---------------- Vanilla Recipes ----------------
    {
      id: "rec_iron_bar",
      result: { itemId: "Terraria:IronBar", stack: 1 },
      ingredients: [{ itemId: "Terraria:IronOre", stack: 3 }],
      requiredTiles: ["Terraria:Furnaces"],
      mod: "Terraria"
    },
    {
      id: "rec_lead_bar",
      result: { itemId: "Terraria:LeadBar", stack: 1 },
      ingredients: [{ itemId: "Terraria:LeadOre", stack: 3 }],
      requiredTiles: ["Terraria:Furnaces"],
      mod: "Terraria"
    },
    {
      id: "rec_copper_bar",
      result: { itemId: "Terraria:CopperBar", stack: 1 },
      ingredients: [{ itemId: "Terraria:CopperOre", stack: 3 }],
      requiredTiles: ["Terraria:Furnaces"],
      mod: "Terraria"
    },
    {
      id: "rec_copper_shortsword",
      result: { itemId: "Terraria:CopperShortsword", stack: 1 },
      ingredients: [
        { itemId: "Terraria:CopperBar", stack: 7 },
        { recipeGroupId: "Wood", stack: 1 }
      ],
      requiredTiles: ["Terraria:IronAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_demonite_bar",
      result: { itemId: "Terraria:DemoniteBar", stack: 1 },
      ingredients: [{ itemId: "Terraria:DemoniteOre", stack: 3 }],
      requiredTiles: ["Terraria:Furnaces"],
      mod: "Terraria"
    },
    {
      id: "rec_lights_bane",
      result: { itemId: "Terraria:LightsBane", stack: 1 },
      ingredients: [{ itemId: "Terraria:DemoniteBar", stack: 10 }],
      requiredTiles: ["Terraria:IronAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_blade_of_grass",
      result: { itemId: "Terraria:BladeofGrass", stack: 1 },
      ingredients: [
        { itemId: "Terraria:JungleSpores", stack: 12 },
        { itemId: "Terraria:Stinger", stack: 15 }
      ],
      requiredTiles: ["Terraria:IronAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_hellstone_bar",
      result: { itemId: "Terraria:HellstoneBar", stack: 1 },
      ingredients: [
        { itemId: "Terraria:Hellstone", stack: 3 },
        { itemId: "Terraria:Obsidian", stack: 1 }
      ],
      requiredTiles: ["Terraria:Hellforge"],
      mod: "Terraria"
    },
    {
      id: "rec_volcano",
      result: { itemId: "Terraria:FieryGreatsword", stack: 1 },
      ingredients: [{ itemId: "Terraria:HellstoneBar", stack: 20 }],
      requiredTiles: ["Terraria:IronAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_nights_edge",
      result: { itemId: "Terraria:NightsEdge", stack: 1 },
      ingredients: [
        { itemId: "Terraria:LightsBane", stack: 1 },
        { itemId: "Terraria:Muramasa", stack: 1 },
        { itemId: "Terraria:BladeofGrass", stack: 1 },
        { itemId: "Terraria:FieryGreatsword", stack: 1 }
      ],
      requiredTiles: ["Terraria:DemonAltar"],
      mod: "Terraria"
    },
    {
      id: "rec_excalibur",
      result: { itemId: "Terraria:Excalibur", stack: 1 },
      ingredients: [{ itemId: "Terraria:HallowedBar", stack: 12 }],
      requiredTiles: ["Terraria:MythrilAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_true_nights_edge",
      result: { itemId: "Terraria:TrueNightsEdge", stack: 1 },
      ingredients: [
        { itemId: "Terraria:NightsEdge", stack: 1 },
        { itemId: "Terraria:SoulofFright", stack: 20 },
        { itemId: "Terraria:SoulofMight", stack: 20 },
        { itemId: "Terraria:SoulofSight", stack: 20 }
      ],
      requiredTiles: ["Terraria:MythrilAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_true_excalibur",
      result: { itemId: "Terraria:TrueExcalibur", stack: 1 },
      ingredients: [
        { itemId: "Terraria:Excalibur", stack: 1 },
        { itemId: "Terraria:ChlorophyteBar", stack: 24 }
      ],
      requiredTiles: ["Terraria:MythrilAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_terra_blade",
      result: { itemId: "Terraria:TerraBlade", stack: 1 },
      ingredients: [
        { itemId: "Terraria:TrueNightsEdge", stack: 1 },
        { itemId: "Terraria:TrueExcalibur", stack: 1 },
        { itemId: "Terraria:BrokenHeroSword", stack: 1 }
      ],
      requiredTiles: ["Terraria:MythrilAnvil"],
      mod: "Terraria"
    },
    {
      id: "rec_zenith",
      result: { itemId: "Terraria:Zenith", stack: 1 },
      ingredients: [
        { itemId: "Terraria:TerraBlade", stack: 1 },
        { itemId: "Terraria:Meowmere", stack: 1 },
        { itemId: "Terraria:StarWrath", stack: 1 },
        { itemId: "Terraria:InfluxWaver", stack: 1 },
        { itemId: "Terraria:TheHorsemanBlade", stack: 1 },
        { itemId: "Terraria:Seedler", stack: 1 },
        { itemId: "Terraria:Starfury", stack: 1 },
        { itemId: "Terraria:BeeKeeper", stack: 1 },
        { itemId: "Terraria:EnchantedSword", stack: 1 },
        { itemId: "Terraria:CopperShortsword", stack: 1 }
      ],
      requiredTiles: ["Terraria:MythrilAnvil"],
      mod: "Terraria"
    },

    // ---------------- Calamity Mod Recipes ----------------
    {
      id: "rec_auric_tesla_bar",
      result: { itemId: "CalamityMod:AuricTeslaBar", stack: 1 },
      ingredients: [
        { itemId: "CalamityMod:AuricOre", stack: 12 },
        { itemId: "CalamityMod:YharonSoulFragment", stack: 1 }
      ],
      requiredTiles: ["CalamityMod:DraedonsForge"],
      mod: "CalamityMod"
    },
    {
      id: "rec_shadowspec_bar",
      result: { itemId: "CalamityMod:ShadowspecBar", stack: 1 },
      ingredients: [
        { itemId: "CalamityMod:AuricTeslaBar", stack: 1 },
        { itemId: "CalamityMod:CalamitousEssence", stack: 1 }
      ],
      requiredTiles: ["CalamityMod:DraedonsForge"],
      mod: "CalamityMod"
    },

    // ---------------- Thorium Mod Recipes ----------------
    {
      id: "rec_terrarium_core",
      result: { itemId: "ThoriumMod:TerrariumCore", stack: 1 },
      ingredients: [
        { itemId: "ThoriumMod:TerrariumOre", stack: 8 },
        { recipeGroupId: "IronBar", stack: 2 }
      ],
      requiredTiles: ["Terraria:LunarCraftingStation"],
      mod: "ThoriumMod"
    },

    // ---------------- Fargo's Souls & Cross-Mod Recipes ----------------
    {
      id: "rec_soul_universe",
      result: { itemId: "FargowiltasSouls:UniverseSoul", stack: 1 },
      ingredients: [
        { itemId: "Terraria:Zenith", stack: 1 },
        { itemId: "FargowiltasSouls:AbomEnergy", stack: 10 }
      ],
      requiredTiles: ["Fargowiltas:CrucibleOfTheCosmos"],
      mod: "FargowiltasSouls"
    },
    {
      id: "rec_soul_dimensions",
      result: { itemId: "FargowiltasSouls:DimensionSoul", stack: 1 },
      ingredients: [
        { itemId: "Terraria:TerraBlade", stack: 1 },
        { itemId: "FargowiltasSouls:AbomEnergy", stack: 10 }
      ],
      requiredTiles: ["Fargowiltas:CrucibleOfTheCosmos"],
      mod: "FargowiltasSouls"
    },
    // ★ 究極のCross-Mod超多段クラフトレシピ: Soul of Eternity
    {
      id: "rec_soul_of_eternity_crossmod",
      result: { itemId: "FargowiltasSouls:EternitySoul", stack: 1 },
      ingredients: [
        { itemId: "FargowiltasSouls:UniverseSoul", stack: 1, note: "Fargo's Souls" },
        { itemId: "FargowiltasSouls:DimensionSoul", stack: 1, note: "Fargo's Souls" },
        { itemId: "CalamityMod:ShadowspecBar", stack: 10, note: "★ Cross-Mod素材 (Calamity Mod)" },
        { itemId: "ThoriumMod:TerrariumCore", stack: 5, note: "★ Cross-Mod素材 (Thorium Mod)" },
        { itemId: "FargowiltasSouls:EternalEnergy", stack: 30, note: "Fargo's Souls" }
      ],
      requiredTiles: ["Fargowiltas:CrucibleOfTheCosmos"],
      requiredConditions: ["InEternityMode", "DownedMutant"],
      mod: "FargowiltasCrossmod"
    }
  ]
};
