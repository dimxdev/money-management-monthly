// Evaluasi ekspresi dengan precedence: "50000+25000*2-10000/5" → 97000
export function evalAmount(str) {
  if (str === '' || str == null) return NaN
  const cleaned = str.toString().replace(/\s/g, '').replace(/,/g, '')
  if (!cleaned) return NaN
  if (!/^[0-9][0-9+\-*/]*$/.test(cleaned)) return NaN
  const tokens = cleaned.match(/[0-9]+|[+\-*/]/g)
  if (!tokens) return NaN

  // Pass 1: evaluasi * dan / langsung ke nums
  const nums = [Number(tokens[0])]
  const ops = []
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const n = Number(tokens[i + 1])
    if (op === '*') {
      nums[nums.length - 1] *= n
    } else if (op === '/') {
      if (n === 0) return NaN
      nums[nums.length - 1] /= n
    } else {
      nums.push(n)
      ops.push(op)
    }
  }

  // Pass 2: evaluasi + dan -
  return ops.reduce((acc, op, i) => op === '+' ? acc + nums[i + 1] : acc - nums[i + 1], nums[0])
}
