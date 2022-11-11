import { format } from 'winston'

import { LogFormater } from '../../types/logger'

export const transformers: LogFormater = {
  addCustomKeys: (appName) =>
    format((info) => {
      info.app_datetime = info.timestamp
      info.severity_level = info.level
      info.app_message = info.message
      info.app_name = appName

      return info
    }),
  keyToUpperCase: (key) =>
    format((info) => {
      info.level = info[key].toUpperCase()

      return info
    }),
  removeKeys: (keys) =>
    format((info) => {
      keys.forEach((key) => {
        info[key] = undefined
      })

      return info
    }),
}
