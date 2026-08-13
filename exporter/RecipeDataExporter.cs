using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

namespace RecipeDataExporter
{
    public class RecipeDataExporterMod : Mod
    {
    }

    /// <summary>
    /// 全MODロード完了後（PostAddRecipes）に全アイテム・レシピ・作業台・レシピグループをJSON出力するシステム
    /// </summary>
    public class ExporterSystem : ModSystem
    {
        public override void PostAddRecipes()
        {
            try
            {
                ExportAllModData();
            }
            catch (Exception ex)
            {
                Mod.Logger.Error("RecipeDataExporter エクスポート中にエラーが発生しました: " + ex.Message);
            }
        }

        public static void ExportAllModData()
        {
            var dataset = new ModpackExportData
            {
                version = "1.0.0",
                exportedAt = DateTime.UtcNow.ToString("o"),
                gameVersion = "Terraria v" + Main.versionNumber,
                tModLoaderVersion = "tModLoader " + BuildInfo.tMLVersion,
                mods = new List<ModInfoEntry>(),
                items = new Dictionary<string, ItemEntry>(),
                recipes = new List<RecipeEntry>(),
                recipeGroups = new Dictionary<string, RecipeGroupEntry>(),
                stations = new Dictionary<string, StationEntry>()
            };

            // 1. 導入済みMOD一覧の収集
            foreach (var mod in ModLoader.Mods)
            {
                dataset.mods.Add(new ModInfoEntry
                {
                    id = mod.Name,
                    name = mod.DisplayName,
                    version = mod.Version.ToString()
                });
            }

            // 2. レシピグループの収集
            foreach (var kvp in RecipeGroup.recipeGroups)
            {
                var group = kvp.Value;
                var validIds = new List<string>();
                foreach (int itemId in group.ValidItems)
                {
                    validIds.Add(GetFullItemId(itemId));
                }

                dataset.recipeGroups[group.Name] = new RecipeGroupEntry
                {
                    id = group.Name,
                    name = new LocalizedTextEntry { en = group.Name, ja = group.Name },
                    defaultItemId = GetFullItemId(group.IconicItemId),
                    validItemIds = validIds
                };
            }

            // 3. レシピ一覧の収集
            for (int i = 0; i < Recipe.numRecipes; i++)
            {
                var r = Main.recipe[i];
                if (r == null || r.Disabled || r.createItem == null || r.createItem.type == ItemID.None)
                    continue;

                var recipeEntry = new RecipeEntry
                {
                    id = "rec_" + i,
                    result = new ResultEntry
                    {
                        itemId = GetFullItemId(r.createItem.type),
                        stack = r.createItem.stack > 0 ? r.createItem.stack : 1
                    },
                    ingredients = new List<IngredientEntry>(),
                    requiredTiles = new List<string>(),
                    requiredConditions = new List<string>(),
                    mod = r.Mod?.Name ?? "Terraria"
                };

                // 素材の収集
                foreach (var ing in r.requiredItem)
                {
                    if (ing == null || ing.type == ItemID.None) continue;

                    // レシピグループ判定
                    string matchedGroupId = null;
                    if (r.acceptedGroups != null)
                    {
                        foreach (int gIdx in r.acceptedGroups)
                        {
                            if (RecipeGroup.recipeGroups.TryGetValue(gIdx, out var rg) && rg.ValidItems.Contains(ing.type))
                            {
                                matchedGroupId = rg.Name;
                                break;
                            }
                        }
                    }

                    recipeEntry.ingredients.Add(new IngredientEntry
                    {
                        itemId = matchedGroupId == null ? GetFullItemId(ing.type) : null,
                        recipeGroupId = matchedGroupId,
                        stack = ing.stack
                    });
                }

                // 作業台タイルの収集
                if (r.requiredTile != null)
                {
                    foreach (int tileId in r.requiredTile)
                    {
                        if (tileId >= 0)
                        {
                            recipeEntry.requiredTiles.Add(GetFullTileId(tileId));
                        }
                    }
                }

                dataset.recipes.Add(recipeEntry);
            }

            // 4. 全アイテム情報の収集
            for (int type = 1; type < ItemLoader.ItemCount; type++)
            {
                Item testItem = new Item();
                testItem.SetDefaults(type);
                if (string.IsNullOrEmpty(testItem.Name)) continue;

                string fullId = GetFullItemId(type);
                string modName = testItem.ModItem != null ? testItem.ModItem.Mod.Name : "Terraria";

                dataset.items[fullId] = new ItemEntry
                {
                    id = fullId,
                    internalName = testItem.ModItem?.Name ?? ItemID.Search.GetName(type),
                    mod = modName,
                    modDisplayName = testItem.ModItem?.Mod.DisplayName ?? "Terraria (Vanilla)",
                    name = new LocalizedTextEntry
                    {
                        en = Lang.GetItemNameValue(type),
                        ja = Lang.GetItemNameValue(type)
                    },
                    rarity = testItem.rare,
                    maxStack = testItem.maxStack,
                    isMaterial = testItem.material
                };
            }

            // 5. JSONファイル書き出し
            string savePath = Path.Combine(Main.SavePath, "modpack_data.json");
            var options = new JsonSerializerOptions { WriteIndented = true };
            string json = JsonSerializer.Serialize(dataset, options);
            File.WriteAllText(savePath, json);

            Main.NewText($"[RecipeViewer] 全MODレシピデータ出力完了: {savePath}", 50, 255, 130);
        }

