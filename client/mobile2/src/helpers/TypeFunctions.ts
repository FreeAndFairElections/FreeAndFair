
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach(key => {
    ret[key] = obj[key];
  })
  return ret;
}
export function drop<T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const exclude = new Set(keys)
  const k = Object.keys(obj) as (keyof T)[]
  return pick(obj, ...k.filter(key => {
    return !exclude.has(key as K)  //TODO(Dave): FIXME!
  }))
}