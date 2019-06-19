/**
 * @file validation
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import {filter, intersection, has} from 'lodash/fp'

const classProps = (obj) => {
  let p = Object.getOwnPropertyNames(obj.__proto__)
  return filter((o) => o !== 'constructor', p)
}

const findIntersection = (original, pending) => {
  let O = classProps(original)
  let P = classProps(pending)
  return intersection(O, P)
}

export const authKeys = (Env) => (has('AWS_ACCESS_KEY_ID', Env) && has('AWS_SECRET_ACCESS_KEY', Env))

export const profile = (Env) => (has('AWS_PROFILE', Env))

export const noAuthKeys = function (Env) {
  return (!has('AWS_ACCESS_KEY_ID', Env) || !has('AWS_SECRET_ACCESS_KEY', Env))
}

export const noProfile = function (Env) {
  return (!has('AWS_PROFILE', Env))
}

export const noMockDupes = (original, pending) => {
  return findIntersection(original, pending)
}