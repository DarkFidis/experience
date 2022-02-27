import { relative } from 'path'
import * as stackback from 'stackback'
import { GetCaller } from "../types/caller";


const getCaller: GetCaller = (baseDir, pos = 0) => {
  const e = new Error()
  const stack = stackback(e)
  const index = Math.min(stack.length - 1, pos + 1)
  const s = stack[index]
  return {
    file: s && relative(baseDir, s.getFileName()),
    line: s && s.getLineNumber(),
  }
}

export { getCaller }
