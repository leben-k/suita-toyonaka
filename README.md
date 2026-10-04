# すいた・とよなか往来（公開手順）
1. GitHubにリポジトリ `suita-toyonaka` を作り、このフォルダの中身（`build.py`・`svgs.py`・`base.css`・`ogp_src.html`・`__pycache__`・`*.xlsx` を除く。`ogp.png` と `ads.js` は含める）をすべてアップロード → Settings > Pages で公開。
   公開URLは https://leben-k.github.io/suita-toyonaka/ を想定しています（canonical・sitemap.xml・robots.txt に設定済み）。別のリポジトリ名にする場合は、これらのURLを書き換えてください。
2. 連絡先フォームの送信先は、むさしの・みたか往来と同じ Formspree（xeaowndg）です。このサイト専用にしたい場合は unei.html の action を差し替え、公開後にテスト送信を1回行ってください。
3. 広告枠：広告はHTMLに直接貼らず、Googleスプレッドシート（「ウェブに公開」したCSV）から `ads.js` が読み込んで表示します。
   - `ads.js` の `SHEET_CSV_URL` に公開CSVのURLを設定します（現在は空欄）。
   - 管理シートは `suitoyo_ads_sheet.xlsx`（ad1〜ad7、furusato1〜furusato3）。表示が OFF／空の枠は自動で非表示になります。
   - 配置：index（ad1・furusato1・furusato2）／guide（ad2）／map（ad3）／matsuri（ad4）／areas（furusato3・ad5）／shukuhaku（ad6・ad7）
4. 情報の確認時点は2026年10月です。開園日・料金・イベント日程は変わるため、公開前後に公式情報で見直してください。
   特に、豊中まつり・万博記念公園のイベント日程、宿泊施設の営業状況（千里阪急ホテルは2026年3月閉館）は要確認です。

`build.py`・`svgs.py` はページ再生成用（python3 build.py）。公開時は不要です。

## SEO・共有設定
- 各ページに title／description／canonical を設定（トップの canonical は `.../suita-toyonaka/`。sitemap.xml と一致）。
- OGP（`og:*`・`twitter:card`）を設定。共有画像は `ogp.png`（1200×630）。
- 構造化データ（JSON-LD）：トップに `WebSite`、各ページに `BreadcrumbList`（画面上のパンくずリストと一致）。運営者情報ページは noindex のため出力なし。
- イベント（祭り）の構造化データは、日程が毎年変わり古い情報が残るおそれがあるため設定していません。
- Search Console の所有権確認：`build.py` の `GSC_TOKEN` に確認コード（`google-site-verification` の content の値）を入れて `python3 build.py` を実行すると、全ページの `<head>` に出力されます。
- `robots.txt` はサブフォルダ内では Google に読まれません。sitemap は Search Console から送信してください。
