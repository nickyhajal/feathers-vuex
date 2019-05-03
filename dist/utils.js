'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
var jwt_decode_1 = __importDefault(require('jwt-decode'))
var inflection_1 = __importDefault(require('inflection'))
var vue_1 = __importDefault(require('vue'))
var fast_copy_1 = __importDefault(require('fast-copy'))
var lodash_1 = require('lodash')
var bson_objectid_1 = __importDefault(require('bson-objectid'))
var index_1 = require('./index')
function stripSlashes(location) {
  return lodash_1.trim(location, '/')
}
exports.stripSlashes = stripSlashes
//  From feathers-plus/feathers-hooks-common
function setByDot(obj, path, value, ifDelete) {
  if (ifDelete) {
    console.log(
      'DEPRECATED. Use deleteByDot instead of setByDot(obj,path,value,true). (setByDot)'
    )
  }
  if (path.indexOf('.') === -1) {
    obj[path] = value
    if (value === undefined && ifDelete) {
      delete obj[path]
    }
    return
  }
  var parts = path.split('.')
  var lastIndex = parts.length - 1
  return parts.reduce(function(obj1, part, i) {
    if (i !== lastIndex) {
      if (!obj1.hasOwnProperty(part) || typeof obj1[part] !== 'object') {
        obj1[part] = {}
      }
      return obj1[part]
    }
    obj1[part] = value
    if (value === undefined && ifDelete) {
      delete obj1[part]
    }
    return obj1
  }, obj)
}
exports.setByDot = setByDot
function upperCaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
exports.upperCaseFirst = upperCaseFirst
function getShortName(service) {
  var namespace = stripSlashes(service)
  if (Array.isArray(namespace)) {
    namespace = namespace.slice(-1)
  } else if (namespace.includes('/')) {
    namespace = namespace.slice(namespace.lastIndexOf('/') + 1)
  }
  return namespace
}
exports.getShortName = getShortName
function getNameFromPath(service) {
  return stripSlashes(service)
}
exports.getNameFromPath = getNameFromPath
// Reads and returns the contents of a cookie with the provided name.
function readCookie(cookies, name) {
  if (!cookies) {
    return undefined
  }
  var nameEQ = name + '='
  var ca = cookies.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}
exports.readCookie = readCookie
// Pass a decoded payload and it will return a boolean based on if it hasn't expired.
function payloadIsValid(payload) {
  return payload && payload.exp * 1000 > new Date().getTime()
}
exports.payloadIsValid = payloadIsValid
// from https://github.com/iliakan/detect-node
exports.isNode =
  Object.prototype.toString.call(
    typeof process !== 'undefined' ? process : 0
  ) === '[object process]'
exports.isBrowser = !exports.isNode
var authDefaults = {
  commit: undefined,
  req: undefined,
  moduleName: 'auth',
  cookieName: 'feathers-jwt'
}
function getValidPayloadFromToken(token) {
  if (token) {
    try {
      var payload = jwt_decode_1.default(token)
      return payloadIsValid(payload) ? payload : undefined
    } catch (error) {
      return undefined
    }
  }
  return undefined
}
exports.getValidPayloadFromToken = getValidPayloadFromToken
exports.initAuth = function initAuth(options) {
  var _a = Object.assign({}, authDefaults, options),
    commit = _a.commit,
    req = _a.req,
    moduleName = _a.moduleName,
    cookieName = _a.cookieName,
    feathersClient = _a.feathersClient
  if (typeof commit !== 'function') {
    throw new Error(
      'You must pass the `commit` function in the `initAuth` function options.'
    )
  }
  if (!req) {
    throw new Error(
      'You must pass the `req` object in the `initAuth` function options.'
    )
  }
  var accessToken = readCookie(req.headers.cookie, cookieName)
  var payload = getValidPayloadFromToken(accessToken)
  if (payload) {
    commit(moduleName + '/setAccessToken', accessToken)
    commit(moduleName + '/setPayload', payload)
    if (feathersClient) {
      return feathersClient.passport.setJWT(accessToken).then(function() {
        return payload
      })
    }
  }
  return Promise.resolve(payload)
}
/**
 * Generate a new tempId and mark the record as a temp
 * @param state
 * @param item
 */
