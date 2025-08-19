import { writeFile } from 'node:fs/promises';

const CHANNEL_ID = process.env.YT_CHANNEL_ID; // e.g. UCgJZkbxrBpbuHv4jOFuR8zQ
const MAX = parseInt(process.env.YT_MAX || '9', 10);

if (!CHANNEL_ID) {
  console.error('Missing YT_CHANNEL_ID');
  process.exit(1);
}

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

async function main() {
  const r = await fetch(FEED);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const xml = await r.text();

  // Minimal, dependency-free parse (good enough for YouTube’s Atom)
  // Extract entries
  const entries = xml.split('<entry>').slice(1).map(e => e.split('</entry>')[0]);

  const items = entries.map(e => {
    const pick = (tag) => (e.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [,''])[1].trim();
    const pickAttr = (tag, attr) => {
      const m = e.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`));
      return m ? m[1] : '';
    };

    const title = pick('title');
    const publishedAt = pick('published');
    // yt:videoId is namespaced; match manually
    const id = (e.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/) || [,''])[1].trim();
    const url = pickAttr('link', 'href') || (id ? `https://www.youtube.com/watch?v=${id}` : '');
    const thumb = pickAttr('media:thumbnail', 'url') || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');

    return { id, title, url, thumb, publishedAt };
  }).filter(x => x.id && x.url).slice(0, MAX);

  await writeFile('public/yt.json', JSON.stringify({
    updatedAt: new Date().toISOString(),
    items
  }, null, 2));
  console.log(`Wrote ${items.length} items to public/yt.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
