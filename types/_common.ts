

export type HttpMethod = 
  | 'GET'
  | 'POST'
;

export type PromiseReturnType<T extends () => any> = T extends () => Promise<infer X> ? X : ReturnType<T>;

export type QueryParamType = 
| 'string'    | 'string?'
| 'string[]'  | 'string[]?'
| 'number'    | 'number?'
| 'boolean'   | 'boolean?'
| 'date'      | 'date?'
| 'datetime'  | 'datetime?'
| 'infer'
| readonly string[]

export type QueryParams = {[key: string]: QueryParamType}

export type QueryType<T extends QueryParams> = {
[K in keyof T]:  
  T[K] extends 'string' ? string :
  T[K] extends 'string?' ? string | undefined :
  T[K] extends 'string[]' ? string[] :
  T[K] extends 'string[]?' ? string[] | undefined :
  T[K] extends 'number' ? number :
  T[K] extends 'number?' ? number | undefined :
  T[K] extends 'date' ? number :
  T[K] extends 'date' ? number | undefined :
  T[K] extends 'boolean' ? boolean :
  T[K] extends 'boolean' ? boolean | undefined :
  T[K] extends readonly string[] ? T[K][number] :
  never
}

