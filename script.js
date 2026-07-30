/* ---- reveal on scroll ---- */
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---- count up ---- */
const cio=new IntersectionObserver((es)=>{es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target, target=+el.dataset.count, plus=el.querySelector('.plus');
  let cur=0; const step=Math.max(1,Math.round(target/48));
  const t=setInterval(()=>{cur+=step; if(cur>=target){cur=target;clearInterval(t)}
    el.childNodes[0].nodeValue=cur.toLocaleString(); if(plus)el.appendChild(plus);
  },22);
  cio.unobserve(el);
})},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>{if(!el.querySelector('.plus'))el.textContent='0';cio.observe(el)});

/* ---- lightbox: 스크린샷 확대 + 유튜브 재생 ---- */
const lb=document.createElement('div');
lb.className='lb';
lb.innerHTML='<span class="x">&times;</span><img alt="확대 이미지"><div class="lb-video"></div>';
document.body.appendChild(lb);
const lbImg=lb.querySelector('img');
const lbVideo=lb.querySelector('.lb-video');

function closeLb(){
  lb.classList.remove('on');
  lbVideo.classList.remove('on');
  lbVideo.innerHTML='';           // iframe 제거 — 닫은 뒤 소리가 계속 나는 것 방지
  lbImg.style.display='';
}
function openImage(src){
  lbVideo.classList.remove('on'); lbVideo.innerHTML='';
  lbImg.style.display=''; lbImg.src=src;
  lb.classList.add('on');
}
function openVideo(id){
  if(!/^[A-Za-z0-9_-]{5,20}$/.test(id))return;
  lbImg.style.display='none'; lbImg.removeAttribute('src');
  lbVideo.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="유튜브 영상"'
    +' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  lbVideo.classList.add('on');
  lb.classList.add('on');
}

document.addEventListener('click',(e)=>{
  const yt=e.target.closest('.ytpill[data-yt]');
  if(yt){openVideo(yt.dataset.yt);return;}
  const shot=e.target.closest('.jshot,.tshot,.wshot,.sched-img img');
  if(shot){openImage(shot.src);return;}
  if(e.target.closest('.lb'))closeLb();
});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeLb()});

/* ---- FAQ ---- */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement, a=item.querySelector('.faq-a'), open=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null});
    if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}
  });
});

/* ---- toast ---- */
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200)}

/* ---- inquiry form: send to email(Web3Forms) + Discord(webhook) ---- */
const ACCESS_KEY="83ea7841-dad0-4b3e-9333-62edff1365a3"; // web3forms.com 액세스 키 (수신 이메일은 이 키에 묶여 있음)
const DISCORD_WEBHOOK_B64="aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTUzMDE1NjczMzIzMjU3ODgxMi9JWlAzcFdfOHRKUnNnUjN1aW5oeGxyX2N1eWhRell1MldTb01QY1RodHRaRlRwaXNHMjg2WjY4Q2xaX0tTYXdTb25nVw==";  // 디스코드 웹훅(base64, 자동무효화 회피). 나중에 코치님 비공개 채널 웹훅으로 교체
const _set=v=>v && v.indexOf('__')!==0;
document.getElementById('inquiryForm').addEventListener('submit',async function(e){
  e.preventDefault();
  const f=e.target;
  if(f.botcheck && f.botcheck.checked) return; // 허니팟: 봇이면 조용히 중단
  const btn=f.querySelector('button[type="submit"]');
  const label=btn.textContent;
  const v={nick:f.nick.value,discord:(f.discord?f.discord.value:'')||'-',tier:f.tier.value,line:f.line.value,course:f.course.value||'-',msg:f.msg.value||'-'};
  const summary=`[킹백수 코칭 문의]\n소환사명: ${v.nick}\n디스코드: ${v.discord}\n현재 티어: ${v.tier}\n주 포지션: ${v.line}\n관심 강의: ${v.course}\n남기실 말씀: ${v.msg}`;
  const openDiscord=()=>setTimeout(()=>window.open('https://discord.gg/FBeMPmdpPq','_blank'),800);
  const fallback=()=>{ // 전송 실패/미설정 시 안전망: 복사 + 디스코드
    const done=()=>{toast('전송에 문제가 있어 내용을 복사했습니다. 디스코드에 붙여넣어 주세요 📋');openDiscord();};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(summary).then(done).catch(done);}else{done();}
  };
  async function sendEmail(){
    if(!_set(ACCESS_KEY))return false;
    try{
      const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({access_key:ACCESS_KEY,subject:'🎮 킹백수 코칭 새 문의',from_name:'킹백수 코칭 사이트','소환사명':v.nick,'디스코드 닉네임':v.discord,'현재 티어':v.tier,'주 포지션':v.line,'관심 강의':v.course,'남기실 말씀':v.msg})});
      const d=await r.json().catch(()=>({}));
      return r.ok&&d.success;
    }catch(err){return false;}
  }
  async function sendDiscord(){
    if(!_set(DISCORD_WEBHOOK_B64))return false;
    let url; try{url=atob(DISCORD_WEBHOOK_B64);}catch(err){return false;}
    try{
      const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({embeds:[{title:'🎮 킹백수 코칭 새 문의',color:0xc8aa6e,fields:[
          {name:'소환사명',value:v.nick||'-',inline:true},{name:'디스코드',value:v.discord||'-',inline:true},{name:'현재 티어',value:v.tier||'-',inline:true},{name:'주 포지션',value:v.line||'-',inline:true},
          {name:'관심 강의',value:v.course},{name:'남기실 말씀',value:v.msg}],timestamp:new Date().toISOString()}]})});
      return r.ok;
    }catch(err){return false;}
  }
  if(!_set(ACCESS_KEY)&&!_set(DISCORD_WEBHOOK_B64)){fallback();return;} // 둘 다 미설정
  btn.disabled=true; btn.textContent='전송 중…';
  try{
    const [emailOk,discordOk]=await Promise.all([sendEmail(),sendDiscord()]);
    if(emailOk||discordOk){toast('문의가 정상 접수되었습니다! 🙌 곧 연락드릴게요');f.reset();openDiscord();}
    else{fallback();}
  }finally{btn.disabled=false;btn.textContent=label;}
});