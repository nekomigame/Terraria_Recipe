using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;
using Terraria.GameContent;
using Terraria.Localization;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace RecipeDataExporter
{
    public class RecipeDataExporterMod : Mod
    {
    }

    /// <summary>
    /// 全MODロード完了後（PostAddRecipes）に全アイテム・レシピ・作業台・レシピグループをJSON出力するシステム
    /// （※起動速度最優先のため、メタデータのみを0.1秒で高速出力）
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
                Mod.Logger.Error("RecipeDataExporter エクスポート中にエラーが発生しました: " + ex.ToString());
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
            var idToGroupName = new Dictionary<int, string>();
            if (RecipeGroup.recipeGroupIDs != null)
            {
                foreach (var kv in RecipeGroup.recipeGroupIDs)
                {
                    idToGroupName[kv.Value] = kv.Key;
                }
            }

            foreach (var kvp in RecipeGroup.recipeGroups)
            {
                int groupId = kvp.Key;
                var group = kvp.Value;
                string groupName = idToGroupName.TryGetValue(groupId, out var name) ? name : $"Group_{groupId}";
                string displayName = group.GetText != null ? group.GetText() : groupName;

                var validIds = new List<string>();
                if (group.ValidItems != null)
                {
                    foreach (int itemId in group.ValidItems)
                    {
                        validIds.Add(GetFullItemId(itemId));
                    }
                }

                dataset.recipeGroups[groupName] = new RecipeGroupEntry
                {
                    id = groupName,
                    name = new LocalizedTextEntry { en = displayName, ja = displayName },
                    defaultItemId = GetFullItemId(group.IconicItemId),
                    validItemIds = validIds
                };
            }

            // 作業台タイルの追跡用
            var recordedTiles = new HashSet<int>();

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
                if (r.requiredItem != null)
                {
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
                                    matchedGroupId = idToGroupName.TryGetValue(gIdx, out var gName) ? gName : $"Group_{gIdx}";
                                    break;
                                }
                            }
                        }

                        recipeEntry.ingredients.Add(new IngredientEntry
                        {
                            itemId = matchedGroupId == null ? GetFullItemId(ing.type) : null,
                            recipeGroupId = matchedGroupId,
                            stack = ing.stack > 0 ? ing.stack : 1
                        });
                    }
                }

                // 作業台タイルの収集
                if (r.requiredTile != null)
                {
                    foreach (int tileId in r.requiredTile)
                    {
                        if (tileId >= 0)
                        {
                            string tileFullId = GetFullTileId(tileId);
                            recipeEntry.requiredTiles.Add(tileFullId);
                            recordedTiles.Add(tileId);
                        }
                    }
                }

                // 作成条件の収集 (tModLoader 1.4 Conditions)
                if (r.Conditions != null)
                {
                    foreach (var cond in r.Conditions)
                    {
                        if (cond != null && cond.Description != null)
                        {
                            recipeEntry.requiredConditions.Add(cond.Description.Value);
                        }
                    }
                }

                dataset.recipes.Add(recipeEntry);
            }

            // 作業台情報の収集
            foreach (int tileId in recordedTiles)
            {
                string tileFullId = GetFullTileId(tileId);
                string tileName = GetTileDisplayName(tileId);
                string modName = tileId < TileID.Count ? "Terraria" : (TileLoader.GetTile(tileId)?.Mod.Name ?? "Terraria");

                dataset.stations[tileFullId] = new StationEntry
                {
                    id = tileFullId,
                    name = new LocalizedTextEntry { en = tileName, ja = tileName },
                    mod = modName
                };
            }

            // 4. 全アイテム情報の収集（高速メタデータ抽出）
            for (int type = 1; type < ItemLoader.ItemCount; type++)
            {
                Item testItem = new Item();
                testItem.SetDefaults(type);
                if (string.IsNullOrEmpty(testItem.Name)) continue;

                string fullId = GetFullItemId(type);
                string modName = testItem.ModItem != null ? testItem.ModItem.Mod.Name : "Terraria";
                string itemName = testItem.Name;

                dataset.items[fullId] = new ItemEntry
                {
                    id = fullId,
                    internalName = testItem.ModItem?.Name ?? ItemID.Search.GetName(type),
                    mod = modName,
                    modDisplayName = testItem.ModItem?.Mod.DisplayName ?? "Terraria (Vanilla)",
                    name = new LocalizedTextEntry
                    {
                        en = itemName,
                        ja = itemName
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

            // ロガーへ出力
            ModContent.GetInstance<RecipeDataExporterMod>()?.Logger.Info($"[RecipeViewer] 全MODレシピデータ出力完了: {savePath} (Items: {dataset.items.Count}, Recipes: {dataset.recipes.Count})");
        }

        public static string GetFullItemId(int type)
        {
            if (type < ItemID.Count)
            {
                return "Terraria:" + ItemID.Search.GetName(type);
            }
            var modItem = ItemLoader.GetItem(type);
            return modItem != null ? $"{modItem.Mod.Name}:{modItem.Name}" : $"Unknown:{type}";
        }

        public static string GetFullTileId(int tileType)
        {
            if (tileType < TileID.Count)
            {
                return "Terraria:Tile_" + TileID.Search.GetName(tileType);
            }
            var modTile = TileLoader.GetTile(tileType);
            return modTile != null ? $"{modTile.Mod.Name}:{modTile.Name}" : $"Tile:{tileType}";
        }

        public static string GetTileDisplayName(int tileType)
        {
            if (tileType < TileID.Count)
            {
                string searchName = TileID.Search.GetName(tileType);
                if (string.IsNullOrEmpty(searchName)) return $"Tile #{tileType}";
                return searchName.Replace("Tile_", "").Replace("Benches", " Bench");
            }
            var modTile = TileLoader.GetTile(tileType);
            return modTile != null ? modTile.Name : $"Tile #{tileType}";
        }
    }

    /// <summary>
    /// ゲーム内チャットコマンド: /exporticons
    /// バックグラウンドで非同期に全MODアイテムのテクスチャ画像をPNG出力する
    /// </summary>
    public class ExportIconsCommand : ModCommand
    {
        public override CommandType Type => CommandType.Chat;
        public override string Command => "exporticons";
        public override string Description => "全アイテムのテクスチャ画像を非同期でRecipeViewer_Iconsフォルダに出力します";

        public override void Action(CommandCaller caller, string input, string[] args)
        {
            caller.Reply("[RecipeViewer] アイコン画像のバックグラウンド出力を開始しました...", Color.Yellow);

            Task.Run(() =>
            {
                try
                {
                    string folderPath = Path.Combine(Main.SavePath, "RecipeViewer_Icons");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    int totalCount = ItemLoader.ItemCount;
                    int savedCount = 0;

                    for (int type = 1; type < totalCount; type++)
                    {
                        try
                        {
                            Main.instance.LoadItem(type);
                            var texture = TextureAssets.Item[type]?.Value;
                            if (texture != null && texture.Width > 0 && texture.Height > 0)
                            {
                                string fileName;
                                if (type < ItemID.Count)
                                {
                                    fileName = "Terraria_" + ItemID.Search.GetName(type) + ".png";
                                }
                                else
                                {
                                    var modItem = ItemLoader.GetItem(type);
                                    fileName = (modItem != null ? $"{modItem.Mod.Name}_{modItem.Name}" : $"Unknown_{type}") + ".png";
                                }

                                string filePath = Path.Combine(folderPath, fileName);
                                if (!File.Exists(filePath))
                                {
                                    using (var fs = File.Create(filePath))
                                    {
                                        texture.SaveAsPng(fs, texture.Width, texture.Height);
                                    }
                                }
                                savedCount++;
                            }
                        }
                        catch
                        {
                            // ignore
                        }
                    }

                    Main.NewText($"[RecipeViewer] アイコン出力完了！ 保存先: {folderPath} (合計 {savedCount} 枚)", 50, 255, 130);
                    Main.NewText("[RecipeViewer] 出力された画像をWebビューアーのインポート画面にドラッグ＆ドロップしてください。", 100, 200, 255);
                }
                catch (Exception ex)
                {
                    Main.NewText($"[RecipeViewer] アイコン出力中にエラー: {ex.Message}", 255, 50, 50);
                }
            });
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
        public string icon { get; set; }
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
