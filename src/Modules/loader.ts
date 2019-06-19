/**
 * @file loader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */


import {isObject, isFunction, isString, has, reduce, merge as mergeRaw} from 'lodash/fp'

//@ts-ignore
const merge = mergeRaw.convert({
  immutable: false
})
import Bluebird from 'bluebird'

import {LOADED, NO_MOCK, NO_NAME, NOT_AVAILABLE, NOT_VALID} from "./messages";
import {noMockDupes} from "./validation";

export const AwsAPILoader = ({Classes,APIs, Logger, usingMocks}) => {
  /**
   * The Main object created by this plugin, containing all of the configured AWS service instances
   * available for use by any downstream plugin.
   * @property {object} AWS_Service_Name - A dynamic property storing the configured AWS API instance.
   * there will be one for every service listed in the options.awsApis array setting.
   */

  let awsApis: any = {}

  /**
   * Determines if an AWS API is available on the injector
   * @method
   * @param {string} serviceString
   * @returns {boolean}
   * @example
   * let AWS = inject('AWS')
   * let hasS3 = AWS.isAvailable('S3') // true
   */
  awsApis.isAvailable = function(serviceString){
    return isObject(this[serviceString])
  }

  /**
   * Allows downstream plugins to add additional AWS service APis to this plugins injectable object.
   * @param {Object} opts
   * @param {string} opts.AwsApi - The AWS API class that will be added.
   * @param {Object} opts.Opts - Options to pass to the requested API Class during instantiation
   * @param {Object} opts.MockClass - Only used when the AwsSDK plugin has "useMocks: true"
   * @returns {boolean} - true if added, false if it already existed.
   * @example
   * let S3Mock = require('some/mock/class.js')
   * let AWS = inject('AWS')
   * AWS.addApiObject({AwsApi: 'S3', MockClass: S3Mock})
   * AWS.S3.listBuckets()
   *   .then(console.log)
   *
   */
  awsApis.addApiObject = function({AwsApi, Opts = {}, MockClass}){
    if(usingMocks){
      let pendingObject = Opts ? new MockClass(Opts) : new MockClass()

      if(this.isAvailable(AwsApi)){
        Logger.warn(`Attempting to merge duplicate mocks for ${AwsApi}`)
        let originalObject = this[AwsApi]
        let duplicateMethods = noMockDupes(originalObject,pendingObject)
        if(duplicateMethods.length){
          Logger.error(`Cannot merge mocks, duplicate methods present: ${duplicateMethods.join(',')}`)
          throw new Error('Attempted to merge duplicate mock objects.')
        }

        Logger.log(`Merged duplicate mocks for ${AwsApi}`)
        merge(originalObject, pendingObject)
        return true
      }

      Logger.log(`Added mocks for ${AwsApi}`)

      this[AwsApi] = Opts ? new MockClass(Opts) :new MockClass()
      return true
    }

    if(this.isAvailable(AwsApi)){
      Logger.warn('Attempted to create an API object that already exists.')
      return false
    }

    Logger.log(`Adding Actual "${AwsApi}" to AWS plugin.`)
    let cls = Classes[AwsApi]
    if(cls){
      // this[AwsApi] = Opts ? Bluebird.promisifyAll(new cls(Opts)) : Bluebird.promisifyAll(new cls())
      this[AwsApi] = Opts ? new cls(Opts) : new cls()
      return true
    }

    Logger.error(`An API object with the name ${AwsApi} could not be found.`)
    throw new Error(`${AwsApi} could not be found.`)
  }


  // Populate the Injectable AWS object.
  reduce((obj,item: {name: string, options: any}) => {
    let prop
    let opts = null


    if(isObject(item)){
      if(!has('name', item)){
        Logger.warn(NO_NAME)
        return obj
      }

      prop = item.name
      if(has('options', item)){
        opts = item.options
      }
    }
    else if(isString(item)){
      prop = item
    }
    else {
      Logger.warn(NOT_VALID)
      return obj
    }

    let cls = Classes[prop]

    if(!cls){throw new Error(NO_MOCK(prop))}

    if(!isFunction(cls)){
      Logger.warn(NOT_AVAILABLE(item))
      return
    }
    Logger.log(LOADED(prop))
    //@ts-ignore
    let classInstance = opts ? new cls(opts) : new cls()
    // @ts-ignore
    // obj[prop] = opts ? Bluebird.promisifyAll(new cls(opts)) : Bluebird.promisifyAll(new cls())
    obj[prop] = classInstance
    return obj

  }, awsApis)(APIs)

  return awsApis
}