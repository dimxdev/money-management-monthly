// Ubah teks menjadi Title Case (huruf awal tiap kata jadi kapital).
// Contoh: "nasi goreng" -> "Nasi Goreng"
export function toTitleCase(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, ch => ch.toUpperCase())
}
