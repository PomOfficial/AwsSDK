/**
 * @file messages
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project AwsSDK
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */


export const NO_ENVS = '"AWS_ACCESS_KEY_ID" and "AWS_SECRET_ACCESS_KEY" Environment variables not set.'

export const NO_ROLE = `Unable to fetch instance role credentials! 
  If this plugin is running on AWS either set credential ENV vars, 
  or make sure your instance can connect to the EC2 metadata service. `

export const NO_PROFILE = '"AWS_PROFILE" not set, will use "default" if present.'
export const NOT_ARRAY= 'The settings property "awsApis" must be an array of AWS API names.'
export const NO_NAME = 'An object included in the awsApi setting array must include a name property.'
export const NOT_VALID = 'Could not construct an AWS API object from the provided item.'
export const USING_META= 'Using IAM Instance role.'
export const USING_ENV = 'Using IAM role set from enviroment variables.'

export const WARN_NO_SYNC = `
  Syncronous Credentials not found, attempting EC2MetadataCredentials.
  This plugin may timeout if an instance role is not available or configured properly.
  If this issue persists and you believe your configuration is correct, please raise the timeout value in Pomegranate.`

export const USING_FILE = profile => `Using profile "${profile}" from AWS credentials file.`
export const NO_MOCK = item => `${item} does not have a corresponding mock file available.`
export const NOT_AVAILABLE = item => `"${item}" is not available to load as an AWS API.`
export const LOADED = item => `"${item}" will be loaded and available at AWS.${item}`
