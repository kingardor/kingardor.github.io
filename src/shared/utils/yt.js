export const getYTid = (u) => { try { const url = new URL(u); return url.searchParams.get('v') || url.pathname.split('/').pop() } catch { return '' } }
export const ytThumb = (u) => {
  const id = getYTid(u)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}
