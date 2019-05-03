'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/**
 * A global object that holds references to all Model Classes in the application.
 */
exports.globalModels = {}
/**
 * prepareAddModel wraps options in a closure around addModel
 * @param options
 */
function prepareAddModel(options) {
  var serverAlias = options.serverAlias
  return function addModel(Model) {
    exports.globalModels[serverAlias] = exports.globalModels[serverAlias] || {
      byServicePath: {}
    }
    if (exports.globalModels[serverAlias][Model.name] && options.debug) {
      console.error(
        'Overwriting Model: models[' + serverAlias + '][' + Model.name + '].'
      )
    }
    exports.globalModels[serverAlias][Model.name] = Model
    exports.globalModels[serverAlias].byServicePath[Model.servicePath] = Model
  }
}
exports.prepareAddModel = prepareAddModel
function clearModels() {
  Object.keys(exports.globalModels).forEach(function(key) {
    var serverAliasObj = exports.globalModels[key]
    Object.keys(serverAliasObj).forEach(function(key) {
      delete exports.globalModels[key]
    })
    delete exports.globalModels[key]
  })
}
exports.clearModels = clearModels
//# sourceMappingURL=global-models.js.map
