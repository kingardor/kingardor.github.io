/**
 * Fetches public repositories for a given GitHub username and maps them to the PROJECTS structure.
 * @param {string} username - GitHub username (e.g., 'kingardor')
 * @param {number} [limit=6] - Max number of repos to return
 * @returns {Promise<Array<{name: string, url: string, desc: string, tags: string[]}>>}
 */
export async function fetchGithubProjects(username = 'kingardor', limit = 6) {
  const endpoint = `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json', // for topics
      },
    });
    if (!res.ok) throw new Error('Failed to fetch GitHub repos');
    const data = await res.json();
    // Filter out forks and map to PROJECTS structure
    return data
      .filter(repo => !repo.fork)
      .slice(0, limit)
      .map(repo => ({
        name: repo.name,
        url: repo.html_url,
        desc: repo.description || '',
        tags: Array.isArray(repo.topics) ? repo.topics : [],
      }));
  } catch (e) {
    console.error('GitHub fetch error:', e);
    return [];
  }
}
