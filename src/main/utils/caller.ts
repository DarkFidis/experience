import { relative } from 'path'
import * as stackback from 'stackback'

import { GetCaller } from '../types/caller'

const getCaller: GetCaller = (baseDir, pos = 0) => {
  const e = new Error()
  const stack = stackback(e)
  const index = Math.min(stack.length - 1, pos + 1)
  const s = stack[index]
  return {
    /*
      Since stackback package has no type-definitions ...
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    file: s && relative(baseDir, s.getFileName()),
    line: s && s.getLineNumber(),
  }
}

export { getCaller }
