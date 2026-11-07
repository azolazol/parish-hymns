'use strict';
const $ = id => document.getElementById(id);
const week = ['일','월','화','수','목','금','토'];
const roles = ['입당성가','봉헌성가','영성체성가','파견성가'];
const cache = {};
let parish = 'mokdong', month = '', day = 1, view = 'calendar', requestId = 0;
const today = new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Seoul'});
function node(tag, text, className) {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function songsLink(numbers) {const wrap=node('div',undefined,'songs');for(const n of numbers){const a=node('a');a.href='https://www.youtube.com/results?search_query='+encodeURIComponent('가톨릭 성가 '+n+'번');a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','가톨릭 성가 '+n+'번 유튜브 검색');a.append(node('b',n),node('span','번'),node('span','▷'));wrap.append(a);}return wrap;}
function massCard(entry){const card=node('div',undefined,'mass');card.append(node('h3',entry.label||'미사'));const names=entry.roleLabels||(parish==='mokdong'?['입당성가','예물준비성가','영성체성가','파견성가']:roles);entry.songs.forEach((s,i)=>{if(entry.roleLabels&&!s.length)return;const row=node('div',undefined,'role');row.append(node('div',names[i], 'role-name'),s.length?songsLink(s):node('p','원본에 성가번호 미기재','muted'));card.append(row);});return card;}
function selectDay(d){day=d;render();}
function syncURL(){const u=new URL(location.href);u.searchParams.set('parish',parish);u.searchParams.set('month',month);history.replaceState(null,'',u);}
function render(){
 const data=cache[parish], sheet=data?.months[month];if(!sheet)return;
 document.documentElement.dataset.parish=parish;document.title=data.name+' 성가노트 · '+month;
 document.querySelectorAll('[data-parish]').forEach(b=>{b.classList.toggle('active',b.dataset.parish===parish);b.setAttribute('aria-pressed',String(b.dataset.parish===parish));});
 const [y,m]=month.split('-').map(Number), entries=sheet.entries;
 $('parish-label').textContent=data.name+' · 월별 성가표';$('title').textContent=y+'년 '+m+'월';$('footer-name').textContent=data.name+' 성가노트';
 const months=Object.keys(data.months).sort();$('month').replaceChildren(...months.map(value=>{const o=node('option',value);o.value=value;return o;}));$('month').value=month;const at=months.indexOf(month);$('prev').disabled=at===0;$('next').disabled=at===months.length-1;
 $('stats').textContent=entries.filter(r=>r.day>0).length+'개 일정 · '+new Set(entries.flatMap(r=>r.songs.flat())).size+'곡';
 for(const id of ['download','modal-download']){$(id).href=sheet.source;$(id).download=sheet.fileName;}
 $('source-image').src=sheet.source;$('source-image').alt=data.name+' '+month+' 성가표 원본';
 $('calendar-view').setAttribute('aria-pressed',String(view==='calendar'));$('list-view').setAttribute('aria-pressed',String(view==='list'));
 const schedule=$('schedule');schedule.replaceChildren();
 if(view==='calendar'){
  const weekdays=node('div',undefined,'week');week.forEach((w,i)=>weekdays.append(node('span',w,i===0?'sunday':'')));schedule.append(weekdays);
  const grid=node('div',undefined,'calendar'),offset=new Date(y,m-1,1).getDay(),days=new Date(y,m,0).getDate();
  for(let i=0;i<offset;i++)grid.append(node('div',undefined,'empty'));
  for(let d=1;d<=days;d++){const rows=entries.filter(r=>r.day===d),b=node('button',undefined,'date'+(day===d?' selected':'')+(new Date(y,m-1,d).getDay()===0?' sunday':''));b.setAttribute('aria-label',m+'월 '+d+'일 '+(rows[0]?.label||'일정 없음'));b.setAttribute('aria-pressed',String(day===d));b.append(node('b',d,'date-number'),node('span',rows[0]?.label||'일정 없음','date-label'));if(rows.length>1)b.append(node('small','+'+(rows.length-1)+'개 일정'));b.append(node('span',rows[0]?.songs.flat().length?rows[0].songs[0].join(' · '):'번호 미기재','date-songs'));b.onclick=()=>selectDay(d);grid.append(b);}schedule.append(grid);
 }else{const list=node('div',undefined,'month-list');entries.forEach(r=>{const b=node('button');b.append(node('b',r.day?r.day+'일':'별도'),node('span',r.label),node('small',r.songs.flat().join(' · ')||'번호 미기재'));b.onclick=()=>{day=r.day;view='calendar';render();};list.append(b);});schedule.append(list);}
 $('special').replaceChildren(...entries.filter(r=>r.day===0).map(r=>{const c=massCard(r);c.prepend(node('p','별도 일정 · 일자 미기재','eyebrow'));return c;}));
 const detail=$('detail');detail.replaceChildren(node('p','선택한 날짜','eyebrow'),node('h2',day===0?'성시간 · 일자 미기재':m+'월 '+day+'일 '+week[new Date(y,m-1,day).getDay()]+'요일'));
 const selected=entries.filter(r=>r.day===day);if(selected.length)detail.append(...selected.map(massCard));else detail.append(node('p','이 날짜에 등록된 성가가 없습니다.','muted'));detail.append(node('p','▷ 번호를 누르면 유튜브 검색 결과가 열립니다. 영상 제목의 성가번호를 확인하고 재생해 주세요.','hint'));syncURL();
}
async function loadParish(key, requestedMonth){
 const id=++requestId;parish=key;$('error').hidden=true;
 try{if(!cache[key]){const r=await fetch('/data/'+key+'.json');if(!r.ok)throw new Error('성가표를 불러오지 못했습니다. 새로고침해 주세요.');cache[key]=await r.json();}if(id!==requestId)return;const months=Object.keys(cache[key].months).sort();month=requestedMonth&&months.includes(requestedMonth)?requestedMonth:months.at(-1);day=today.startsWith(month)?Number(today.slice(8)):1;render();loadCounter(key);}catch(e){if(id!==requestId)return;$('error').textContent=e.message;$('error').hidden=false;}
}
async function loadCounter(key){$('counter').hidden=true;try{const r=await fetch('/api/visits?parish='+key,{method:'POST'});if(!r.ok)return;const data=await r.json();if(key!==parish)return;$('counter').textContent='오늘 방문자 '+data.today.toLocaleString()+' · 전체 방문자 '+data.total.toLocaleString()+' (브라우저 기준)';$('counter').hidden=false;}catch{}}
document.querySelectorAll('[data-parish]').forEach(b=>b.onclick=()=>loadParish(b.dataset.parish));
$('month').onchange=e=>{month=e.target.value;day=1;render();};
for(const [id,diff]of [['prev',-1],['next',1]])$(id).onclick=()=>{const months=Object.keys(cache[parish].months).sort();const next=months[months.indexOf(month)+diff];if(next){month=next;day=1;render();}};
$('calendar-view').onclick=()=>{view='calendar';render();};$('list-view').onclick=()=>{view='list';render();};
$('source').onclick=()=>$('source-modal').showModal();$('close-source').onclick=()=>$('source-modal').close();$('source-modal').onclick=e=>{if(e.target===$('source-modal'))$('source-modal').close();};
const params=new URLSearchParams(location.search);loadParish(params.get('parish')==='shinjeong'?'shinjeong':'mokdong',params.get('month'));
