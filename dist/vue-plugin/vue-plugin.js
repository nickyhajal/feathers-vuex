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
var FeathersVuexFind_1 = __importDefault(require('../FeathersVuexFind'))
var FeathersVuexGet_1 = __importDefault(require('../FeathersVuexGet'))
var global_models_1 = require('../service-module/global-models')
exports.FeathersVuex = {
  install: function(Vue, options) {
    if (options === void 0) {
      options = { components: true }
    }
    var shouldSetupComponents = options.components !== false
    Vue.$FeathersVuex = global_models_1.globalModels
    Vue.prototype.$FeathersVuex = global_models_1.globalModels
    if (shouldSetupComponents) {
      Vue.component('feathers-vuex-find', FeathersVuexFind_1.default)
      Vue.component('feathers-vuex-get', FeathersVuexGet_1.default)
    }
  }
}
//# sourceMappingURL=vue-plugin.js.map
