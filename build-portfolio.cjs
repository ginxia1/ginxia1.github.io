/* index.html의 성과 섹션만 뽑아 포트폴리오 전용 페이지를 생성한다.
   index.html을 수정한 뒤 `node build-portfolio.cjs` 를 다시 실행하면 동기화된다. */
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

const slice = (from, to) => {
  const s = src.indexOf(from);
  const e = src.indexOf(to, s);
  if (s < 0 || e < 0) throw new Error(`구간을 찾지 못함: ${from}`);
  return src.slice(s, e).trimEnd();
};

const proof = slice('<!-- PROOF -->', '<!-- STATS');
const stats = slice('<!-- STATS', '<!-- PRICING -->');
const ver = (src.match(/style\.css\?v=(\d+)/) || [, '1'])[1];
const BASE = 'https://ginxia1.github.io';

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>킹백수 코치 · 포트폴리오</title>
<meta name="description" content="킹백수 코치 포트폴리오 — 수강생 티어 상승 인증과 KEG 서울대표 선발전 준우승 등 대회 성과." />
<meta property="og:title" content="킹백수 코치 · 포트폴리오" />
<meta property="og:description" content="수강생 성과 인증과 대회 실적을 한 페이지에 정리했습니다." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="킹백수 LoL 코칭" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:url" content="${BASE}/portfolio.html" />
<meta property="og:image" content="${BASE}/images/og-cover.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${BASE}/images/og-cover.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="style.css?v=${ver}" />
</head>
<body id="top">
<div class="bg-fx"></div>

<!-- NAV -->
<header class="nav">
  <div class="wrap nav-inner">
    <a href="#top" class="brand"><span class="mark">K</span><b>킹백수 <span style="color:var(--text-dim);font-weight:500">포트폴리오</span></b></a>
  </div>
</header>

${proof}

${stats}

<!-- FOOTER -->
<footer>
  <div class="wrap foot-inner">
    <div>© 2026 킹백수 LoL 코칭. All rights reserved.</div>
  </div>
</footer>

<div class="toast" id="toast"></div>

<script src="script.js?v=${ver}"></script>
</body>
</html>
`;

fs.writeFileSync('portfolio.html', html);
console.log('portfolio.html 생성 완료 —', Buffer.byteLength(html), 'bytes / css·js v=' + ver);
