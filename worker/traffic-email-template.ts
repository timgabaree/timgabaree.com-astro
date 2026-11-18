import {SITES} from './geo-traffic.ts';

export type CountRow={site:string;category:string;requests:number};
export type TopRow={requests:number;[key:string]:string|number};
type Report={day:string;start:string;end:string;coverageNote:string;counts:CountRow[];pages:TopRow[];locations:TopRow[];devices:TopRow[]};
const PRIVATE_REPORT='https://carrie-archive-admin.timgabaree-com-astro.workers.dev/traffic';
const ACCOUNT='7459bd2037d71d23fd030e3542b9df61';
const ANALYTICS='https://dash.cloudflare.com/?to=/:account/:zone/analytics/traffic';
const CATEGORIES=['browser_like','verified_bot','suspected_automation','unclassified'] as const;
const LABELS=['Browser-like','Verified bots','Suspected automation','Unclassified'];
const COLORS=['#2563eb','#64748b','#b45309','#94a3b8'];
const NOTES='Counts are page requests, not unique people. Browser-like does not prove a human visitor. Locations are approximate. Do Not Track and Global Privacy Control requests are excluded, as are assets, redirects, blocked requests, and pages served wholly from browser cache.';
const DRILLDOWN='Linked counts open Cloudflare HTTP Traffic analytics. Select the report date and add filters as needed; location and device links ask you to choose a site. These links do not preset the date, page, or browser-like classification. Cloudflare uses a different dataset, so totals may differ; available detail depends on your plan. Use the private report for the counts collected here.';
const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const num=(n:number)=>n.toLocaleString('en-US');
const percent=(n:number,total:number)=>total?`${(100*n/total).toFixed(1)}%`:'—';
// Domain names are supported dashboard route identifiers; only our known sites are allowed.
export const analyticsLink=(site?:string)=>site&&SITES.includes(site)?`https://dash.cloudflare.com/${ACCOUNT}/${site}/analytics/traffic`:ANALYTICS;
const link=(url:string,label:string,title='Open Cloudflare HTTP Traffic analytics')=>`<a href="${esc(url)}" title="${esc(title)}" style="color:#1d4ed8;text-decoration:underline">${label}</a>`;
const count=(n:number,site?:string)=>link(analyticsLink(site),num(n));
const td=(value:string,numeric=false)=>`<td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:anywhere;${numeric?'text-align:right;font-variant-numeric:tabular-nums;':''}">${value}</td>`;
function table(title:string,headers:string[],rows:string[],numeric:number[]){
 return `<h2 style="font-size:18px;margin:28px 0 10px;color:#0f172a">${esc(title)}</h2><table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed"><caption style="text-align:left;font-size:12px;color:#475569;padding-bottom:8px">${title.startsWith('By site')?'All recorded page requests, by traffic category.':'Browser-like page requests only.'}</caption><thead><tr>${headers.map((h,i)=>`<th scope="col" style="padding:10px 8px;background:#eef2f6;border-bottom:2px solid #cbd5e1;text-align:${numeric.includes(i)?'right':'left'};font-weight:600;overflow-wrap:anywhere">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${headers.length}" style="padding:16px 8px;color:#475569">No recorded browser-like requests.</td></tr>`}</tbody></table>`;
}
export function renderDailyReport(r:Report){
 const totals=CATEGORIES.map(c=>r.counts.filter(row=>row.category===c).reduce((sum,row)=>sum+row.requests,0));
 const total=r.counts.reduce((sum,row)=>sum+row.requests,0),browser=totals[0];
 const siteCounts=SITES.map(site=>({site,values:CATEGORIES.map(c=>r.counts.find(row=>row.site===site&&row.category===c)?.requests||0)}));
 const text=[`Family websites — ${r.day}`,'Midnight to midnight Central Time (CST/CDT).',`UTC window: ${r.start} to ${r.end} (end exclusive).`,r.coverageNote,
 `${total} recorded page requests; ${browser} browser-like (${percent(browser,total)}).`,'',
 'BY SITE — Browser-like | Verified bots | Suspected automation | Unclassified | Total',
 ...siteCounts.map(({site,values})=>`${site}: ${[...values,values.reduce((a,b)=>a+b,0)].map(num).join(' | ')}\nCloudflare: ${analyticsLink(site)}`),
 '', 'TOP PAGES — browser-like',...(r.pages.length?r.pages.map(p=>`${p.site} · ${p.path}: ${num(p.requests)}`):['No recorded browser-like requests.']),
 '', 'TOP LOCATIONS — browser-like',...(r.locations.length?r.locations.map(p=>`${p.city} · ${p.region} · ${p.country}: ${num(p.requests)}`):['No recorded browser-like requests.']),
 '', 'BROWSERS AND DEVICES — browser-like',...(r.devices.length?r.devices.map(p=>`${p.browser} · ${p.device}: ${num(p.requests)} (${percent(p.requests,browser)})`):['No recorded browser-like requests.']),
 '', DRILLDOWN,`Cloudflare analytics: ${ANALYTICS}`,`Private report: ${PRIVATE_REPORT}`,'',NOTES].filter(line=>line!==undefined).join('\n');
 const siteRows=siteCounts.map(({site,values})=>`<tr>${td(link(analyticsLink(site),esc(site).replace('.com','<wbr>.com')))}${[...values,values.reduce((a,b)=>a+b,0)].map(n=>td(count(n,site),true)).join('')}</tr>`);
 siteRows.push(`<tr style="background:#eef2f6;font-weight:700">${td('All sites')}${[...totals,total].map(n=>td(num(n),true)).join('')}</tr>`);
 const summary=[['Recorded page requests',num(total),'All traffic categories'],['Browser-like requests',num(browser),`${percent(browser,total)} of recorded requests`],['Verified bot requests',num(totals[1]),`${percent(totals[1],total)} of recorded requests`]];
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Family websites — ${esc(r.day)}</title><style>@media(max-width:600px){.content{padding:16px!important}th,td{padding:8px 4px!important;font-size:11px!important}.metric{font-size:24px!important}}</style></head><body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,Helvetica,sans-serif;line-height:1.5"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${num(total)} page requests · ${num(browser)} browser-like · ${esc(r.day)} Central Time</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 8px"><table role="presentation" width="760" cellpadding="0" cellspacing="0" style="width:100%;max-width:760px;background:#ffffff;border:1px solid #e2e8f0"><tr><td class="content" style="padding:28px">
 <p style="margin:0;color:#475569;font-size:12px;letter-spacing:1px">DAILY WEBSITE METRICS</p><h1 style="margin:4px 0;font-size:26px">Family websites</h1><p style="margin:0 0 20px;color:#475569">${esc(r.day)} · Midnight to midnight Central Time (CST/CDT)</p>
 ${r.coverageNote?`<p style="padding:12px;background:#fffbeb;border-left:4px solid #b45309">${esc(r.coverageNote)}</p>`:''}
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed"><tr>${summary.map(([label,value,detail])=>`<td style="padding:12px 8px;background:#eef2f6;vertical-align:top;border-right:4px solid #ffffff"><div style="font-size:12px;color:#475569">${label}</div><div class="metric" style="font-size:30px;font-weight:700">${link(ANALYTICS,value)}</div><div style="font-size:11px;color:#475569">${detail}</div></td>`).join('')}</tr></table>
 <p style="margin:16px 0 8px;font-size:13px;font-weight:600">Traffic mix</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${totals.map((n,i)=>n?`<td width="${100*n/(total||1)}%" height="12" style="background:${COLORS[i]};font-size:0;line-height:0">&nbsp;</td>`:'').join('')||'<td height="12" style="background:#e2e8f0"></td>'}</tr></table><p style="font-size:12px;color:#475569;margin:8px 0">${LABELS.map((label,i)=>`<span style="color:${COLORS[i]}">■</span> ${label}: ${percent(totals[i],total)}`).join(' &nbsp; ')}</p>
 ${table('By site',['Site','Browser-like','Verified bots','Suspected automation','Unclassified','Total'],siteRows,[1,2,3,4,5])}
 ${table('Top pages',['Site','Page','Requests'],r.pages.map(p=>`<tr>${td(esc(p.site))}${td(link(analyticsLink(String(p.site)),esc(p.path),'Open this site’s Cloudflare analytics; add a Path filter'))}${td(count(p.requests,String(p.site)),true)}</tr>`),[2])}
 ${table('Top locations',['City','Region','Country','Requests'],r.locations.map(p=>`<tr>${td(esc(p.city))}${td(esc(p.region))}${td(esc(p.country))}${td(count(p.requests),true)}</tr>`),[3])}
 ${table('Browsers and devices',['Browser','Device','Requests','Share of browser-like'],r.devices.map(p=>`<tr>${td(esc(p.browser))}${td(esc(p.device))}${td(count(p.requests),true)}${td(percent(p.requests,browser),true)}</tr>`),[2,3])}
 <h2 style="font-size:18px;margin:28px 0 10px">Explore the details</h2><p style="font-size:14px">${link(PRIVATE_REPORT,'Open private traffic report','Open the private report for these collected request counts')} &nbsp;·&nbsp; ${link(ANALYTICS,'Open Cloudflare analytics')}</p><p style="font-size:12px;color:#475569">${esc(DRILLDOWN)}</p>
 <p style="padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#475569">${esc(NOTES)}</p><p style="font-size:11px;color:#64748b">Exact UTC window: ${esc(r.start)} to ${esc(r.end)} (end exclusive).</p>
 </td></tr></table></td></tr></table></body></html>`;
 return {text,html};
}
