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
var service_module_state_1 = __importDefault(require('./service-module.state'))
var service_module_getters_1 = __importDefault(
  require('./service-module.getters')
)
var service_module_mutations_1 = __importDefault(
  require('./service-module.mutations')
)
var service_module_actions_1 = __importDefault(
  require('./service-module.actions')
)
function makeServiceModule(service, options) {
  var defaultState = service_module_state_1.default(
    options.servicePath,
    options
  )
  var defaultGetters = service_module_getters_1.default()
  var defaultMutations = service_module_mutations_1.default()
  var defaultActions = service_module_actions_1.default(service)
  return {
    namespaced: true,
    state: Object.assign(defaultState, options.state),
    getters: Object.assign({}, defaultGetters, options.getters),
    mutations: Object.assign({}, defaultMutations, options.mutations),
    actions: Object.assign({}, defaultActions, options.actions)
  }
}
exports.default = makeServiceModule
//# sourceMappingURL=make-service-module.js.map
