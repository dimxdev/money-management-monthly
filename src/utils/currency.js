export function formatRupiah(amount) {
  const num = Math.floor(Number(amount))
  return 'Rp' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseRupiah(str) {
  return Number(String(str).replace(/[^0-9]/g, ''))
}
