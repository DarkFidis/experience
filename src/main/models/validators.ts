import { matchWith } from '../utils/helper'

const regexp = {
  email:
    '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([a-z]{2,6}(?:\\.[a-z]{2})?)$',
  password:
    '^(?=[\\S]*[0-9])(?=[\\S]*[a-z])(?=[\\S]*[A-Z])(?=[\\S]*[#*!@$%^&(){}:;<>,\\\\.?/~_+\\-=|]).{8,64}$',
}

export const emailValidator = (value: string) => matchWith(value, regexp.email)
export const passwordValidator = (value: string) => matchWith(value, regexp.password)
