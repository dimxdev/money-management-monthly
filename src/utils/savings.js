// Kategori Tabungan otomatis — menampung sisa uang yang belum dialokasikan.
export const SAVINGS_ID = 'cat_savings'
export const SAVINGS_NAME = 'Tabungan'

export function isSavings(cat) {
  return cat?.id === SAVINGS_ID
}

// Buat objek kategori tabungan dengan budget = sisa (tidak pernah negatif).
export function makeSavingsCategory(remainder) {
  return { id: SAVINGS_ID, name: SAVINGS_NAME, budget: Math.max(0, Math.round(remainder)) }
}
