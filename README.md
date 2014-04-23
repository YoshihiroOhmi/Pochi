﻿# Pochi version 0.12 README  
大見 嘉弘 <ohmi@rsch.tuis.ac.jp>

Pochiは、いわゆるClicker (Audience Response System)をWeb上に実現したもので、
回答者はスマートフォンやタブレットを使用することを前提としています。

以下の特徴があります。
* 回答者の回答等の通信にWebSocketを用いている。  
  httpに比べ、必要な通信量が少なく、原則としてポーリングを行わないため、
  高速で安定した動作が期待できる。
* サーバは、Node.js と npmで自動的にインストールされるモジュールのみを必要とする。

# 動作環境
* サーバ  
	Windows, MacOS X, Linux (Node.jsが動けば良い)

* ブラウザ  
	最近のFirefox, Safari, Chrome, Internet Explorer等
	(WebSocketに対応していること。その他のプロトコルでも
	 Socket.IOが対応していれば動作するが、遅かったり不安定
	 な可能性が高い)

# インストール方法
* Node.jsをインストールする。  
※ http://nodejs.org/ からInstallerをダウンロードしてインストールすることを
お勧めします。Installerを使わずにインストールした場合は、別途npmをインストー
ルする必要が生じます。npm単体のインストールは結構面倒です。

* シェルを起動し、cdコマンドでPochiのディレクトリ(このREADME.txtがある場所)
に移動してください。  
※ シェルは、Windowsの場合コマンドプロンプト、MacOSの場合ターミナルに読み替えてください。

* インターネットに接続された状態で、シェル上で npm install を実行してください。
必要なモジュールがダウンロード＆インストールされます。
少し時間がかかります。node_modulesというディレクトリができます。

# 使い方

* シェルを起動し、node app を実行します。これでサーバが起動します。  
※ MacOSの場合は、sudo node app でrootになって実行してください。
(ポート番号を80以外にすれば一般ユーザでも起動できます)  
※ ファイアウォールから質問があれば、パケットを通過するようにしてください。

* 管理者(質問者)はブラウザから http://localhost/admin/ で接続してください。
認証はユーザ名、パスワードともadminです。

* 管理者トップページから「アドレス表示」を押すと回答者向けのURLとQRコードが
表示されます。これを使って回答者がPochiにアクセスできます。

# トラブルシューティング
* node appで実行できない  
「warn  - error raised: Error: listen EADDRINUSE」と表示される場合は、既に
80番ポートが開かれています。Apacheなどの他のWebサーバが起動しているものと
思われます。他のWebサーバを停止してください。  
Pochiで80番以外のポートを使用したい場合は、config.jsonファイルをテキスト
エディタで開き、「"port": "80"」の行を編集してください。

# TODO

* 画面デザインの改良
* エラーチェックの追加による動作安定性向上
…
