/**
 * @file loadActual
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
import Bluebird from 'bluebird';
import AWS from 'aws-sdk'
import {WARN_NO_SYNC, NO_PROFILE, NO_ENVS, USING_FILE, USING_ENV, USING_META} from "./messages";

const validation = require('./validation')
import {noProfile, noAuthKeys} from "./validation";
/**
 * Checks actual AWS Authentication method
 * @module findActual
 */

/**
 *
 * @param Env
 * @param Logger
 * @returns {*|PromiseLike<T>|Promise<T>}
 */
export const findActual = function({Env, Logger}){
  let Cr = Bluebird.promisifyAll( new AWS.Config() )
  if(!Cr.credentials){
    Logger.warn(WARN_NO_SYNC)
  }
  if(noProfile(Env)){
    Logger.log(NO_PROFILE)
  }

  if(noAuthKeys(Env)){
    Logger.log(NO_ENVS)
  }

  //@ts-ignore
  return Cr.getCredentialsAsync()
    .then((credentials) => {
      if(credentials){
        if(credentials instanceof AWS.SharedIniFileCredentials){
          //@ts-ignore
          Logger.log(USING_FILE(credentials.profile))
        }
        if(credentials instanceof AWS.EnvironmentCredentials){
          Logger.log(USING_ENV)
        }
        if(credentials instanceof AWS.EC2MetadataCredentials){
          Logger.log(USING_META)
        }
      }

      return AWS
    })
}