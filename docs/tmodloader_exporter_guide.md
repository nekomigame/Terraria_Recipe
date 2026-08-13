# tModLoader レシピデータ一括エクスポート ガイド

本ガイドでは、ご自身のtModLoader環境（バニラ＋導入中の全MOD＋拡張アドオンMOD）から、すべてのアイテム・レシピデータをワンクリックで書き出して本Webビューアーに読み込ませる手順を説明します。

---

## 1. エクスポートMODの導入手順

1. **tModLoaderのModソースフォルダを開く**:
   - 通常の保存場所: `Documents/My Games/Terraria/tModLoader/ModSources/`
2. **フォルダ `RecipeDataExporter` を作成**:
   - `ModSources/RecipeDataExporter/` フォルダを作成します。
3. **ファイルを配置**:
   - 本リポジトリの [`exporter/RecipeDataExporter.cs`](file:///C:/Users/nekom/Desktop/Terraria_Recipe/exporter/RecipeDataExporter.cs) を上記フォルダにコピーします。
   - 同フォルダに以下の内容で `build.txt` を作成します：
     ```txt
     displayName = Recipe Data Exporter
     author = LocalUser
     version = 1.0.0
     ```
4. **ゲーム内でビルド＆有効化**:
   - tModLoaderを起動し、「Mod Sources（Mod開発）」画面から「Recipe Data Exporter」をビルドして有効化（Enable）します。

---

## 2. データの出力と読み込み

1. **MODが適用された状態でワールドにログインするか、タイトル画面で全MODのロードが完了**すると、自動的にすべてのレシピ改変を走査・計算します。
2. 以下の場所に `modpack_data.json` が生成されます：
   - `Documents/My Games/Terraria/tModLoader/modpack_data.json`
3. **Webビューアーへ読み込み**:
   - 本ツールのヘッダーにある **「MODデータ読込（Import MOD Data）」** をクリックします。
   - `modpack_data.json` をドラッグ＆ドロップすると、ご自身のMOD環境の全アイテム・レシピ・クラフトツリーが即座に反映されます。
