注文データ（注文の列）を受け取り、軽減税率と値引きのルールを適用して最終的な合計金額を出力するプログラムを書いてください。
Node.jsのEOLでないバージョンで動くコードを作成してください。
この問題はオープンソースではありません。Publicリポジトリなどに公開しないでください。 
期間は2週間とし、公平性を保つため速く提出したとしても評価対象にはなりません。

### 評価項目

* 既存の仕様を満たしているか
* 仕様が変更された時のソースコードの修正のしやすさ
* 仕様として出てきた知識に対してのソースコードでの表現力
* 自動テストの網羅性
* ソースコードの読みやすさ(認知的複雑度により定量的に計測します。)
* ディレクトリの分け方
* Node.jsへの理解

#### 評価方法

面接で、上記の評価項目についていくつか質問させていただきます。
質問に対する回答を画面共有等の準備をしていただける場合はそちらを基に2次面接を実施させていただきます。

### 金額計算の仕様

金額計算の仕様は以下のとおりです。（複雑ではありますが、丁寧に読み解いていただければ理解できる内容になっています）

#### 前提知識

* 注文される商品には `経口摂取する商品` と `経口摂取しない商品` がある
* 連続する注文の列において、`経口摂取する商品` の直後に `経口摂取しない商品` が注文されていた場合には、その2つをまとめて1つの `一体資産` の注文と見なす

> 「一体資産」の概念の詳細については下記ページなどをが参考になります。
> [食品を含んだ一体資産は軽減税率の対象になる？判断基準は？ | クラウド会計ソフト マネーフォワード](https://biz.moneyforward.com/accounting/basic/39482/)

※ この仕様は、国税庁の定義している軽減税率の仕様と異なる仕様となっています。

#### 税率の仕様

* `飲食料品` と `新聞` には8%の消費税を付加する
* それ以外の商品には10%の消費税を付加する
* `一体資産` についても原則として税抜合計額に対して10%の消費税を付加する
* ただし、 `一体資産` のうち以下の条件を全て満たすものは軽減税率の対象と見なし、税抜合計額に対して8%の消費税を付加する
  * 税込額が1万円未満である。
  * 税抜合計額に対して、`経口摂取しない商品`の税抜額が2/3以上を占めない。
  * `経口摂取する商品` が `飲食料品` である。
* 消費税額が小数になる場合は、小数点以下を四捨五入する

なお、`飲食料品` とは以下を満たすものを指す。

* 経口摂取するものである。
* 酒類ではない。
* テイクアウトである。
  * ただし、サービスの種別がテイクアウトであっても、提供方法がケータリングの場合は飲食料品としては扱わない。
    * ただし、有料老人ホームで提供する場合は飲食料品として扱う。
* 医薬品、医薬部外品ではない。

例
```
以下の3つの注文データがある場合

(1) 飲食料品（200円）
(2) その他の商品（100円）
(3) その他の商品（200円）
(4) 飲食料品（300円）

(1) と (2) は合わせて1つの一体資産とみなすので、300円に対して税率8%が適用される。
(3) には税率10%が適用され、(4) には税率8%が適用される。
したがって計算手順は以下のとおりとなる。

(100+200)*1.08 + 200*1.1 + 300*1.08
```

#### 値引きの仕様

* 注文全体において、「`飲食料品` と `新聞` （`一体資産` ではない単体の `新聞`）の税抜合計金額」と「それら以外の税抜合計金額」の割合がちょうど2:3だった場合には、最終的な **税込** 合計金額から10%の値引きを行う
  * 10%値引きした結果が小数になる場合は、小数点以下を切り捨てる

### 注文データの仕様

注文データは、複数の注文を `:` 区切りで繋いだ文字列として受け取ります。

例:
```
BTDD2032:DaEK5001:BnTNM2000
```

注文データとして受け取る注文の数は1個〜10000個です。

1つの注文を表す文字列は以下のフォーマットになっています。

`[商品種別][サービス種別][提供方法][提供場所][金額]`

注文の各部位に与えられうる文字列とその意味は以下のとおりです。

#### 商品種別

|文字列|種別|経口摂取するか|
|:--|:--|:--|
|B|書籍|しない|
|D|清涼飲料水|する|
|Da|酒類|する|
|de|医薬部外品|する|
|Bn|新聞|しない|
|d|医薬品|する|
|O|その他|しない|
|P|食料品|する|

#### サービス種別

|文字列|種別|
|:--|:--|
|T|テイクアウト|
|E|イートイン|

#### 提供方法

|文字列|種別|
|:--|:--|
|K|ケータリング|
|D|配送|
|N|インターネット配信|

#### 提供場所

提供場所は記載されている場合と記載されていない場合があります。

|文字列|種別|
|:--|:--|
|D|戸建て|
|N|老人ホーム|
|M|マンション|
||提供場所なし|

#### 金額

金額は0〜99999の整数で入力されます。

### 出力フォーマット

与えられた注文データに対し、消費税を付加して必要に応じて値引きを行った最終的な税込合計金額を整数で標準出力として出力してください。

#### テストデータ

```javascript
const dataProvider = [
	{
		input: 'BTDD500',
		actual: 550,
	},
	{
		input: 'DTDD500',
		actual: 540,
	},
	{
		input: 'DTDD400:BTDD199',
		actual: 647,
	},
	{
		input: 'BTDD200:DTDD400:BTDD200',
		actual: 868,
	},
	{
		input: 'BTDD200:DTDD400:BTDD199',
		actual: 867,
	},
	{
		input: 'DTDD200:BTDD300',
		actual: 486,
	},
	{
		input: 'DTDD2:BTDD5',
		actual: 8,
	},
	{
		input: 'DTDD10000:BTDD10000',
		actual: 22000,
	},
	{
		input: 'DTDD3:DTDD3:DTDD3',
		actual: 9,
	},
];
assert(dataProvider.every(({input, actual}) => test(input) === actual)
```


## 作成したプログラムの実装の説明を記載してください。

<!-- ここに実装の概要を書いてください。 -->

以下の3つの設問を記載してください。

### 評価項目

* ドキュメンテーション能力
* 実装の評価に対する評価の判断材料の一つ
* 非機能要件に対するこだわり
* ソースコードに対する説明能力

### プログラムの実行方法

<!-- ここに今回作ったコードの実行方法を書いてください。 -->

### プログラムの評価項目についての意識したポイント

<!-- ここにプログラムの評価方法を書いてください。 -->

### プログラムで評価項目以外でこだわったポイント

<!-- ここにプログラムの評価以外にこだわったポイントを書いてください。 -->

