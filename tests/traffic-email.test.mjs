import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {previousDay,sendDaily} from '../worker/traffic-email.ts';
function fixture(){const raw=new DatabaseSync(':memory:');raw.exec(readFileSync(new URL('../migrations/traffic-email-delivery.sql',import.meta.url),'utf8'));
raw.exec("CREATE TABLE traffic_requests(occurred_at TEXT,site TEXT,path TEXT,country TEXT,region TEXT,city TEXT,browser TEXT,device TEXT,category TEXT); CREATE TABLE traffic_meta(key TEXT,value TEXT); INSERT INTO traffic_meta VALUES('request_detail_started_at','2026-11-01 00:00:00');");
raw.prepare('INSERT INTO traffic_requests VALUES(?,?,?,?,?,?,?,?,?)').run('2026-11-12T20:00:00.000Z','carriegabaree.com','/<script>','US','Illinois','Chicago','Chrome','Desktop','browser_like');
const db={prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return raw.prepare(sql).get(...values)},async all(){return {results:raw.prepare(sql).all(...values)}},async run(){return raw.prepare(sql).run(...values)}}},async batch(q){return Promise.all(q.map(s=>s.all()))}};return {raw,env:{ENVIRONMENT:'production',GEO_DB:db,RESEND_API_KEY:'test-secret',CONTACT_FROM:'Traffic <website@forms.timgabaree.com>'}};}
test('Central calendar boundaries handle winter, summer and DST transitions',()=>{
for(const [now,hours,start] of [['2026-03-09T13:00:00Z',23,'2026-03-08T06:00:00.000Z'],['2026-11-02T14:00:00Z',25,'2026-11-01T05:00:00.000Z'],['2026-11-13T14:00:00Z',24,'2026-11-12T06:00:00.000Z']]){const p=previousDay(new Date(now));assert.equal(p.hour,8);assert.equal(p.start,start);assert.equal(Date.parse(p.end)-Date.parse(p.start),hours*3600000);}
});
test('sends once to fixed recipient with escaped report and provider idempotency',async()=>{
const {raw,env}=fixture();let calls=0;const fetcher=async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'family-traffic-2026-11-12');const p=JSON.parse(options.body);assert.deepEqual(p.to,['tim@timgabaree.com']);assert.match(p.text,/1 recorded page requests/);assert.match(p.html,/&lt;script&gt;/);assert.doesNotMatch(p.html,/<script>/);return Response.json({id:'receipt-1'});};
assert.equal((await sendDaily(env,new Date('2026-11-13T14:00:00Z'),fetcher)).status,'sent');assert.equal((await sendDaily(env,new Date('2026-11-13T14:15:00Z'),fetcher)).status,'already-sent');assert.equal(calls,1);assert.equal(raw.prepare('SELECT payload FROM traffic_email_delivery').get().payload,'');raw.close();
});
test('failed send remains retryable with identical payload; never sends outside local hour',async()=>{
const {raw,env}=fixture();let body;await assert.rejects(sendDaily(env,new Date('2026-11-13T14:00:00Z'),async(u,o)=>{body=o.body;return new Response('',{status:500})}));assert.equal(raw.prepare('SELECT status FROM traffic_email_delivery').get().status,'pending');
await sendDaily(env,new Date('2026-11-13T14:15:00Z'),async(u,o)=>{assert.equal(o.body,body);return Response.json({id:'receipt-2'})});
assert.equal((await sendDaily(env,new Date('2026-11-13T13:00:00Z'),()=>{throw Error('must not send')})).status,'outside-window');raw.close();
});

test('HTML tables preserve category totals and link each site to Cloudflare',async()=>{
 const {renderDailyReport,analyticsLink}=await import('../worker/traffic-email-template.ts');
 const sites=['timgabaree.com','carriegabaree.com','rgesol.com','finngabaree.com','clintgabaree.com'];
 const values=[[246,1648,13,27],[117,1657,3,67],[192,1632,14,20],[43,1343,0,9],[75,1345,4,13]];
 const categories=['browser_like','verified_bot','suspected_automation','unclassified'];
 const report=renderDailyReport({day:'2026-11-15',start:'2026-11-15T06:00:00.000Z',end:'2026-11-16T06:00:00.000Z',coverageNote:'',counts:sites.flatMap((site,i)=>categories.map((category,j)=>({site,category,requests:values[i][j]}))),pages:[{site:sites[0],path:'/<script>?q="&',requests:166}],locations:[{city:'London',region:'England',country:'GB',requests:74}],devices:[{browser:'Chrome',device:'Desktop',requests:328}]});
 assert.match(report.html,/>8,468<\/a>/);
 assert.match(report.html,/>673<\/a>/);
 assert.match(report.html,/7\.9% of recorded requests/);
 assert.match(report.html,/48\.7%/);
 assert.equal((report.html.match(/<thead>/g)||[]).length,4);
 assert.match(report.html,/<th scope="col"/);
 for(const site of sites)assert.ok(report.html.includes(`href="${analyticsLink(site)}"`));
 assert.match(report.html,/&lt;script&gt;\?q=&quot;&amp;/);
 assert.doesNotMatch(report.html,/<script>/);
 assert.match(report.html,/do not preset the date/);
 assert.match(report.text,/timgabaree.com: 246 \| 1,648 \| 13 \| 27 \| 1,934/);
 assert.equal(analyticsLink('evil.example/"'),analyticsLink());
});
test('empty days and partial coverage remain clear without invalid percentages',async()=>{
 const {renderDailyReport}=await import('../worker/traffic-email-template.ts');
 const report=renderDailyReport({day:'2026-11-15',start:'start',end:'end',coverageNote:'Coverage note: partial <day>',counts:[],pages:[],locations:[],devices:[]});
 assert.doesNotMatch(report.html,/NaN|Infinity/);
 assert.match(report.html,/Coverage note: partial &lt;day&gt;/);
 assert.equal((report.html.match(/No recorded browser-like requests\./g)||[]).length,3);
 assert.match(report.text,/0 recorded page requests; 0 browser-like/);
});
