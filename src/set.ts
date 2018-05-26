export function isEmpty(obj: {}) {
  return Object.keys(obj).length === 0
}

export function intersection(a: {}, b: {}) {
  const result = {}
  for(const key in a) {
    if(b[key] !== undefined) {
      result[key] = {left: a[key], right: b[key]}
    }
  }
  return result
}

export function difference(a: {}, b: {}) {
  const result = {}
  for(const key in a) {
    if(b[key] === undefined) {
      result[key] = a[key]
    }
  }
  return result
}
