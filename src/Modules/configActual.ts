/**
 * @file configActual
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import Bluebird from 'bluebird'
import {isArray, isObject} from "lodash/fp";
import {NOT_ARRAY} from "./messages";

export const configActual = ({AWS, options, Logger}) => {
    return Bluebird.try(() => {
      if(!isArray(options.awsApis)){
        throw(new Error(NOT_ARRAY))
      }
      if(!options.awsApis.length){
        Logger.warn('No AWS APIS are configured to load via this plugins settings.')
        Logger.warn('Add needed AWS APIs to the setting "awsApis" in the settings file.')
      }

      if(isObject(options.awsConfig)){
        Logger.log('Updating AWS configuration with provided values.')
        AWS.config.update(options.awsConfig)
      }

      if(isObject(options.apiVersions)){
        Logger.log('Updating AWS api versions with provided values.')
        AWS.config.apiVersions = options.apiVersions
      }

      return AWS
    })
}
