'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var global_models_1 = require('./global-models')
var utils_1 = require('../utils')
var lodash_1 = require('lodash')
var defaultOptions = {
  clone: false,
  commit: true,
  merge: true
}
/**
 *
 * @param options
 */
function makeModel(options) {
  var addModel = global_models_1.prepareAddModel(options)
  var serverAlias = options.serverAlias
  // If this serverAlias already has a BaseModel, nreturn it
  var ExistingBaseModel = lodash_1.get(
    global_models_1.globalModels,
    '[' + serverAlias + '].BaseModel'
  )
  if (ExistingBaseModel) {
    return ExistingBaseModel
  }
  var BaseModel = /** @class */ (function() {
    function BaseModel(data, options) {
      // You have to pass at least an empty object to get a tempId.
      var originalData = data
      options = Object.assign({}, defaultOptions, options)
      var _a = this.constructor,
        store = _a.store,
        models = _a.models,
        instanceDefaults = _a.instanceDefaults,
        idField = _a.idField,
        tempIdField = _a.tempIdField,
        setupInstance = _a.setupInstance,
        getFromStore = _a.getFromStore,
        _commit = _a._commit
      var id = data && (data[idField] || data[tempIdField])
      var hasValidId = id !== null && id !== undefined
      data = data || {}
      // If it already exists, update the original and return
      if (hasValidId && !options.clone) {
        var existingItem = getFromStore.call(this.constructor, id)
        if (existingItem) {
          _commit.call(this.constructor, 'updateItem', data)
          return existingItem
        }
      }
      // Mark as a clone
      if (options.clone) {
        Object.defineProperty(this, '__isClone', {
          value: true,
          enumerable: false
        })
      }
      // Setup instanceDefaults, separate out accessors
      if (instanceDefaults && typeof instanceDefaults === 'function') {
        var defaults = instanceDefaults.call(this, data, {
          models: models,
          store: store
        })
        var _b = utils_1.separateAccessors(defaults),
          accessors = _b.accessors,
          values = _b.values
        utils_1.mergeWithAccessors(this, accessors)
        utils_1.mergeWithAccessors(this, values)
      }
      // Handles Vue objects or regular ones. We can't simply assign or return
      // the data due to how Vue wraps everything into an accessor.
      if (options.merge !== false) {
        utils_1.mergeWithAccessors(
          this,
          setupInstance.call(this, data, { models: models, store: store })
        )
      }
      // Add the item to the store
      // Make sure originalData wasn't an empty object.
      if (!options.clone && options.commit !== false && store && originalData) {
        _commit.call(this.constructor, 'addItem', this)
      }
      return this
    }
    // eslint-disable-next-line
    BaseModel.instanceDefaults = function(data, _a) {
      var models = _a.models,
        store = _a.store
      return data
    }
    // eslint-disable-next-line
    BaseModel.setupInstance = function(data, _a) {
      var models = _a.models,
        store = _a.store
      return data
    }
    BaseModel.getId = function(record) {
      var idField = this.constructor.idField
      return record[idField]
    }
    BaseModel.find = function(params) {
      this._dispatch('find', params)
    }
    BaseModel.findInStore = function(params) {
      return this._getters('find', params)
    }
    BaseModel.get = function(id, params) {
      if (params) {
        return this._dispatch('get', [id, params])
      } else {
        return this._dispatch('get', id)
      }
    }
    BaseModel.getFromStore = function(id, params) {
      if (params) {
        return this._getters('get', [id, params])
      } else {
        return this._getters('get', id)
      }
    }
    /**
     * An alias for store.getters
     * @param method the vuex getter name without the namespace
     * @param payload if provided, the getter will be called as a function
     */
    BaseModel._getters = function(name, payload) {
      var _a = this,
        namespace = _a.namespace,
        store = _a.store
      if (utils_1.checkNamespace(namespace, this)) {
        if (!store.getters.hasOwnProperty(namespace + '/' + name)) {
          throw new Error(
            'Could not find getter named ' + namespace + '/' + name
          )
        }
        if (payload !== undefined) {
          return store.getters[namespace + '/' + name](payload)
        } else {
          return store.getters[namespace + '/' + name]
        }
      }
    }
    /**
     * An alias for store.commit
     * @param method the vuex mutation name without the namespace
     * @param payload the payload for the mutation
     */
    BaseModel._commit = function(method, payload) {
      var _a = this,
        namespace = _a.namespace,
        store = _a.store
      if (utils_1.checkNamespace(namespace, this)) {
        store.commit(namespace + '/' + method, payload)
      }
    }
    /**
     * An alias for store.dispatch
     * @param method the vuex action name without the namespace
     * @param payload the payload for the action
     */
    BaseModel._dispatch = function(method, payload) {
      var _a = this,
        namespace = _a.namespace,
        store = _a.store
      if (utils_1.checkNamespace(namespace, this)) {
        return store.dispatch(namespace + '/' + method, payload)
      }
    }
    /**
     * clone the current record using the `createCopy` mutation
     */
    BaseModel.prototype.clone = function() {
      var _a = this.constructor,
        idField = _a.idField,
        tempIdField = _a.tempIdField
      if (this.__isClone) {
        throw new Error('You cannot clone a copy')
      }
      var id = this[idField] || this[tempIdField]
      return this._clone(id)
    }
    BaseModel.prototype._clone = function(id) {
      var _a = this.constructor,
        store = _a.store,
        copiesById = _a.copiesById,
        namespace = _a.namespace,
        _commit = _a._commit,
        _getters = _a._getters
      var keepCopiesInStore = store.state[namespace].keepCopiesInStore
      _commit.call(this.constructor, 'createCopy', id)
      if (keepCopiesInStore) {
        return _getters.call(this.constructor, 'getCopyById', id)
      } else {
        return copiesById[id]
      }
    }
    /**
     * Reset a clone to match the instance in the store.
     */
    BaseModel.prototype.reset = function() {
      var _a = this.constructor,
        idField = _a.idField,
        tempIdField = _a.tempIdField,
        _commit = _a._commit
      if (this.__isClone) {
        var id = this[idField] || this[tempIdField]
        _commit.call(this.constructor, 'resetCopy', id)
        return this
      } else {
        throw new Error('You cannot reset a non-copy')
      }
    }
    /**
     * Update a store instance to match a clone.
     */
    BaseModel.prototype.commit = function() {
      var _a = this.constructor,
        idField = _a.idField,
        tempIdField = _a.tempIdField,
        _commit = _a._commit,
        _getters = _a._getters
      if (this.__isClone) {
        var id = this[idField] || this[tempIdField]
        _commit.call(this.constructor, 'commitCopy', id)
        return _getters.call(this.constructor, 'get', id)
      } else {
        throw new Error('You cannot call commit on a non-copy')
      }
    }
    /**
     * A shortcut to either call create or patch/update
     * @param params
     */
    BaseModel.prototype.save = function(params) {
      var _a = this.constructor,
        idField = _a.idField,
        preferUpdate = _a.preferUpdate
      var id = this[idField]
      if (id) {
        return preferUpdate ? this.update(params) : this.patch(params)
      } else {
        return this.create(params)
      }
    }
    /**
     * Calls service create with the current instance data
     * @param params
     */
    BaseModel.prototype.create = function(params) {
      var _dispatch = this.constructor._dispatch
      var data = Object.assign({}, this)
      if (data[options.idField] === null) {
        delete data[options.idField]
      }
      return _dispatch.call(this.constructor, 'create', [data, params])
    }
    /**
     * Calls service patch with the current instance data
     * @param params
     */
    BaseModel.prototype.patch = function(params) {
      var _a = this.constructor,
        idField = _a.idField,
        _dispatch = _a._dispatch
      if (!this[idField]) {
        var error = new Error(
          'Missing ' +
            options.idField +
            ' property. You must create the data before you can patch with this data'
        )
        return Promise.reject(error)
      }
      return _dispatch.call(this.constructor, 'patch', [
        this[idField],
        this,
        params
      ])
    }
    /**
     * Calls service update with the current instance data
     * @param params
     */
    BaseModel.prototype.update = function(params) {
      var _a = this.constructor,
        idField = _a.idField,
        _dispatch = _a._dispatch
      if (!this[idField]) {
        var error = new Error(
          'Missing ' +
            options.idField +
            ' property. You must create the data before you can update with this data'
        )
        return Promise.reject(error)
      }
      return _dispatch.call(this.constructor, 'update', [
        this[idField],
        this,
        params
      ])
    }
    /**
     * Calls service remove with the current instance id
     * @param params
     */
    BaseModel.prototype.remove = function(params) {
      var _a = this.constructor,
        idField = _a.idField,
        tempIdField = _a.tempIdField,
        _dispatch = _a._dispatch,
        _commit = _a._commit
      if (this.hasOwnProperty(idField)) {
        if (params && params.eager) {
          _commit.call(this.constructor, 'removeItem', this[idField])
        }
        return _dispatch.call(this.constructor, 'remove', [
          this[idField],
          params
        ])
      } else {
        _commit.call(this.constructor, 'removeTemps', [this[tempIdField]])
        return Promise.resolve(this)
      }
    }
    BaseModel.prototype.toJSON = function() {
      return lodash_1.merge({}, this)
    }
    BaseModel.idField = options.idField
    BaseModel.tempIdField = options.tempIdField
    BaseModel.preferUpdate = options.preferUpdate
    BaseModel.serverAlias = options.serverAlias
    BaseModel.models = global_models_1.globalModels // Can access other Models here
    BaseModel.copiesById = {}
    BaseModel.merge = utils_1.mergeWithAccessors
    return BaseModel
  })()
  addModel(BaseModel)
  return BaseModel
}
exports.default = makeModel
//# sourceMappingURL=make-model.js.map
