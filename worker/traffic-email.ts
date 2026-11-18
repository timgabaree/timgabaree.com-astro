import {renderDailyReport,type CountRow,type TopRow} from './traffic-email-template.ts';
const ZONE='America/Chicago';
const TARGET='tim@timgabaree.com';
type MailEnv={ENVIRONMENT?:string;GEO_DB?:D1Database;RESEND_API_KEY?:string;CONTACT_FROM?:string};
function localParts(now:Date){return Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));}
function midnight(day:string){
 // Resolve each midnight independently, including 23/25-hour daylight-saving days.
 const nominal=Date.parse(day+'T00:00:00Z');let instant=nominal+6*3600000;
 for(let i=0;i<3;i++){const p=localParts(new Date(instant));const displayed=Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:00:00Z`);instant+=nominal-displayed;}
 return new Date(instant).toISOString();
}
export function previousDay(now:Date){const p=localParts(now);const today=`${p.year}-${p.month}-${p.day}`;const day=new Date(Date.parse(today+'T12:00:00Z')-86400000).toISOString().slice(0,10);return {day,start:midnight(day),end:midnight(today),hour:Number(p.hour)};}
export async function prepareDaily(db:D1Database,period:ReturnType<typeof previousDay>,from:string){
 const {day,start,end}=period;const where="occurred_at>=? AND occurred_at<?";
 const result=await db.batch([
 db.prepare(`SELECT site,category,COUNT(*) requests FROM traffic_requests WHERE ${where} GROUP BY site,category`).bind(start,end),
 db.prepare(`SELECT site,path,COUNT(*) requests FROM traffic_requests WHERE ${where} AND category='browser_like' GROUP BY site,path ORDER BY requests DESC,site,path LIMIT 15`).bind(start,end),
 db.prepare(`SELECT country,region,city,COUNT(*) requests FROM traffic_requests WHERE ${where} AND category='browser_like' GROUP BY country,region,city ORDER BY requests DESC,country,region,city LIMIT 10`).bind(start,end),
 db.prepare(`SELECT browser,device,COUNT(*) requests FROM traffic_requests WHERE ${where} AND category='browser_like' GROUP BY browser,device ORDER BY requests DESC,browser,device LIMIT 10`).bind(start,end),
 db.prepare("SELECT value FROM traffic_meta WHERE key='request_detail_started_at'")]);
 const counts=result[0].results as CountRow[];
 const started=(result[4].results[0] as {value?:string}|undefined)?.value;
 const coverageNote=!started||Date.parse(started.replace(' ','T').replace(/Z?$/,'Z'))>Date.parse(start)
  ?`Coverage note: page-detail collection began ${started||'at an unknown time'} UTC. This day has partial or no coverage.`:'';
 const report=renderDailyReport({day,start,end,coverageNote,counts,pages:result[1].results as TopRow[],locations:result[2].results as TopRow[],devices:result[3].results as TopRow[]});
 return {from,to:[TARGET],subject:`Family websites daily traffic — ${day}`,...report};
}
export async function sendDaily(env:MailEnv,now=new Date(),send:typeof fetch=fetch){
 const period=previousDay(now);
 // UTC cron checks both winter and summer hours; only Chicago 08:00–08:59 sends.
 if(env.ENVIRONMENT!=='production'||period.hour!==8)return {status:'outside-window'};
 if(!env.GEO_DB||!env.RESEND_API_KEY||!env.CONTACT_FROM)throw Error('Daily traffic email configuration missing');
 const db=env.GEO_DB;
 const existing=await db.prepare('SELECT status,payload FROM traffic_email_delivery WHERE report_day=?').bind(period.day).first<{status:string;payload:string}>();
 if(existing?.status==='sent')return {status:'already-sent'};
 // Persist a stable payload so provider idempotency also protects concurrent/retried sends.
 if(!existing){const payload=JSON.stringify(await prepareDaily(db,period,env.CONTACT_FROM));await db.prepare("INSERT OR IGNORE INTO traffic_email_delivery(report_day,status,payload) VALUES(?,'pending',?)").bind(period.day,payload).run();}
 const row=await db.prepare('SELECT status,payload FROM traffic_email_delivery WHERE report_day=?').bind(period.day).first<{status:string;payload:string}>();
 if(row?.status==='sent')return {status:'already-sent'};
 if(!row)throw Error('Daily traffic email ledger unavailable');
 const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`family-traffic-${period.day}`},body:row.payload,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`Daily traffic email provider status ${response.status}`);
 const data=await response.json() as {id?:string};if(!data.id)throw Error('Daily traffic email missing provider receipt');
 await db.prepare("UPDATE traffic_email_delivery SET status='sent',sent_at=?,provider_id=?,payload='' WHERE report_day=?").bind(now.toISOString(),data.id,period.day).run();
 console.log(JSON.stringify({event:'traffic_daily_email_accepted',reportDay:period.day,providerId:data.id}));
 return {status:'sent',reportDay:period.day};
}
