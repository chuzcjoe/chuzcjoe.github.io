import { load } from 'cheerio';

// Capture the text MathJax sees after Markdown parsing. Exclude elements that
// tex2jax skips and the independently rendered legacy KaTeX output.
export function mathReference(html) {
  const $ = load(html, null, false);
  const katex = $('.katex').map((_, el) => $.html(el)).get();
  $('pre,code,figure,script,style,.katex').remove();
  const pattern = /\$\$[\s\S]*?\$\$|\$(?!\$)[^$]*?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g;
  const tex = [...$.text().matchAll(pattern)].map(m => m[0]);
  // Preserve hard breaks, emphasis, paragraph placement, and alignment, too.
  const containers = $('p,li,td,h1,h2,h3,h4,h5,h6').toArray().filter(el => {
    const text = $(el).text();
    return /\$\$|\$[^$]+\$|\\\(|\\\[/.test(text);
  }).map(el => {
    const clone = $(el).clone();
    clone.find('.headerlink').remove();
    for (const node of [clone[0], ...clone.find('*').toArray()]) {
      const entries = Object.entries(node.attribs || {}).sort(([a], [b]) => a.localeCompare(b));
      node.attribs = Object.fromEntries(entries);
    }
    return $.html(clone).replace(/\s+/g, ' ').trim();
  });
  return { tex, containers, katex };
}
