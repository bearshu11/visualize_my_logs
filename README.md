# gas_template

## 動作確認
1. 本テンプレートからレポジトリを作成し、```git clone```
2. ```npm install```
    - .bash_profileに export PATH="node_modules/.bin:$PATH" を記述
3. google drive上でGASのプロジェクトを作成し、scriptIDを取得
4. ルート下に.clasp.jsonを作成
```.clasp.json
{
  "scriptId":"************",
  "rootDir": "src"
}
```
5. プロジェクトにpush
```
clasp push
```
6. google drive上でhello.gsの関数が動いたら完了