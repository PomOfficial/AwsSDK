/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import {map, get, isFunction, reduce, each, capitalize, toLower, merge,fromPairs, forOwn} from 'lodash/fp'
import {CreatePlugin} from "@pomegranate/plugin-tools";
import {findActual} from "./Modules/findActual";
import {buildMocks} from "./Modules/buildMocks";
import {configActual} from "./Modules/configActual";
import {AwsAPILoader} from "./Modules/loader";

export const Plugin = CreatePlugin('anything')
  .configuration({
    name: 'AwsSDK',
    injectableParam: 'AWS'
  })
  .variables({
    awsApis:[
      {name: 'cloudWatchLogs', options: {}}
    ],
    awsConfig: {
      region: 'us-east-1'
    },
    apiVersions: {
      S3: '2006-03-01'
    },
    useMocks: false
  })
  .directories(['mocks'])
  .hooks({
    load: async (Injector, Env, PluginVariables, PluginFiles, PluginLogger) => {
      let LoadedAwsAPIs
      if (PluginVariables.useMocks) {
        PluginLogger.warn('Using Mocks')
        let files = await PluginFiles('mocks').fileList({ext: '.js'})
        let mocks = fromPairs(map((file) => {
          let required = require(file.path)
          let fileName = file.getBaseName()

          PluginLogger.log(`Found Mock: ${fileName}.`, 2)

          let M = get('MockAWS', required)
          if (!M) {
            throw new Error(`Mock file ${fileName} does not contain an export on the MockAWS property.`)
          }
          if (!isFunction(M)) {
            throw new Error(`Mock file ${fileName} does not export an injectable function on the MockAWS property.`)
          }

          return [fileName, Injector.inject(M)]
        }, files))
        LoadedAwsAPIs = Promise.resolve(mocks)
      } else {
        let AllAwsAPIS = await findActual({Env, Logger: PluginLogger})
        LoadedAwsAPIs = configActual({AWS: AllAwsAPIS, options: PluginVariables, Logger: PluginLogger})
      }
      // let AllAwsAPIS = await findActual({Env, Logger: PluginLogger})
      // let configuredAWS = await configActual({AWS: AllAwsAPIS, options: PluginVariables, Logger: PluginLogger})

      let Classes = await LoadedAwsAPIs

      let loaded = await AwsAPILoader({
        Classes: Classes,
        APIs: PluginVariables.awsApis,
        Logger: PluginLogger,
        usingMocks: PluginVariables.useMocks
      })


      return loaded
    }
  })