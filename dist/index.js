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
var auth_module_1 = __importDefault(require('./auth-module/auth-module'))
var FeathersVuexFind_1 = __importDefault(require('./FeathersVuexFind'))
exports.FeathersVuexFind = FeathersVuexFind_1.default
var FeathersVuexGet_1 = __importDefault(require('./FeathersVuexGet'))
exports.FeathersVuexGet = FeathersVuexGet_1.default
var make_find_mixin_1 = __importDefault(require('./make-find-mixin'))
exports.makeFindMixin = make_find_mixin_1.default
var make_get_mixin_1 = __importDefault(require('./make-get-mixin'))
exports.makeGetMixin = make_get_mixin_1.default
var global_models_1 = require('./service-module/global-models')
exports.models = global_models_1.globalModels
var global_clients_1 = require('./service-module/global-clients')
exports.clients = global_clients_1.clients
var make_model_1 = __importDefault(require('./service-module/make-model'))
var make_service_plugin_1 = __importDefault(
  require('./service-module/make-service-plugin')
)
var utils_1 = require('./utils')
exports.initAuth = utils_1.initAuth
var vue_plugin_1 = require('./vue-plugin/vue-plugin')
exports.FeathersVuex = vue_plugin_1.FeathersVuex
var defaultOptions = {
  autoRemove: false,
  addOnUpsert: false,
  diffOnPatch: true,
  enableEvents: true,
  idField: 'id',
  tempIdField: '__id',
  debug: false,
  keepCopiesInStore: false,
  nameStyle: 'short',
  paramsForServer: [],
  preferUpdate: false,
  replaceItems: false,
  serverAlias: '',
  skipRequestIfExists: false,
  whitelist: [] // Custom query operators that will be allowed in the find getter.
}
function feathersVuex(feathers, options) {
  if (!feathers || !feathers.service) {
    throw new Error(
      'The first argument to feathersVuex must be a feathers client.'
    )
  }
  options = Object.assign({}, defaultOptions, options)
  if (!options.serverAlias) {
    throw new Error(
      "You must provide a 'serverAlias' in the options to feathersVuex"
    )
  }
  global_clients_1.addClient({
    client: feathers,
    serverAlias: options.serverAlias
  })
  var BaseModel = make_model_1.default(options)
  var makeServicePlugin = make_service_plugin_1.default(options)
  return {
    makeServicePlugin: makeServicePlugin,
    BaseModel: BaseModel,
    makeAuthPlugin: auth_module_1.default(feathers),
    FeathersVuex: vue_plugin_1.FeathersVuex,
    models: global_models_1.globalModels,
    clients: global_clients_1.clients
  }
}
exports.default = feathersVuex
//# sourceMappingURL=index.js.map
