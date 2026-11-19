import crypto from 'node:crypto';

const SOURCES = {
  habits: '34d4c96f-ce7a-81b1-a006-000b0c640ca2',
  tasks: '34d4c96f-ce7a-810f-8dc5-000b53ae7ec1',
  goals: '34d4c96f-ce7a-8167-94a4-000bb17c6f87',
  projects: '34d4c96f-ce7a-81b6-8a6a-000b0b2fc20a'
};
function authenticate(initData, botToken, allowedId) {
  if (!initData || initData.length > 8192) return false;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash) || !Number.isFinite(authDate) || Math.abs(Date.now()/1000-authDate)>3600) return false;
  const pairs = [...params.entries()].filter(([k])=>k!=='hash' && k!=='signature').sort(([a],[b])=>a.localeCompare(b));
  const check = pairs.map(([k,v])=>`${k}=${v}`).join('\n');
  const key = crypto.createHmac('sha256','WebAppData').update(botToken).digest();
  const expected = crypto.createHmac('sha256',key).update(check).digest();
  if (!crypto.timingSafeEqual(Buffer.from(hash,'hex'),expected)) return false;
  try { return String(JSON.parse(params.get('user')||'{}').id) === String(allowedId); } catch { return false; }
}
function titleOf(page) {
  for (const prop of Object.values(page.properties||{})) {
    if (prop?.type==='title') return (prop.title||[]).map(t=>t.plain_text).join('') || 'Без названия';
  }
  return 'Без названия';
}
function statusOf(page) {
  for (const [name,p] of Object.entries(page.properties||{})) {
    if (p?.type==='status' || (p?.type==='select' && /статус/i.test(name))) return p.status?.name || p.select?.name || null;
  }
  return null;
}
async function fetchSource(id,token) {
  const items=[]; let cursor;
  for (let i=0;i<3;i++) {
    const r=await fetch(`https://api.notion.com/v1/data_sources/${id}/query`,{
      method:'POST',headers:{Authorization:`Bearer ${token}`,'Notion-Version':'2025-09-03','Content-Type':'application/json'},
      body:JSON.stringify({page_size:100,...(cursor?{start_cursor:cursor}:{})})
    });
    if (!r.ok) { const body=await r.text(); throw new Error(`Notion ${r.status}: ${body.slice(0,240)}`); }
    const data=await r.json();
    items.push(...(data.results||[]).map(x=>({id:x.id,title:titleOf(x),status:statusOf(x),url:x.url})));
    if (!data.has_more) return {items,truncated:false};
    cursor=data.next_cursor;
  }
  return {items,truncated:true};
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {NOTION_TOKEN,TELEGRAM_BOT_TOKEN,TELEGRAM_ALLOWED_USER_ID}=process.env;
  if (!NOTION_TOKEN || !TELEGRAM_BOT_TOKEN || !TELEGRAM_ALLOWED_USER_ID) return res.status(503).json({error:'Не настроены серверные переменные NOTION_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_USER_ID'});
  const initData=req.body?.initData;
  if (typeof initData!=='string' || !authenticate(initData,TELEGRAM_BOT_TOKEN,TELEGRAM_ALLOWED_USER_ID)) return res.status(401).json({error:'Открой Plana из Telegram под разрешённым аккаунтом'});
  try {
    const result=await Promise.allSettled(Object.entries(SOURCES).map(async ([name,id])=>[name,await fetchSource(id,NOTION_TOKEN)]));
    const data={}; const errors={};
    result.forEach((r,i)=>{const name=Object.keys(SOURCES)[i];if(r.status==='fulfilled')data[name]=r.value[1];else errors[name]=r.reason.message;});
    return res.status(200).json({data,errors,readOnly:true,syncedAt:new Date().toISOString()});
  } catch {return res.status(500).json({error:'Ошибка получения данных Notion'});}
}
