export default function parseSearch(s) {
  return Object.fromEntries(new URLSearchParams(s).entries())
}
