'use strict'
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
Object.defineProperty(exports, '__esModule', { value: true })
var lodash_1 = require('lodash')
function makeDefaultState(servicePath, options) {
  var nonStateProps = [
    'actions',
    'getters',
    'instanceDefaults',
    'Model',
    'mutations',
    'service',
    'setupInstance',
    'state',
    'actions'
  ]
  var state = {
    ids: [],
    keyedById: {},
    copiesById: {},
    tempsById: {},
    pagination: {},
    isFindPending: false,
    isGetPending: false,
    isCreatePending: false,
    isUpdatePending: false,
    isPatchPending: false,
    isRemovePending: false,
    errorOnFind: null,
    errorOnGet: null,
    errorOnCreate: null,
    errorOnUpdate: null,
    errorOnPatch: null,
    errorOnRemove: null
  }
  if (options.Model) {
    // @ts-ignore
    state.modelName = options.Model.name
  }
  var startingState = lodash_1.omit(options, nonStateProps)
  return Object.assign({}, state, startingState)
}
exports.default = makeDefaultState
//# sourceMappingURL=service-module.state.js.map
