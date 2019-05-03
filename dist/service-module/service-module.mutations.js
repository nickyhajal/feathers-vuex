'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
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
var vue_1 = __importDefault(require('vue'))
var serialize_error_1 = __importDefault(require('serialize-error'))
var utils_1 = require('../utils')
var global_models_1 = require('./global-models')
var lodash_1 = require('lodash')
function makeServiceMutations() {
  function addItems(state, items) {
    var serverAlias = state.serverAlias,
      idField = state.idField,
      tempIdField = state.tempIdField,
      modelName = state.modelName
    var Model = lodash_1.get(
      global_models_1.globalModels,
      '[' + serverAlias + '][' + modelName + ']'
    )
    var BaseModel = lodash_1.get(
      global_models_1.globalModels,
      '[' + state.serverAlias + '].BaseModel'
    )
    var newKeyedById = __assign({}, state.keyedById)
    var newTempsById = __assign({}, state.tempsById)
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
      var item = items_1[_i]
      var id = item[idField]
      var isTemp = id === null || id === undefined
      // If the response contains a real id, remove isTemp
      if (id) {
        delete item.__isTemp
      }
      if (
        Model &&
        typeof BaseModel === 'object' &&
        !(item instanceof BaseModel) &&
        !(item instanceof Model)
      ) {
        item = new Model(item)
      }
      if (isTemp) {
        if (!item[tempIdField]) {
          var tempId = utils_1.assignTempId(state, item)
        }
        item.__isTemp = true
        newTempsById[tempId] = item
      } else {
        // Only add the id if it's not already in the `ids` list.
        if (!state.ids.includes(id)) {
          state.ids.push(id)
        }
        newKeyedById[id] = item
      }
    }
    state.keyedById = newKeyedById
    state.tempsById = newTempsById
  }
  function updateItems(state, items) {
    var idField = state.idField,
      replaceItems = state.replaceItems,
      addOnUpsert = state.addOnUpsert,
      serverAlias = state.serverAlias,
      modelName = state.modelName
    var Model = lodash_1.get(
      global_models_1.globalModels,
      '[' + serverAlias + '][' + modelName + ']'
    )
    for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
      var item = items_2[_i]
      var id = item[idField]
      // If the response contains a real id, remove isTemp
      if (id) {
        delete item.__isTemp
      }
      // Update the record
      if (id !== null && id !== undefined) {
        if (state.ids.includes(id)) {
          // Completely replace the item
          if (replaceItems) {
            if (Model && !item.isFeathersVuexInstance) {
              item = new Model(item)
            }
            vue_1.default.set(state.keyedById, id, item)
            // Merge in changes
          } else {
            utils_1.updateOriginal(item, state.keyedById[id])
          }
          // if addOnUpsert then add the record into the state, else discard it.
        } else if (addOnUpsert) {
          state.ids.push(id)
          vue_1.default.set(state.keyedById, id, item)
        }
        continue
      }
    }
  }
  return {
    addItem: function(state, item) {
      addItems(state, [item])
    },
    addItems: addItems,
    updateItem: function(state, item) {
      updateItems(state, [item])
    },
    updateItems: function(state, items) {
      if (!Array.isArray(items)) {
        throw new Error(
          'You must provide an array to the `updateItems` mutation.'
        )
      }
      updateItems(state, items)
    },
    removeItem: function(state, item) {
      var idField = state.idField
      var idToBeRemoved = lodash_1.isObject(item) ? item[idField] : item
      var isIdOk = idToBeRemoved !== null && idToBeRemoved !== undefined
      var index = state.ids.findIndex(function(i) {
        return i === idToBeRemoved
      })
      if (isIdOk && index !== null && index !== undefined) {
        vue_1.default.delete(state.ids, index)
        vue_1.default.delete(state.keyedById, idToBeRemoved)
      }
    },
    // Removes temp records
    removeTemps: function(state, tempIds) {
      state.tempsById = lodash_1.omit(state.tempsById, tempIds)
    },
    removeItems: function(state, items) {
      var idField = state.idField
      if (!Array.isArray(items)) {
        throw new Error(
          'You must provide an array to the `removeItems` mutation.'
        )
      }
      // Make sure we have an array of ids. Assume all are the same.
      var containsObjects = items[0] && lodash_1.isObject(items[0])
      var idsToRemove = containsObjects
        ? items.map(function(item) {
            return item[idField]
          })
        : items
      var mapOfIdsToRemove = idsToRemove.reduce(function(map, id) {
        map[id] = true
        return map
      }, {})
      idsToRemove.forEach(function(id) {
        vue_1.default.delete(state.keyedById, id)
      })
      // Get indexes to remove from the ids array.
      var mapOfIndexesToRemove = state.ids.reduce(function(map, id, index) {
        if (mapOfIdsToRemove[id]) {
          map[index] = true
        }
        return map
      }, {})
      // Remove highest indexes first, so the indexes don't change
      var indexesInReverseOrder = Object.keys(mapOfIndexesToRemove).sort(
        function(a, b) {
          if (a < b) {
            return 1
          } else if (a > b) {
            return -1
          } else {
            return 0
          }
        }
      )
      indexesInReverseOrder.forEach(function(indexInIdsArray) {
        vue_1.default.delete(state.ids, indexInIdsArray)
      })
    },
    clearAll: function(state) {
      state.ids = []
      state.keyedById = {}
    },
    // Creates a copy of the record with the passed-in id, stores it in copiesById
    createCopy: function(state, id) {
      var servicePath = state.servicePath,
        keepCopiesInStore = state.keepCopiesInStore,
        serverAlias = state.serverAlias
      var current = state.keyedById[id] || state.tempsById[id]
      var Model = lodash_1.get(
        global_models_1.globalModels,
        '[' + serverAlias + '].byServicePath[' + servicePath + ']'
      )
      if (Model) {
        var model = new Model(current, { clone: true })
      } else {
        var copyData = utils_1.mergeWithAccessors({}, current)
      }
      var item = model || copyData
      if (keepCopiesInStore) {
        state.copiesById[id] = item
      } else {
        // Since it won't be added to the store, make it a Vue object
        if (!item.hasOwnProperty('__ob__')) {
          item = vue_1.default.observable(item)
        }
        Model.copiesById[id] = item
      }
    },
    // Resets the copy to match the original record, locally
    resetCopy: function(state, id) {
      var servicePath = state.servicePath,
        keepCopiesInStore = state.keepCopiesInStore
      var Model = lodash_1.get(
        global_models_1.globalModels,
        '[' + state.serverAlias + '].byServicePath[' + servicePath + ']'
      )
      var copy = keepCopiesInStore
        ? state.copiesById[id]
        : Model && lodash_1.get(Model, 'copiesById[' + id + ']')
      if (copy) {
        var original = copy.__isTemp ? state.tempsById[id] : state.keyedById[id]
        utils_1.mergeWithAccessors(copy, original)
      }
    },
    // Deep assigns copy to original record, locally
    commitCopy: function(state, id) {
      var servicePath = state.servicePath,
        keepCopiesInStore = state.keepCopiesInStore
      var Model = lodash_1.get(
        global_models_1.globalModels,
        '[' + state.serverAlias + '].byServicePath[' + servicePath + ']'
      )
      var copy = keepCopiesInStore
        ? state.copiesById[id]
        : Model && lodash_1.get(Model, 'copiesById[' + id + ']')
      if (copy) {
        var original = copy.__isTemp ? state.tempsById[id] : state.keyedById[id]
        utils_1.mergeWithAccessors(original, copy)
      }
    },
    // Removes the copy from copiesById
    clearCopy: function(state, id) {
      var newCopiesById = Object.assign({}, state.copiesById)
      delete newCopiesById[id]
      state.copiesById = newCopiesById
    },
    /**
     * Stores pagination data on state.pagination based on the query identifier
     * (qid) The qid must be manually assigned to `params.qid`
     */
    updatePaginationForQuery: function(state, _a) {
      var qid = _a.qid,
        response = _a.response,
        query = _a.query
      var data = response.data,
        limit = response.limit,
        skip = response.skip,
        total = response.total
      var idField = state.idField
      var ids = data.map(function(item) {
        return item[idField]
      })
      var queriedAt = new Date().getTime()
      vue_1.default.set(state.pagination, qid, {
        limit: limit,
        skip: skip,
        total: total,
        ids: ids,
        query: query,
        queriedAt: queriedAt
      })
    },
    setPending: function(state, method) {
      var uppercaseMethod = method.charAt(0).toUpperCase() + method.slice(1)
      state['is' + uppercaseMethod + 'Pending'] = true
    },
    unsetPending: function(state, method) {
      var uppercaseMethod = method.charAt(0).toUpperCase() + method.slice(1)
      state['is' + uppercaseMethod + 'Pending'] = false
    },
    setError: function(state, payload) {
      var method = payload.method,
        error = payload.error
      var uppercaseMethod = method.charAt(0).toUpperCase() + method.slice(1)
      state['errorOn' + uppercaseMethod] = Object.assign(
        {},
        serialize_error_1.default(error)
      )
    },
    clearError: function(state, method) {
      var uppercaseMethod = method.charAt(0).toUpperCase() + method.slice(1)
      state['errorOn' + uppercaseMethod] = null
    }
  }
}
exports.default = makeServiceMutations
//# sourceMappingURL=service-module.mutations.js.map
