'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var fast_copy_1 = __importDefault(require('fast-copy'))
function makeServiceActions(service) {
  var serviceActions = {
    find: function(_a, params) {
      var commit = _a.commit,
        dispatch = _a.dispatch
      params = params || {}
      params = fast_copy_1.default(params)
      commit('setPending', 'find')
      return service
        .find(params)
        .then(function(response) {
          return dispatch('handleFindResponse', {
            params: params,
            response: response
          })
        })
        .catch(function(error) {
          return dispatch('handleFindError', { params: params, error: error })
        })
    },
    // Two query syntaxes are supported, since actions only receive one argument.
    //   1. Just pass the id: `get(1)`
    //   2. Pass arguments as an array: `get([null, params])`
    get: function(_a, args) {
      var state = _a.state,
        getters = _a.getters,
        commit = _a.commit,
        dispatch = _a.dispatch
      var idField = state.idField
      var id
      var params
      var skipRequestIfExists
      if (Array.isArray(args)) {
        id = args[0]
        params = args[1] || {}
      } else {
        id = args
        params = {}
      }
      params = fast_copy_1.default(params)
      if ('skipRequestIfExists' in params) {
        skipRequestIfExists = params.skipRequestIfExists
        delete params.skipRequestIfExists
      } else {
        skipRequestIfExists = state.skipRequestIfExists
      }
      function getFromRemote() {
        commit('setPending', 'get')
        return service
          .get(id, params)
          .then(function(item) {
            var id = item[idField]
            dispatch('addOrUpdate', item)
            commit('unsetPending', 'get')
            return state.keyedById[id]
          })
          .catch(function(error) {
            commit('setError', { method: 'get', error: error })
            commit('unsetPending', 'get')
            return Promise.reject(error)
          })
      }
      // If the records is already in store, return it
      var existedItem = getters.get(id, params)
      if (existedItem) {
        if (!skipRequestIfExists) getFromRemote()
        return Promise.resolve(existedItem)
      }
      return getFromRemote()
    },
    create: function(_a, dataOrArray) {
      var commit = _a.commit,
        dispatch = _a.dispatch,
        state = _a.state
      var idField = state.idField,
        tempIdField = state.tempIdField
      var data
      var params
      var tempIds
      if (Array.isArray(dataOrArray)) {
        data = dataOrArray[0]
        params = dataOrArray[1]
      } else {
        data = dataOrArray
      }
      params = fast_copy_1.default(params)
      if (Array.isArray(data)) {
        tempIds = data.map(function(i) {
          return i[tempIdField]
        })
      } else {
        tempIds = [data[tempIdField]] // Array of tempIds
      }
      params = params || {}
      commit('setPending', 'create')
      return service
        .create(data, params)
        .then(function(response) {
          if (Array.isArray(response)) {
            dispatch('addOrUpdateList', response)
            response = response.map(function(item) {
              var id = item[idField]
              return state.keyedById[id]
            })
          } else {
            var id = response[idField]
            dispatch('addOrUpdate', response)
            response = state.keyedById[id]
          }
          commit('unsetPending', 'create')
          commit('removeTemps', tempIds)
          return response
        })
        .catch(function(error) {
          commit('setError', { method: 'create', error: error })
          commit('unsetPending', 'create')
          return Promise.reject(error)
        })
    },
    update: function(_a, _b) {
      var commit = _a.commit,
        dispatch = _a.dispatch,
        state = _a.state
      var id = _b[0],
        data = _b[1],
        params = _b[2]
      var idField = state.idField
      commit('setPending', 'update')
      params = fast_copy_1.default(params)
      return service
        .update(id, data, params)
        .then(function(item) {
          var id = item[idField]
          dispatch('addOrUpdate', item)
          commit('unsetPending', 'update')
          return state.keyedById[id]
        })
        .catch(function(error) {
          commit('setError', { method: 'update', error: error })
          commit('unsetPending', 'update')
          return Promise.reject(error)
        })
    },
    patch: function(_a, _b) {
      var commit = _a.commit,
        dispatch = _a.dispatch,
        state = _a.state
      var id = _b[0],
        data = _b[1],
        params = _b[2]
      var idField = state.idField,
        diffOnPatch = state.diffOnPatch
      commit('setPending', 'patch')
      params = fast_copy_1.default(params)
      // This needs to be re-built, since we've removed state.copy
      // if (diffOnPatch) {
      //   let diff = {}
      //   observableDiff(state.keyedById[id], data, function(d) {
      //     if (d.path && d.path.length) {
      //       // Apply all changes except to the id property...
      //       if (d.path[d.path.length - 1] !== idField) {
      //         applyChange(diff, data, d)
      //       }
      //     }
      //   })
      //   data = diff
      // }
      return service
        .patch(id, data, params)
        .then(function(item) {
          var id = item[idField]
          dispatch('addOrUpdate', item)
          commit('unsetPending', 'patch')
          return state.keyedById[id]
        })
        .catch(function(error) {
          commit('setError', { method: 'patch', error: error })
          commit('unsetPending', 'patch')
          return Promise.reject(error)
        })
    },
    remove: function(_a, idOrArray) {
      var commit = _a.commit
      var id
      var params
      if (Array.isArray(idOrArray)) {
        id = idOrArray[0]
        params = idOrArray[1]
      } else {
        id = idOrArray
      }
      params = params || {}
      params = fast_copy_1.default(params)
      commit('setPending', 'remove')
      return service
        .remove(id, params)
        .then(function(item) {
          commit('removeItem', id)
          commit('unsetPending', 'remove')
          return item
        })
        .catch(function(error) {
          commit('setError', { method: 'remove', error: error })
          commit('unsetPending', 'remove')
          return Promise.reject(error)
        })
    }
  }
  var actions = {
    /**
     * Handle the response from the find action.
     *
     * @param payload consists of the following two params
     *   @param params - Remember that these params aren't what was sent to the
     *         Feathers client.  The client modifies the params object.
     *   @param response
     */
    handleFindResponse: function(_a, _b) {
      var state = _a.state,
        commit = _a.commit,
        dispatch = _a.dispatch
      var params = _b.params,
        response = _b.response
      var _c = params.qid,
        qid = _c === void 0 ? 'default' : _c,
        query = params.query
      var idField = state.idField
      dispatch('addOrUpdateList', response)
      commit('unsetPending', 'find')
      var mapItemFromState = function(item) {
        var id = item[idField]
        return state.keyedById[id]
      }
      // The pagination data will be under `pagination.default` or whatever qid is passed.
      response.data &&
        commit('updatePaginationForQuery', {
          qid: qid,
          response: response,
          query: query
        })
      // Swap out the response records for their Vue-observable store versions
      var data = response.data || response
      var mappedFromState = data.map(mapItemFromState)
      if (mappedFromState[0] !== undefined) {
        response.data
          ? (response.data = mappedFromState)
          : (response = mappedFromState)
      }
      dispatch('afterFind', response)
      return response
    },
    handleFindError: function(_a, _b) {
      var commit = _a.commit
      var params = _b.params,
        error = _b.error
      commit('setError', { method: 'find', error: error })
      commit('unsetPending', 'find')
      return Promise.reject(error)
    },
    afterFind: function() {},
    addOrUpdateList: function(_a, response) {
      var state = _a.state,
        commit = _a.commit
      var list = response.data || response
      var isPaginated = response.hasOwnProperty('total')
      var toAdd = []
      var toUpdate = []
      var toRemove = []
      var idField = state.idField,
        autoRemove = state.autoRemove
      list.forEach(function(item) {
        var id = item[idField]
        var existingItem = state.keyedById[id]
        if (id !== null && id !== undefined) {
          existingItem ? toUpdate.push(item) : toAdd.push(item)
        }
      })
      if (!isPaginated && autoRemove) {
        // Find IDs from the state which are not in the list
        state.ids.forEach(function(id) {
          if (
            id !== state.currentId &&
            !list.some(function(item) {
              return item[idField] === id
            })
          ) {
            toRemove.push(state.keyedById[id])
          }
        })
        commit('removeItems', toRemove) // commit removal
      }
      if (service.FeathersVuexModel) {
        toAdd.forEach(function(item, index) {
          toAdd[index] = new service.FeathersVuexModel(item, {
            skipCommit: true
          })
        })
      }
      commit('addItems', toAdd)
      commit('updateItems', toUpdate)
    },
    addOrUpdate: function(_a, item) {
      var state = _a.state,
        commit = _a.commit
      var idField = state.idField
      var id = item[idField]
      var existingItem = state.keyedById[id]
      var isIdOk = id !== null && id !== undefined
      if (
        service.FeathersVuexModel &&
        !existingItem &&
        !item.isFeathersVuexInstance
      ) {
        item = new service.FeathersVuexModel(item)
      }
      if (isIdOk) {
        existingItem ? commit('updateItem', item) : commit('addItem', item)
      }
    }
  }
  Object.keys(serviceActions).map(function(method) {
    if (service[method] && typeof service[method] === 'function') {
      actions[method] = serviceActions[method]
    }
  })
  return actions
}
exports.default = makeServiceActions
//# sourceMappingURL=service-module.actions.js.map
