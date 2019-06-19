/**
 * @file findMocks
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import {reduce, get} from 'lodash/fp'

export const buildMocks = (fileList, Injector) => {



    return reduce((obj, file) => {
      let mockObj = require(file.path)
      obj[file.getBaseName()] = mockObj
      return obj
    }, {}, fileList)
}