function assignTempId(state, item) {
  var debug = state.debug,
    tempIdField = state.tempIdField
  if (debug) {
    console.info('assigning temporary id to item', item)
  }
  var newId = new bson_objectid_1.default().toHexString()
  item[tempIdField] = newId
  return newId
}
exports.assignTempId = assignTempId
// Creates a Model class name from the last part of the servicePath
function getModelName(Model) {
  // If the Model.name has been customized, use it.
  if (Model.modelName) {
    return Model.modelName
  }
  // Otherwise, use an inflection of the last bit of the servicePath
  var parts = Model.servicePath.split('/')
  var name = parts[parts.length - 1]
  name = inflection_1.default.titleize(name)
  name = name.split('-').join('')
  name = inflection_1.default.singularize(name)
  return name
}
exports.getModelName = getModelName
function registerModel(Model, globalModels, apiPrefix, servicePath) {
  var modelName = getModelName(Model)
  var path = apiPrefix ? apiPrefix + '.' + modelName : modelName
  setByDot(globalModels, path, Model)
  globalModels.byServicePath[servicePath] = Model
  return {
    path: path,
    name: modelName
  }
}
exports.registerModel = registerModel
function getServicePrefix(servicePath) {
  var parts = servicePath.split('/')
  var name = parts[parts.length - 1]
  // name = inflection.underscore(name)
  name = name.replace('-', '_')
  name = inflection_1.default.camelize(name, true)
  return name
}
exports.getServicePrefix = getServicePrefix
function getServiceCapitalization(servicePath) {
  var parts = servicePath.split('/')
  var name = parts[parts.length - 1]
  // name = inflection.underscore(name)
  name = name.replace('-', '_')
  name = inflection_1.default.camelize(name)
  return name
}
exports.getServiceCapitalization = getServiceCapitalization
function updateOriginal(newData, existingItem) {
  Object.keys(newData).forEach(function(key) {
    var newProp = newData[key]
    var oldProp = existingItem[key]
    var shouldCopyProp = false
    if (newProp === oldProp) {
      return
    }
    // If the old item doesn't already have this property, update it
    if (!existingItem.hasOwnProperty(key)) {
      shouldCopyProp = true
      // If the old prop is null or undefined, and the new prop is neither
    } else if (
      (oldProp === null || oldProp === undefined) &&
      (newProp !== null && newProp !== undefined)
    ) {
      shouldCopyProp = true
      // If both old and new are arrays
    } else if (Array.isArray(oldProp) && Array.isArray(newProp)) {
      shouldCopyProp = true
    } else if (lodash_1.isObject(oldProp)) {
      shouldCopyProp = true
    } else if (
      oldProp !== newProp &&
      !Array.isArray(oldProp) &&
      !Array.isArray(newProp)
    ) {
      shouldCopyProp = true
    }
    if (shouldCopyProp) {
      if (existingItem.hasOwnProperty(key)) {
        existingItem[key] = newProp
      } else {
        vue_1.default.set(existingItem, key, newProp)
      }
    }
  })
}
exports.updateOriginal = updateOriginal
function makeNamespace(namespace, servicePath, nameStyle) {
  var nameStyles = {
    short: getShortName,
    path: getNameFromPath
  }
  return namespace || nameStyles[nameStyle](servicePath)
}
exports.makeNamespace = makeNamespace
/**
 * Gets the service path or name from the service.  The modelname is provided
 * to allow easier discovery if there's a problem.
 * @param service
 * @param modelName
 */