        private static string GetFullItemId(int type)
        {
            if (type < ItemID.Count)
            {
                return "Terraria:" + ItemID.Search.GetName(type);
            }
            var modItem = ItemLoader.GetItem(type);
            return modItem != null ? $"{modItem.Mod.Name}:{modItem.Name}" : $"Unknown:{type}";
        }

        private static string GetFullTileId(int tileType)
        {
            if (tileType < TileID.Count)
            {
                return "Terraria:Tile_" + TileID.Search.GetName(tileType);
            }
            var modTile = TileLoader.GetTile(tileType);
            return modTile != null ? $"{modTile.Mod.Name}:{modTile.Name}" : $"Tile:{tileType}";
        }
    }

    #region JSON Serialization DTOs
    public class ModpackExportData
    {
        public string version { get; set; }
        public string exportedAt { get; set; }
        public string gameVersion { get; set; }
        public string tModLoaderVersion { get; set; }
        public List<ModInfoEntry> mods { get; set; }
        public Dictionary<string, ItemEntry> items { get; set; }
        public List<RecipeEntry> recipes { get; set; }
        public Dictionary<string, RecipeGroupEntry> recipeGroups { get; set; }
        public Dictionary<string, StationEntry> stations { get; set; }
    }

    public class ModInfoEntry { public string id { get; set; } public string name { get; set; } public string version { get; set; } }
    public class LocalizedTextEntry { public string en { get; set; } public string ja { get; set; } }
    public class ItemEntry
    {
        public string id { get; set; }
        public string internalName { get; set; }
        public string mod { get; set; }
        public string modDisplayName { get; set; }
        public LocalizedTextEntry name { get; set; }
        public int rarity { get; set; }
        public int maxStack { get; set; }
        public bool isMaterial { get; set; }
    }
    public class IngredientEntry { public string itemId { get; set; } public string recipeGroupId { get; set; } public int stack { get; set; } }
    public class ResultEntry { public string itemId { get; set; } public int stack { get; set; } }
    public class RecipeEntry
    {
        public string id { get; set; }
        public ResultEntry result { get; set; }
        public List<IngredientEntry> ingredients { get; set; }
        public List<string> requiredTiles { get; set; }
        public List<string> requiredConditions { get; set; }
        public string mod { get; set; }
    }
    public class RecipeGroupEntry { public string id { get; set; } public LocalizedTextEntry name { get; set; } public string defaultItemId { get; set; } public List<string> validItemIds { get; set; } }
    public class StationEntry { public string id { get; set; } public LocalizedTextEntry name { get; set; } public string mod { get; set; } }
    #endregion
}
