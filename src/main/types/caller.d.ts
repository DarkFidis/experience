export interface Caller {
  file: string
  line: number
}

export type GetCaller = (baseDir: string, pos?: number) => Caller
