FirebaseでExpressを使用しWeb APIを実装する
==

- [Firebaseの準備](#Firebaseの準備)
    - [プロジェクトの作成](#プロジェクトの作成)
    - [Firebase CLIのインストール](#Firebase-CLIのインストール)
- [ワーキングディレクトリの設定](#ワーキングディレクトリの設定)
- [Expressを使用したAPIの作成](#Expressを使用したAPIの作成)
    - [ファイルの編集](#ファイルの編集)
    - [ローカルでの動作確認](#ローカルでの動作確認) 
- [DBとの連携](#DBとの連携)
    - [Firebase DBの作成](#Firebase-DBの作成)
    - [認証](#認証)
    - [APIの修正](#APIの修正)
    - [動作確認](#動作確認)

# Firebaseの準備
## プロジェクトの作成
事前準備として以下のURLからFirebaseにログインし、プロジェクト追加を選択する。適当なプロジェクトを作成しておく。
```
https://console.firebase.google.com/?hl=ja
```
## Firebase CLIのインストール
事前にNode.jsの環境を用意する。
```
$ npm install -g firebase-tools
```

CLIのインストールが完了したら先ほどログインしたアカウントを選択する。
```
$ firebase login
```

# 作業用のディレクトリの設定
作業用のディレクトリを作成
```
$ mkdir ~/firebase-express
$ cd ~/firebase-express
```

Hostingの初期化を実施
あらかじめプロジェクトを作成している場合はそのプロジェクトを選択する。
```
$ firebase init hosting
```

Functionsも初期化を実施
```
$ firebase init functions
```

# Expressを使用したAPIの作成
## ファイルの編集
`functions`ディレクトリに移動しExpressをインストールする。
```
$ cd functions
$ npm install --save express
```

`index.js`を以下のように編集する。
CORS(Cross-Origin Resource Shareing) エラーを回避するためcorsを使用する。
```
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/japan', (request, response) => {
  const res = {"country": "Japan"}
  response.send(res);
})

app.get('/api/australia', (request, response) => {
  const res = {"country": "Australia"}
  response.send(res);
})

exports.app = functions.https.onRequest(app);
```

次に`firebase.json`も編集する。
```
{
  "hosting": {
    "public": "public",
    "rewrites": [{
      "source": "/api/**",
      "function": "app"
    }],
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

/api 以下のパスが指定された時にapp関数を実行するようにしている。

## ローカルでの動作確認
ローカルでWebサーバを立ち上げアクセスできるか確認する。

```
$ firebase serve --only functions,hosting
```

デフォルトで5000ポートを使用しているため`localhost:5000/api/japan`にアクセスし`{"country": "Japan"}`が取得できることを確認する。

# DBとの連携
ここまででパスを変えることで異なるデータを取得するAPIを作成したが、今度はそのデータをDBから取得できるようにする。

## Firebase DBの作成
1. DataBase を選択し Firestoreを選択
2. ロックモードを選択した場合
3. Firebase SDKのインストール
```
cd ~/firebase-express
npm install --save firebase-admin
```
4. 権限設定  
プロジェクトのダッシュボードから歯車アイコン -> ユーザ権限をクリックする。  
左端のカギアイコンをマウスオーバーしてサービスアカウントをクリックする。  
サービスアカウントの右端オプションアイコンから キーを作成 をクリックする。  
JSONでキーを作成する。

## APIの修正
`index.js`を修正する。  
`[SERVICE ACCOUNT JSON FILE]`の部分を先ほどダウンロードしたサービスアカウントのJSONファイル名に書き換える。

```
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());

var serviceAccount = require("./[SERVICE ACCOUNT JSON FILE]");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();
var docRef = db.collection('<collection_name>').doc('<doc_name>');

app.get('/api/country', (request, response) => {
  var res;
  res = docRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
        response.send(doc.data());
      }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

app.post('/api/country', (request, response) => {
  var res;
  console.log(request.body);
  docRef.set(request.body);
  response.send(res);
});

exports.app = functions.https.onRequest(app);
```

## 動作確認
ローカルでサーバを立ち上げ設定したパスにアクセスするとDBの内容が表示される。

```
$ firebase serve --only functions,hosting
```

ブラウザでアクセスし、データが表示されることを確認する。
```
localhost:5000/api/country
```


# 参考情報
- [Firebaseの始め方](https://qiita.com/kohashi/items/43ea22f61ade45972881)
- [Firebaseで動かすNode.jsアプリ入門](https://qiita.com/seya/items/225f859d775b31047000)
- [Firebase Cloud Firestoreを使ってみる](https://qiita.com/bathtimefish/items/164d2b0cd268f209db9b)
