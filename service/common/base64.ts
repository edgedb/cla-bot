

export function encode(value: string): string {
  return Buffer.from(value).toString("base64")
}

export function decode(value: string): string {
  return Buffer.from(value, "base64").toString("utf8")
}


export function encodeToObject<T>(value: T): string {
  return encode(JSON.stringify(value));
}

export function decodeToObject<T>(value: string): T {
  const json = decode(value);
  return JSON.parse(json) as T;
}

//
// interface Foo {
//   pr: string
//   userId: string
// }
//
//
// const x = decodeToObject<Foo>('eyJwciI6IjY2NiIsInVzZXJJZCI6IsO4w7jFgSJ9');
//
//
// // export { encode, decode }
