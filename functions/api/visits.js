// Optional Cloudflare D1 binding: DB. No browser-local totals are used.
export async function onRequestPost({request,env}) {
 if(!env.DB)return new Response(null,{status:503});
 const url=new URL(request.url),parish=url.searchParams.get('parish');
 if(!['mokdong','shinjeong'].includes(parish))return new Response(null,{status:400});
 const origin=request.headers.get('Origin');
 if(origin&&origin!==url.origin)return new Response(null,{status:403});
 if(request.headers.get('Sec-Fetch-Site')==='cross-site')return new Response(null,{status:403});
 let visitor=request.headers.get('Cookie')?.match(/(?:^|;\s*)hymn_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1];
 const fresh=!visitor;if(!visitor)visitor=crypto.randomUUID();
 const day=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
 try {
  await env.DB.batch([
   env.DB.prepare('INSERT OR IGNORE INTO visitors(parish,id) VALUES(?,?)').bind(parish,visitor),
   env.DB.prepare('INSERT OR IGNORE INTO daily_visitors(parish,day,id) VALUES(?,?,?)').bind(parish,day,visitor)
  ]);
  const result=await env.DB.batch([
   env.DB.prepare('SELECT COUNT(*) AS count FROM visitors WHERE parish=?').bind(parish),
   env.DB.prepare('SELECT COUNT(*) AS count FROM daily_visitors WHERE parish=? AND day=?').bind(parish,day)
  ]);
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
  if(fresh)headers['Set-Cookie']='hymn_visitor='+visitor+'; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax';
  return new Response(JSON.stringify({total:result[0].results[0].count,today:result[1].results[0].count}),{headers});
 }catch{return new Response(null,{status:503});}
}
