# 文化祭カフェ クロッフル注文サイト

文化祭のカフェでクロッフルを注文し、注文状況を確認するためのWebアプリです。お客様向けの注文画面と、スタッフ向けの注文・在庫管理画面があります。

## 主な機能

- 商品メニュー、価格、説明、在庫状況の表示
- 商品ごとの数量選択と合計金額の計算
- 在庫を確認して注文を登録し、注文番号を発行
- 注文状況（準備中・お渡し可能・受取完了・キャンセル）の確認
- スタッフ画面での注文状況変更と、在庫数・販売状態の管理
- 注文一覧の自動更新（約4秒ごと）と、お客様画面の状況確認（約3.5秒ごと）

## 動作に必要な環境

- PHP（PDO MySQL 拡張を有効化）
- MySQL
- PHPとMySQLを実行できるWebサーバー（Apacheなど）

## セットアップ

1. MySQLで `schema.sql` を一度実行します。`cafe_db` データベース、商品・注文関連テーブル、および初期商品4件が作成されます。
2. `api/config.example.php` を `api/config.php` にコピーし、データベース接続設定を利用する環境に合わせて変更します。
3. `api/config.php` のスタッフ合言葉を、運用前に推測されにくい値へ変更します。`api/config.php` は機密情報を含むため、Gitへ追加しないでください。
4. プロジェクトのルートをWebサーバーの公開ディレクトリに配置します。
5. ブラウザーで `index.html` を開くと注文画面、`admin.html` を開くとスタッフ管理画面が表示されます。

PHPの組み込みWebサーバーを使う場合は、プロジェクトのルートで次のコマンドを実行します（MySQLは別途起動し、接続設定を済ませてください）。

```sh
php -S localhost:8000
```

注文画面は `http://localhost:8000/index.html`、スタッフ画面は `http://localhost:8000/admin.html` で開きます。

## 使い方

### お客様

1. メニューから商品と数量を選びます。在庫切れまたは販売停止の商品は注文できません。
2. 合計金額を確認し、「注文を確定する」を押します。
3. 表示された注文番号を確認し、注文状況が「お渡し可能」になったら受取カウンターへお越しください。会計は受け取り時です。
4. 注文番号はブラウザーの `localStorage` に保存されるため、同じブラウザーで再度開くと注文状況画面に戻ります。

### スタッフ

1. `admin.html` を開き、設定済みの合言葉でログインします。
2. 「注文一覧」タブで、本日の注文を確認し、状況を変更します。
3. 「在庫・売切管理」タブで、商品ごとの在庫数と販売状態を変更します。
4. 作業後はログアウトします。

## ファイル構成

```text
.
├── index.html                 # お客様向け注文画面
├── admin.html                 # スタッフ向け管理画面
├── schema.sql                 # データベース・テーブル・初期商品の定義
├── css/
│   └── style.css              # 注文画面・管理画面の共通スタイル
├── js/
│   ├── order.js               # メニュー表示、カート、注文、状況確認
│   └── admin.js               # ログイン、注文・在庫管理
└── api/
    ├── config.php             # DB接続、セッション、JSON応答の共通処理（Git管理対象外）
    ├── config.example.php     # config.php の設定例
    ├── get_menu.php           # 商品メニュー取得
    ├── create_order.php       # 注文登録と在庫減算
    ├── get_order_status.php   # 注文状況取得
    └── admin/
        ├── auth.php           # スタッフ認証・ログアウト
        ├── get_orders.php     # 本日の注文一覧取得
        ├── update_status.php  # 注文状況変更
        └── update_stock.php   # 在庫数・販売状態変更
```

## データベース

- `products`: 商品名、価格、説明、在庫数、販売状態
- `orders`: 注文番号、合計金額、注文状況、作成・更新日時
- `order_items`: 注文ごとの商品、数量、注文時の商品名・単価

注文状況は `preparing`（準備中）、`ready`（お渡し可能）、`completed`（受取完了）、`cancelled`（キャンセル）です。初期商品はチョコオレオ、あんバター、ハムチーズ、チーズ&ブラックペッパーです。

## API概要

| エンドポイント | 用途 |
| --- | --- |
| `GET api/get_menu.php` | 商品一覧・在庫・販売状態の取得 |
| `POST api/create_order.php` | 商品IDと数量を送信して注文を作成 |
| `GET api/get_order_status.php?order_number=...` | 注文番号から状況を取得 |
| `GET api/admin/auth.php?action=check` | スタッフログイン状態の確認 |
| `POST api/admin/auth.php?action=login` | 合言葉によるログイン |
| `GET api/admin/auth.php?action=logout` | ログアウト |
| `GET api/admin/get_orders.php` | 本日の注文一覧取得（要ログイン） |
| `POST api/admin/update_status.php` | 注文状況の変更（要ログイン） |
| `POST api/admin/update_stock.php` | 在庫数・販売状態の変更（要ログイン） |

管理用APIはPHPセッションによるスタッフ認証が必要です。APIはJSON形式で応答します。
