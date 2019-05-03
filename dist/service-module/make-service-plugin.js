'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var make_service_module_1 = __importDefault(require('./make-service-module'))
var global_models_1 = require('./global-models')
var utils_1 = require('../utils')
var lodash_1 = require('lodash')
var defaults = {
  namespace: '',
  nameStyle: 'short',
  servicePath: '',
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  instanceDefaults: function() {
    return {}
  },
  setupInstance: function(instance) {
    return instance
  } // Default setupInstance returns the instance
}
/**
 * prepare only wraps the makeServicePlugin to provide the globalOptions.
 * @param globalOptions
 */
function prepareMakeServicePlugin(globalOptions) {
  var addModel = global_models_1.prepareAddModel(globalOptions)
  /**
   * (1) Make a Vuex plugin for the provided service.
   * (2a) Attach the vuex store to the BaseModel.
   * (2b) If the Model does not extend the BaseModel, monkey patch it, too
   * (3) Setup real-time events
   */
  return function makeServicePlugin(config) {
    var options = Object.assign({}, defaults, globalOptions, config)
    var Model = options.Model,
      service = options.service,
      namespace = options.namespace,
      nameStyle = options.nameStyle,
      instanceDefaults = options.instanceDefaults,
      setupInstance = options.setupInstance,
      preferUpdate = options.preferUpdate
    if (!service) {
      throw new Error(
        'No service was provided. If you passed one in, check that you have configured a transport plugin on the Feathers Client. Make sure you use the client version of the transport.'
      )
    }
    // Make sure we get a service path from either the service or the options
    var servicePath = options.servicePath
    if (!servicePath) {
      servicePath = utils_1.getServicePath(service, Model)
    }
    options.servicePath = servicePath
    service.FeathersVuexModel = Model
    return function(store) {
      // (1^) Create and register the Vuex module
      options.namespace = utils_1.makeNamespace(
        namespace,
        servicePath,
        nameStyle
      )
      var module = make_service_module_1.default(service, options)
      store.registerModule(options.namespace, module)
      // (2a^) Monkey patch the BaseModel in globalModels
      var BaseModel = lodash_1.get(
        global_models_1.globalModels,
        '[' + options.serverAlias + '].BaseModel'
      )
      if (BaseModel && !BaseModel.store) {
        Object.assign(BaseModel, {
          store: store
        })
      }
      // (2b^) Monkey patch the Model(s) and add to globalModels
      utils_1.assignIfNotPresent(Model, {
        store: store,
        namespace: options.namespace,
        servicePath: servicePath,
        instanceDefaults: instanceDefaults,
        setupInstance: setupInstance,
        preferUpdate: preferUpdate
      })
      addModel(Model)
      // (3^) Setup real-time events
      if (options.enableEvents) {
        // Listen to socket events when available.
        service.on('created', function(item) {
          return store.commit(options.namespace + '/addItem', item)
        })
        service.on('updated', function(item) {
          return store.commit(options.namespace + '/updateItem', item)
        })
        service.on('patched', function(item) {
          return store.commit(options.namespace + '/updateItem', item)
        })
        service.on('removed', function(item) {
          return store.commit(options.namespace + '/removeItem', item)
        })
      }
    }
  }
}
exports.default = prepareMakeServicePlugin
//# sourceMappingURL=make-service-plugin.js.map
