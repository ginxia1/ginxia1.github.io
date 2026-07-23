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

/* ---- lightbox (click screenshot to enlarge) ---- */
const lb=document.createElement('div');
lb.className='lb';
lb.innerHTML='<span class="x">&times;</span><img alt="확대 이미지">';
document.body.appendChild(lb);
const lbImg=lb.querySelector('img');
document.addEventListener('click',(e)=>{
  const shot=e.target.closest('.jshot,.tshot,.wshot,.sched-img img');
  if(shot){lbImg.src=shot.src;lb.classList.add('on');return;}
  if(e.target.closest('.lb'))lb.classList.remove('on');
});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')lb.classList.remove('on')});

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

/* ---- inquiry form: copy + go discord ---- */
document.getElementById('inquiryForm').addEventListener('submit',function(e){
  e.preventDefault();
  const f=e.target;
  const txt=`[킹백수 코칭 문의]\n소환사명: ${f.nick.value}\n현재 티어: ${f.tier.value}\n주 포지션: ${f.line.value}\n관심 강의: ${f.course.value||'-'}\n남기실 말씀: ${f.msg.value||'-'}`;
  const go=()=>{toast('문의 내용이 복사되었습니다! 디스코드에서 붙여넣어 주세요 📋');setTimeout(()=>window.open('https://discord.gg/FBeMPmdpPq','_blank'),700)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(go).catch(go)}else{go()}
});