// Ace Gaming — private owner alerts.
// Deployed as a Vercel Function. Never put bot credentials in frontend HTML.
const recent=new Map();
const WINDOW_MS=5*60*1000;
const MAX_PER_IP=10;
const MAX_BODY=12000;

function json(body,status=200){
  return new Response(JSON.stringify(body),{
    status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
  });
}
function val(obj,key,max=160){
  const value=obj[key];
  return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
}
function money(n){
  const num=Number(n);
  return Number.isFinite(num)&&num>=0&&num<10000000?'₹'+num.toLocaleString('en-IN'):'Not supplied';
}
function buildMessage(p){
  const kind=p.kind==='booking'?'BOOKING':'RENTAL';
  const rows=[
    '🔔 ACE GAMING — NEW '+kind+' REQUEST',
    'Reference: '+(val(p,'orderId',65)||'New request'),
    val(p,'customerName')?'Customer: '+val(p,'customerName'):null,
    val(p,'phone',35)?'Customer phone: '+val(p,'phone',35):null,
    val(p,'email')?'Email: '+val(p,'email'):null,
    val(p,'service')?'Service: '+val(p,'service'):null,
    val(p,'pack')?'Pack: '+val(p,'pack'):null,
    val(p,'setup')?'Setup: '+val(p,'setup'):null,
    val(p,'duration')?'Duration: '+val(p,'duration'):null,
    p.rentalMonths?'Rental: '+String(p.rentalMonths).slice(0,3)+' month(s)':null,
    val(p,'deliveryMethod')?'Fulfilment: '+val(p,'deliveryMethod'):null,
    val(p,'players')?'Players: '+val(p,'players'):null,
    val(p,'date')?'Date: '+val(p,'date'):null,
    val(p,'time')?'Time: '+val(p,'time'):null,
    val(p,'itemsSummary',1200)?'Items: '+val(p,'itemsSummary',1200):null,
    p.monthlyTotal!=null?'Monthly rent: '+money(p.monthlyTotal):null,
    p.termTotal!=null?'Term estimate: '+money(p.termTotal):null,
    val(p,'address',400)?'Delivery address: '+val(p,'address',400):null,
    val(p,'notes',500)?'Notes: '+val(p,'notes',500):null,
    '⚠️ New enquiry — confirm availability before accepting.'
  ];
  return rows.filter(Boolean).join('\n').slice(0,3900);
}
export default {
  async fetch(request){
    if(request.method!=='POST')return json({error:'POST required'},405);
    const origin=request.headers.get('origin');
    // Browser requests must be same-origin. Prevent another site from triggering alerts.
    if(origin && origin!==new URL(request.url).origin)return json({error:'Forbidden origin'},403);
    if(!(request.headers.get('content-type')||'').toLowerCase().includes('application/json'))
      return json({error:'JSON required'},415);
    if(Number(request.headers.get('content-length')||0)>MAX_BODY)
      return json({error:'Payload too large'},413);

    const token=process.env.ACE_TELEGRAM_BOT_TOKEN;
    const chat=process.env.ACE_TELEGRAM_CHAT_ID;
    if(!token||!chat)return json({sent:false,error:'Owner notifications are not configured'},503);

    let data;
    try{
      const raw=await request.text();
      if(raw.length>MAX_BODY)return json({error:'Payload too large'},413);
      data=JSON.parse(raw);
    }catch{return json({error:'Invalid JSON'},400);}
    if(!data||typeof data!=='object'||!['rental','booking'].includes(data.kind))
      return json({error:'Invalid request kind'},400);
    if(val(data,'website',250))return json({sent:false,error:'Invalid submission'},400);
    if(!val(data,'orderId',65))return json({error:'Missing request ID'},400);
    if(data.kind==='rental' && (!val(data,'customerName')||!val(data,'phone')||!val(data,'itemsSummary',1200)))
      return json({error:'Missing customer/order details'},400);

    // Best-effort per-instance abuse limit; production abuse protection may need CAPTCHA.
    const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
    const now=Date.now();
    for(const [key,entry] of recent)if(now-entry.since>WINDOW_MS)recent.delete(key);
    const entry=recent.get(ip)||{since:now,count:0};
    if(entry.count>=MAX_PER_IP)return json({error:'Too many requests'},429);
    entry.count++;
    recent.set(ip,entry);

    const text=buildMessage(data);
    let telegram;
    try{
      const response=await fetch('https://api.telegram.org/bot'+token+'/sendMessage',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:chat,text,disable_notification:false,protect_content:true}),
        signal:AbortSignal.timeout(8500)
      });
      telegram=await response.json();
      if(!response.ok||!telegram.ok)return json({sent:false,error:'Alert delivery failed'},502);
    }catch{return json({sent:false,error:'Alert service unreachable'},502);}
    return json({sent:true});
  }
};
