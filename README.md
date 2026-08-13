# Terraria & tModLoader 全MOD対応レシピビューアー (Terraria Recipe Viewer)

『Terraria』および『tModLoader』環境における、バニラおよび導入されている**すべてのMOD・拡張アドオンMOD（Calamity, Thorium, Fargo's Souls, DLCなど）**のレシピ・多段クラフトツリー・末端総素材数を瞬時に逆引き・可視化できるWebアプリケーション＆データエクスポートツールです。

---

## 🌟 主な特徴

- 🌲 **多段クラフトツリーの可視化**: 幾重にも連なる巨大なクラフトツリーをインタラクティブなノードツリーとして展開・探索。
- 📊 **末端総素材数の一括計算（Raw Material Aggregator）**: 最終アイテムを作成するために必要な「基礎素材（鉱石・ドロップ品・購入品等）」の合計要求数を自動集計。
- 🔄 **正引き＆逆引き（How to Craft / Used in）**: アイテムの作り方だけでなく、「このアイテムは何の素材として使えるか」をMOD横断で逆引き検索。
- 🧩 **全MOD・拡張MOD・Cross-Modレシピ完全対応**: ゲーム内で全MODが読み込まれた最終状態（`PostAddRecipes`）からデータを抽出するため、MOD間の連携レシピや動的なレシピ改変にも100%追従。
- 📁 **ドラッグ＆ドロップで即時反映**: tModLoaderから出力した `modpack_data.json` をブラウザにドロップするだけで、自身のMOD環境のデータに切り替え可能。
- 🌐 **多言語対応**: 日本語・英語のアイテム名表示切り替えに対応。

---

## 🚀 使い方・導入手順

### 1. tModLoader からレシピデータをエクスポートする

1. **MODソースフォルダの準備**:
   - `tModLoader` のMODソースフォルダを開きます。
     - Windowsの場合の通常パス:  
       `Documents\My Games\Terraria\tModLoader\ModSources\RecipeDataExporter`
2. **ファイルの配置**:
   - 本リポジトリの [`exporter/RecipeDataExporter.cs`](./exporter/RecipeDataExporter.cs) を上記フォルダに配置します。
3. **ゲーム内でビルド＆有効化**:
   - tModLoaderを起動し、**「Modの管理 (Manage Mods)」 > 「Mod Sources」** から `RecipeDataExporter` をビルド・有効化します。
4. **データの自動出力**:
   - ワールドロード時またはMOD読み込み完了時、自動的に以下の場所に `modpack_data.json` が生成されます：
     - 保存先: `Documents\My Games\Terraria\tModLoader\modpack_data.json`

---

### 2. Webビューアーで閲覧する

1. **ビューアーの起動**:
   - 本Webアプリケーションを開きます（ローカル起動手順は後述）。
2. **データの読み込み**:
   - 画面右上のインポートエリアに、生成された `modpack_data.json` をドラッグ＆ドロップ（またはファイル選択）します。
3. **レシピの検索と確認**:
   - アイテム名（日本語・英語・内部名）やMOD名で絞り込み検索を行い、クラフトツリーや必要素材数を確認できます。

---

## 💻 開発・ローカル起動手順

Webビューアーをローカルで起動・開発する場合の手順です。

### 前提条件
- [Node.js](https://nodejs.org/) (v18以上推奨)
- npm

### 手順

```bash
# 依存パッケージのインストール
npm install

# 開発用ローカルサーバーの起動
npm run dev
```

起動後、ターミナルに表示されるURL（例: `http://localhost:5173/`）にブラウザでアクセスしてください。

### プロダクションビルド

```bash
npm run build
```
ビルド結果は `dist/` ディレクトリに出力されます。

---

## 🛠 技術スタック

- **Web Viewer (Frontend)**:
  - React 18 / TypeScript
  - Vite
  - Lucide React (アイコン)
  - Vanilla CSS (レスポンシブ・カスタムテーマ)
- **Data Exporter (Game-Side Mod)**:
  - C# (.NET / tModLoader API)
  - `Terraria.ModLoader.ModSystem` (`PostAddRecipes`)

---

## 📜 ライセンス

本プロジェクトは [MIT License](file:///C:/Users/nekom/Desktop/Terraria_Recipe/LICENSE) の下で公開されています。詳細は [`LICENSE`](file:///C:/Users/nekom/Desktop/Terraria_Recipe/LICENSE) ファイルをご参照ください。

※ 『Terraria』および『tModLoader』の著作権・商標は Re-Logic および tModLoader チームに帰属します。
