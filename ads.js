/*
 * すいた・とよなか往来 広告表示スクリプト
 * Googleスプレッドシート（「ウェブに公開」したCSV）から広告を読み込んで、
 * 各ページの広告枠（data-ad-slot="ad1" など）に表示します。
 *
 * ★設定するのはこの1行だけ：下の '' の中に、公開したCSVのURLを貼り付けてください。
 */
var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyjY_fkp6AHy1XOCvnTm0UdCBv7m4zOR9hu9WI9fKQHJwZJ9ocGzgDPR8UOntMngE01B3sWH3Valb/pub?gid=1256463475&single=true&output=csv';

(function () {
  var CACHE_KEY = 'suitoyo_ads_csv_v1';
  var slots = document.querySelectorAll('[data-ad-slot]');
  if (!slots.length) return;

  // CSV（カンマ区切り）を読み取る。セル内の改行・引用符にも対応
  function parseCSV(t) {
    t = t.replace(/^\uFEFF/, '');
    var rows = [], row = [], f = '', q = false, i, c;
    for (i = 0; i < t.length; i++) {
      c = t.charAt(i);
      if (q) {
        if (c === '"') { if (t.charAt(i + 1) === '"') { f += '"'; i++; } else { q = false; } }
        else { f += c; }
      } else if (c === '"') { q = true; }
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') { f += c; }
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  // シートの行 → { 枠ID: {on, code, url, text} }
  function toMap(csv) {
    var map = {}, found = false;
    parseCSV(csv).forEach(function (r) {
      var id = (r[0] || '').trim().toLowerCase();
      if (!/^(ad|furusato)\d+$/.test(id)) return;   // 見出し行・説明行は無視
      found = true;
      map[id] = {
        on: (r[2] || '').trim().toUpperCase() === 'ON',
        code: (r[3] || '').trim(),
        url: (r[4] || '').trim(),
        text: (r[5] || '').trim()
      };
    });
    return found ? map : null;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 表示するHTMLを決める（広告コード優先。なければ簡易リンク）
  function buildHTML(rec) {
    if (!rec || !rec.on) return '';
    if (rec.code) return rec.code;
    if (/^https?:\/\//i.test(rec.url)) {
      return '<a href="' + esc(rec.url) + '" target="_blank" rel="nofollow sponsored noopener">' +
             esc(rec.text || rec.url) + '</a>';
    }
    return '';
  }

  // innerHTMLでは動かない <script> を動くように作り直す
  function setHTML(el, html) {
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll('script'), function (old) {
      var s = document.createElement('script');
      Array.prototype.forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });
  }

  function apply(map) {
    var wrappers = [];
    Array.prototype.forEach.call(slots, function (slot) {
      var id = slot.getAttribute('data-ad-slot').toLowerCase();
      var html = buildHTML(map[id]);
      var body = slot.querySelector('.ad-body') || slot;
      if (!html) { slot.hidden = true; }
      else {
        if (slot.getAttribute('data-rendered') !== html) {   // 同じ内容なら描き直さない
          setHTML(body, html);
          slot.setAttribute('data-rendered', html);
        }
        slot.hidden = false;
      }
      var w = slot.closest('.ad-block') || slot.closest('.furusato-block') || slot.closest('section');
      if (w && wrappers.indexOf(w) < 0) wrappers.push(w);
    });
    // 中の広告が1つも表示されないときは、見出しごと隠す
    wrappers.forEach(function (w) {
      w.hidden = !w.querySelector('[data-ad-slot]:not([hidden])');
    });
  }

  // 1) 前回の内容があれば先に表示（速くて、通信エラー時の保険にもなる）
  try {
    var cached = localStorage.getItem(CACHE_KEY);
    if (cached) { var cm = toMap(cached); if (cm) apply(cm); }
  } catch (e) {}

  // 2) スプレッドシートから最新を取得して更新
  if (!SHEET_CSV_URL) { if (window.console) console.warn('ads.js: SHEET_CSV_URL が未設定です'); return; }
  fetch(SHEET_CSV_URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      var m = toMap(text);
      if (!m) throw new Error('広告データが見つかりません');
      apply(m);
      try { localStorage.setItem(CACHE_KEY, text); } catch (e) {}
    })
    .catch(function (e) { if (window.console) console.warn('ads.js:', e); });
})();
