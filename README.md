# Terraria & tModLoader 全MOD対応レシピビューアー (Terraria Recipe Viewer)

『Terraria』および『tModLoader』環境における、バニラおよび導入されているすべてのMOD・拡張アドオンMOD（Calamity, Thorium, Fargo's Souls, DLCなど）のレシピ・多段クラフトツリー・末端総素材数を瞬時に逆引き・可視化できるWebアプリケーション＆データエクスポートツールです。

> [!WARNING]
> このツールはAntigravity CLIを使用して作成されています。

---

## 🌟 主な特徴

- 🌲 **多段クラフトツリーの可視化**: 幾重にも連なる巨大なクラフトツリーをインタラクティブなノードツリーとして展開・探索。
- 🔀 **代替レシピの切り替え＆並列比較**: 複数の作成レシピがある場合、作業台や素材プレビューカードでワンクリック切り替え、または「全レシピ同時表示」で並列比較可能。
- 🛡️ **自然な精錬ツリーと循環防止**: Shimmerや脱クラフト、同格鉱石変換によるリサイクルループを自動除外。天然素材（鉱石・木材・天然ドロップ等）で美しく末端停止。
- 📊 **末端総素材数の一括計算（Raw Material Aggregator）**: 最終アイテムを作成するために必要な「基礎素材（鉱石・ドロップ品・購入品等）」の合計要求数を自動集計。
- 🔄 **正引き＆逆引き（How to Craft / Used in）**: アイテムの作り方だけでなく、「このアイテムは何の素材として使えるか」をMOD横断で逆引き検索。
- 🎨 **アイテム画像表示＆高速CDN**: jsDelivr / GitHub 高速CDNによる画像即時表示。さらに `/exporticons` で全MODのオリジナルテクスチャを100%完全オフライン表示可能。
- 💾 **IndexedDBによるレシピ＆画像自動永続化**: 大規模MODパックの膨大なデータもブラウザ内に自動保存。次回起動時は **0msで前回データが即時復元** されます。
- 📁 **ZIP・フォルダ選択＆ドラッグ対応**: PCに負荷をかけないZIPファイル（`modpack_icons.zip`）の1ファイル読み込みやフォルダ選択に対応。
- 🌐 **多言語対応**: 日本語・英語のアイテム名表示切り替えに対応。

---

## 🚀 使い方・導入手順

### 1. tModLoader からレシピ＆画像をエクスポートする

1. **MODソースフォルダの準備**:
   - `tModLoader` のMODソースフォルダを開きます。
     - Windowsの場合の通常パス:  
       `Documents\My Games\Terraria\tModLoader\ModSources\RecipeDataExporter`
2. **ファイルの配置**:
   - 本リポジトリの [`exporter/RecipeDataExporter.cs`](./exporter/RecipeDataExporter.cs) を上記フォルダに配置します。
3. **ゲーム内でビルド＆有効化**:
   - tModLoaderを起動し、**「Modの管理 (Manage Mods)」 > 「Mod Sources」** から `RecipeDataExporter` をビルド・有効化します。
4. **レシピデータの自動出力**:
   - ゲーム起動時（Adding Recipes...）に、起動時間を一切邪魔せず **0.1秒でメタデータのみが自動出力** されます：
     - 保存先: `Documents\My Games\Terraria\tModLoader\modpack_data.json`
5. **アイテムテクスチャの出力（全MOD画像完全対応）**:
   - ワールドに入り、チャット欄に **`/exporticons`** と入力します。
   - バックグラウンドでテクスチャ抽出が行われ、完了すると自動的に **`modpack_icons.zip`** が生成されます：
     - 保存先: `Documents\My Games\Terraria\tModLoader\modpack_icons.zip`

---

### 2. Webビューアーで閲覧する

1. **ビューアーの起動**:
   - 本Webアプリケーションをブラウザで開きます。
2. **データの読み込み**:
   - 画面中央（または右上のインポート画面）に、生成された `modpack_data.json` をドラッグ＆ドロップ（またはファイル選択）します。
   - **一度読み込めばブラウザに自動保存されるため、次回からは開くだけで即座に利用できます。**
3. **MOD画像のインポート（任意）**:
   - 「MODデータ読込」画面の **「2. アイテム画像」タブ** で、生成された **`modpack_icons.zip`** を1つ選択するだけで、全MODのアイテム画像が登録されます。
4. **レシピの検索と確認**:
   - アイテム名（日本語・英語・内部名）やMOD名で絞り込み検索を行い、クラフトツリーや必要素材数を確認できます。

---

## 💻 開発・ローカル起動手順

Webビューアーをローカルで起動・開発する場合の手順です。

### 前提条件
- [Node.js](https://nodejs.org/) (v18以上推奨)
- npm

Node.jsがインストールされていない場合は[Node.jsインストールガイド](./docs/install_nodejs.md)を参照してください。

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
  - Vite 8
  - JSZip (クライアント側ZIP非同期解凍)
  - IndexedDB (レシピデータセット＆画像Blob永続化ストレージ)
  - Lucide React (UIアイコン)
  - Vanilla CSS (ダークテーマ・ピクセルアートレンダリング)
- **Data Exporter (Game-Side Mod)**:
  - C# (.NET / tModLoader 1.4 API)
  - `Terraria.ModLoader.ModSystem` (`PostAddRecipes`, `PostUpdateEverything`)
  - `System.IO.Compression.ZipFile`
  - メインスレッド安全なフレーム分散テクスチャキャプチャシステム

---

## 📜 ライセンス

本プロジェクトは [MIT License](file:///C:/Users/nekom/Desktop/program/Terraria_Recipe/LICENSE) の下で公開されています。

※ 『Terraria』および『tModLoader』の著作権・商標は Re-Logic および tModLoader チームに帰属します。
