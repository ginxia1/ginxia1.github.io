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

let proof = slice('<!-- PROOF -->', '<!-- STATS');
/* STATS 뒤에 오는 섹션은 index.html 구성에 따라 달라지므로 먼저 나오는 경계를 사용 */
const statsEnd = ['<!-- PRICING -->', '<!-- FOOTER -->']
  .map(m => src.indexOf(m)).filter(i => i > src.indexOf('<!-- STATS')).sort((a, b) => a - b)[0];
if (statsEnd == null) throw new Error('STATS 구간의 끝을 찾지 못함');
let stats = src.slice(src.indexOf('<!-- STATS'), statsEnd).trimEnd();

/* 포트폴리오 전용 조정
   - 리드 문구(수강생 대상 설명)는 제외
   - 긱스 실적 배지는 떼어내 페이지 맨 아래로 이동 */
proof = proof.replace(/[ \t]*<p class="lead">[\s\S]*?<\/p>\r?\n?/, '');
const claim = (proof.match(/<div class="claim">[\s\S]*?<\/div>/) || [''])[0];
proof = proof.replace(/[ \t]*<div class="claim">[\s\S]*?<\/div>\r?\n?/, '');
if (!claim) throw new Error('긱스 배지(.claim)를 찾지 못함');

/* 프로씬 활동명 '체크메이트' 반영.
   단, 수강생 리뷰 원문("킹백수님 …")은 실제 발언이므로 그대로 둔다. */
const rename = s => s.replace(/킹백수(?!님)/g, '체크메이트');
proof = rename(proof);
stats = rename(stats);

/* 긱스 배지를 성과 숫자와 한 덩어리로 — 주장 위, 뒷받침 숫자 아래 */
stats = stats.replace('<div class="stat-grid">', `<div class="claim-row">${claim}</div>\n    <div class="stat-grid">`);
if (!stats.includes('claim-row')) throw new Error('stat-grid를 찾지 못해 배지를 넣지 못함');
const ver = (src.match(/style\.css\?v=(\d+)/) || [, '1'])[1];
const BASE = 'https://ginxia1.github.io';

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>체크메이트 코치 · 포트폴리오</title>
<meta name="description" content="체크메이트 코치 포트폴리오 — 수강생 티어 상승 인증과 KEG 서울대표 선발전 준우승 등 대회 성과." />
<meta property="og:title" content="체크메이트 코치 · 포트폴리오" />
<meta property="og:description" content="수강생 성과 인증과 대회 실적을 한 페이지에 정리했습니다." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="체크메이트 LoL 코칭" />
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
<!-- Microsoft Clarity — 히트맵·세션 레코딩. 프로젝트 ID는 공개값이라 소스에 노출돼도 무방하다. -->
<script type="text/javascript">
(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xyogdfjmv8");
</script>
</head>
<body id="top">
<div class="bg-fx"></div>

<!-- NAV -->
<header class="nav">
  <div class="wrap nav-inner">
    <a href="#top" class="brand"><span class="mark">C</span><b>체크메이트 <span style="color:var(--text-dim);font-weight:500">포트폴리오</span></b></a>
  </div>
</header>

${proof}

${stats}

<!-- FOOTER -->
<footer>
  <div class="wrap foot-inner">
    <div>© 2026 체크메이트 LoL 코칭. All rights reserved.</div>
  </div>
</footer>

<div class="toast" id="toast"></div>

<script src="script.js?v=${ver}"></script>
</body>
</html>
`;

fs.writeFileSync('portfolio.html', html);
console.log('portfolio.html 생성 완료 —', Buffer.byteLength(html), 'bytes / css·js v=' + ver);