function getServicePath(service, Model) {
  // @ts-ignore
  if (!service.name && !service.path && !Model.servicePath) {
    throw new Error(
      'Service for model named ' +
        // @ts-ignore
        Model.name +
        " is missing a path or name property. The feathers adapter needs to be updated with a PR to expose this property. You can work around this by adding a static servicePath =  passing a 'servicePath' attribute in the options: makeServicePlugin({servicePath: '/path/to/my/service'})"
    )
  }
  // @ts-ignore
  return service.path || service.name || Model.servicePath
}
exports.getServicePath = getServicePath
function randomString(length) {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
exports.randomString = randomString
function createRelatedInstance(_a) {
  var item = _a.item,
    Model = _a.Model,
    idField = _a.idField,
    store = _a.store
  // Create store instances (if data contains an idField)
  var model = new Model(item)
  var id = model[idField]
  var storedModel = store.state[model.constructor.namespace].keyedById[id]
  return { model: model, storedModel: storedModel }
}
exports.createRelatedInstance = createRelatedInstance
function isBaseModelInstance(item) {
  var baseModels = Object.keys(index_1.models).map(function(alias) {
    return index_1.models[alias].BaseModel
  })
  return !!baseModels.find(function(BaseModel) {
    return BaseModel && item instanceof BaseModel
  })
}
exports.isBaseModelInstance = isBaseModelInstance
function mergeWithAccessors(dest, source, blacklist) {
  if (blacklist === void 0) {
    blacklist = ['__isClone', '__ob__']
  }
  var sourceProps = Object.getOwnPropertyNames(source)
  var destProps = Object.getOwnPropertyNames(dest)
  var sourceIsVueObservable = sourceProps.includes('__ob__')
  var destIsVueObservable = destProps.includes('__ob__')
  sourceProps.forEach(function(key) {
    var sourceDesc = Object.getOwnPropertyDescriptor(source, key)
    var destDesc = Object.getOwnPropertyDescriptor(dest, key)
    // if (Array.isArray(source[key]) && source[key].find(i => i.__ob__)) {
    //   sourceIsVueObservable = true
    // }
    // if (Array.isArray(dest[key]) && dest[key].find(i => i.__ob__)) {
    //   destIsVueObservable = true
    // }
    // This might have to be uncommented, but we'll try it this way, for now.
    // if (!sourceDesc.enumerable) {
    //   return
    // }
    if (blacklist.includes(key)) {
      return
    }
    // If we're dealing with a Vue Observable, just assign the values.
    if (destIsVueObservable || sourceIsVueObservable) {
      if (lodash_1.isObject(source[key])) {
        dest[key] = fast_copy_1.default(source[key])
      } else {
        dest[key] = source[key]
      }
      return
    }
    // Handle defining accessors
    if (
      typeof sourceDesc.get === 'function' ||
      typeof sourceDesc.set === 'function'
    ) {
      Object.defineProperty(dest, key, sourceDesc)
      return
    }
    // Do not attempt to overwrite a getter in the dest object
    if (destDesc && typeof destDesc.get === 'function') {
      return
    }
    // Assign values
    // Do not allow sharing of deeply-nested objects between instances
    // Potentially breaks accessors on nested data. Needs recursion if this is an issue
    if (
      lodash_1.isObject(sourceDesc.value) &&
      !isBaseModelInstance(sourceDesc.value)
    ) {
      var value = fast_copy_1.default(sourceDesc.value)
    }
    dest[key] = value || sourceDesc.value
  })
  return dest
}
exports.mergeWithAccessors = mergeWithAccessors
function cloneWithAccessors(obj) {
  var clone = {}
  var props = Object.getOwnPropertyNames(obj)
  props.forEach(function(key) {
    var desc = Object.getOwnPropertyDescriptor(obj, key)
    // Do not allow sharing of deeply-nested objects between instances
    if (lodash_1.isPlainObject(desc.value)) {
      desc.value = fast_copy_1.default(desc.value)
    }
    Object.defineProperty(clone, key, desc)
  })
  return clone
}
exports.cloneWithAccessors = cloneWithAccessors
function separateAccessors(props) {
  return Object.keys(props).reduce(
    function(_a, key) {
      var accessors = _a.accessors,
        values = _a.values
      var desc = Object.getOwnPropertyDescriptor(props, key)
      if (typeof desc.get === 'function' || typeof desc.set === 'function') {
        Object.defineProperty(accessors, key, desc)
      } else {
        Object.defineProperty(values, key, desc)
      }
      return { accessors: accessors, values: values }
    },
    { accessors: {}, values: {} }
  )
}
exports.separateAccessors = separateAccessors
function checkNamespace(namespace, item) {
  if (!namespace) {
    console.error(
      'A `namespace` was not available on the Model for this item:',
      item,
      'this can be caused by not passing the Model into the makeServicePlugin function'
    )
  }
  return namespace !== null && namespace !== undefined
}
exports.checkNamespace = checkNamespace
function assignIfNotPresent(Model, props) {
  for (var key in props) {
    if (!Model.hasOwnProperty(key)) {
      Model[key] = props[key]
    }
  }
}
exports.assignIfNotPresent = assignIfNotPresent
//# sourceMappingURL=utils.js.map
