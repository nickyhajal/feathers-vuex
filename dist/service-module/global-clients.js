'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
var lodash_1 = require('lodash')
/**
 * A global object that holds references to all Model Classes in the application.
 */
exports.clients = {
  byAlias: {},
  byHost: {}
}
/**
 * prepareAddModel wraps options in a closure around addModel
 * @param options
 */
function addClient(_a) {
  var client = _a.client,
    serverAlias = _a.serverAlias
  // Save reference to the clients by host uri, if it was available.
  var uri = ''
  if (client.io) {
    uri = lodash_1.get(client, 'io.io.uri')
  }
  if (uri) {
    exports.clients.byHost[uri] = client
  }
  // Save reference to clients by serverAlias.
  exports.clients.byAlias[serverAlias] = client
}
exports.addClient = addClient
function clearClients() {
  function deleteKeys(path) {
    Object.keys(exports.clients[path]).forEach(function(key) {
      delete exports.clients[path][key]
    })
  }
  deleteKeys('byAlias')
  deleteKeys('byHost')
}
exports.clearClients = clearClients
//# sourceMappingURL=global-clients.js.map
