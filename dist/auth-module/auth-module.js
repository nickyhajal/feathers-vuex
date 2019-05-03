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
var auth_module_state_1 = __importDefault(require('./auth-module.state'))
var auth_module_getters_1 = __importDefault(require('./auth-module.getters'))
var auth_module_mutations_1 = __importDefault(
  require('./auth-module.mutations')
)
var auth_module_actions_1 = __importDefault(require('./auth-module.actions'))
var defaults = {
  namespace: 'auth',
  userService: '',
  state: {},
  getters: {},
  mutations: {},
  actions: {} // for custom actions
}
function authPluginInit(feathersClient) {
  if (!feathersClient || !feathersClient.service) {
    throw new Error('You must pass a Feathers Client instance to feathers-vuex')
  }
  return function createAuthModule(options) {
    options = Object.assign({}, defaults, options)
    if (!feathersClient.authenticate) {
      throw new Error(
        'You must register the @feathersjs/authentication-client plugin before using the feathers-vuex auth module'
      )
    }
    var defaultState = auth_module_state_1.default(options)
    var defaultGetters = auth_module_getters_1.default()
    var defaultMutations = auth_module_mutations_1.default()
    var defaultActions = auth_module_actions_1.default(feathersClient)
    return function setupStore(store) {
      var namespace = options.namespace
      store.registerModule(namespace, {
        namespaced: true,
        state: Object.assign({}, defaultState, options.state),
        getters: Object.assign({}, defaultGetters, options.getters),
        mutations: Object.assign({}, defaultMutations, options.mutations),
        actions: Object.assign({}, defaultActions, options.actions)
      })
    }
  }
}
exports.default = authPluginInit
//# sourceMappingURL=auth-module.js.map
