/**
 * Fetches latest YouTube videos from a channel using the YouTube Data API v3.
 * @param {string} apiKey - YouTube Data API key
 * @param {string} channelId - YouTube channel ID (not username)
 * @param {number} [limit=6] - Max number of videos to return
 * @returns {Promise<Array<{url: string, title: string}>>}
 */
export async function fetchYoutubeVideos(apiKey, channelId, limit = 6) {
  const endpoint = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${limit}&type=video`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Failed to fetch YouTube videos');
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map(item => ({
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
    }));
  } catch (e) {
    console.error('YouTube fetch error:', e);
    return [];
  }
}

/**
 * (Optional fallback) Fetches latest YouTube videos from a channel's RSS feed.
 * @param {string} channelId - YouTube channel ID
 * @param {number} [limit=6] - Max number of videos to return
 * @returns {Promise<Array<{url: string, title: string}>>}
 */
export async function fetchYoutubeVideosRSS(channelId, limit = 6) {
  const endpoint = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Failed to fetch YouTube RSS');
    const text = await res.text();
    const parser = new window.DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const entries = Array.from(xml.querySelectorAll('entry')).slice(0, limit);
    return entries.map(entry => ({
      url: entry.querySelector('link').getAttribute('href'),
      title: entry.querySelector('title').textContent,
    }));
  } catch (e) {
    console.error('YouTube RSS fetch error:', e);
    return [];
  }
}
