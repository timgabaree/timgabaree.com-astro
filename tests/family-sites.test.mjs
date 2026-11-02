import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('family footer uses the five public sites, new tabs, centered dots and accessible hints',()=>{
 const sites=JSON.parse(readFileSync(new URL('../src/data/family-sites.json',import.meta.url),'utf8'));
 assert.deepEqual(sites.map(s=>new URL(s.url).hostname),['carriegabaree.com','clintgabaree.com','finngabaree.com','rgesol.com','timgabaree.com']);
 for(const site of sites){const u=new URL(site.url);assert.equal(site.label,u.hostname);assert.equal(u.protocol,'https:');assert.equal(u.pathname,'/');assert.equal(u.search+u.hash+u.username+u.password,'');}
 const component=readFileSync(new URL('../src/components/FamilySites.astro',import.meta.url),'utf8');
 assert.ok(component.includes('target="_blank" rel="noopener noreferrer"'));
 assert.ok(component.includes('opens in a new tab'));assert.ok(component.includes('·'));assert.ok(!component.includes('↗'));
 const footer=readFileSync(new URL('../src/components/Footer.astro',import.meta.url),'utf8');
 assert.ok(footer.includes('<FamilySites />'));
});
test('contact page no longer repeats the separate Carrie promotion',()=>{
 const contact=readFileSync(new URL('../src/pages/contact.astro',import.meta.url),'utf8');
 assert.doesNotMatch(contact,/Looking for Carrie Gabaree|contact-related-site/);
});
