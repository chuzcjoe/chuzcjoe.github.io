import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source = await fs.readFile(new URL('../static/js/visits.js', import.meta.url), 'utf8');
function browser(origin = 'https://www.chuzcjoe.com') {
  const elements = Object.fromEntries([['site_uv', 24000], ['site_pv', 31000], ['page_pv', 54]].map(([key, baseline]) => ['busuanzi_value_' + key, {dataset:{historyValue:String(baseline)},textContent:'…'}]));
  const scripts = [], timers = [];
  const context = {URL, location:{origin}, window:{}, document:{
    querySelector:()=>({href:'https://www.chuzcjoe.com/misc/misc-online-softmax/'}),
    getElementById:id=>elements[id], createElement:()=>({remove(){this.removed=true;}}),head:{append:script=>scripts.push(script)},
  },setTimeout:fn=>{timers.push(fn);return 1;},clearTimeout:()=>{}};
  vm.runInNewContext(source, context);
  return {...context,elements,scripts,timers};
}
test('historical counts are added once to live counts; the full page referrer is retained', () => {
  const b=browser(), script=b.scripts[0];
  assert.equal(b.scripts.length,1);
  assert.equal(script.referrerPolicy,'no-referrer-when-downgrade');
  const key=new URL(script.src).searchParams.get('jsonpCallback'), callback=b.window[key];
  callback({site_uv:12,site_pv:30,page_pv:3});
  assert.equal(b.elements.busuanzi_value_site_uv.textContent,'24012');
  assert.equal(b.elements.busuanzi_value_site_pv.textContent,'31030');
  assert.equal(b.elements.busuanzi_value_page_pv.textContent,'57');
  callback({site_uv:12,site_pv:30,page_pv:3});
  assert.equal(b.elements.busuanzi_value_page_pv.textContent,'57');
  assert.ok(script.removed);assert.equal(b.window[key],undefined);
});
test('failure preserves the historical baseline and marks the missing live counts', () => {
  const b=browser();b.scripts[0].onerror();
  assert.equal(b.elements.busuanzi_value_page_pv.textContent,'54+');
  assert.match(b.elements.busuanzi_value_page_pv.title,/temporarily unavailable/);
});
test('new posts have no historical offset; invalid live responses are not displayed as counts', () => {
  const b=browser(); b.elements.busuanzi_value_page_pv.dataset.historyValue='0';
  const key=new URL(b.scripts[0].src).searchParams.get('jsonpCallback');
  b.window[key]({site_uv:12,site_pv:30,page_pv:8});
  assert.equal(b.elements.busuanzi_value_page_pv.textContent,'8');
  const invalid=browser();invalid.elements.busuanzi_value_page_pv.dataset.historyValue='0';invalid.timers[0]();
  assert.equal(invalid.elements.busuanzi_value_page_pv.textContent,'…');
});
test('local previews and old-domain cached pages do not send statistics requests', () => {
  for(const origin of ['http://localhost:4321','https://chuzcjoe.github.io'])assert.equal(browser(origin).scripts.length,0);
});
