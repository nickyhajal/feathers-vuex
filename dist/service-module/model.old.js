'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var utils_1 = require('../utils')
var defaults = {
  idField: 'id',
  preferUpdate: false,
  instanceDefaults: {}
}
function default_1(options) {
  options = Object.assign({}, defaults, options)
  var idField = options.idField,
    preferUpdate = options.preferUpdate,
    globalModels = options.globalModels,
    modelName = options.modelName
  var instanceDefaults = options.instanceDefaults || {}
  var FeathersVuexModel = /** @class */ (function() {
    function FeathersVuexModel(data, options) {
      var _this = this
      if (data === void 0) {
        data = {}
      }
      if (options === void 0) {
        options = {}
      }
      var _a = this.constructor,
        store = _a.store,
        namespace = _a.namespace
      var existingItem =
        data[idField] && FeathersVuexModel.getFromStore(data[idField])
      var _relationships = {}
      var fnDefaults
      if (options.isClone) {
        Object.defineProperty(this, 'isClone', { value: true })
      }
      Object.defineProperty(this, 'isFeathersVuexInstance', { value: true })
      if (existingItem && !options.isClone) {
        if (!data.isFeathersVuexInstance) {
          utils_1.updateOriginal(data, existingItem)
        }
        return existingItem
      }
      // Don't modify the original instanceDefaults. Clone it with accessors intact
      if (typeof instanceDefaults === 'function') {
        fnDefaults = instanceDefaults(data, {
          store: store,
          Model: this.constructor,
          Models: globalModels
        })
      }
      var _instanceDefaults = utils_1.cloneWithAccessors(
        fnDefaults || instanceDefaults
      )
      Object.keys(_instanceDefaults).forEach(function(key) {
        // Prevent getters and setters from firing before the instance is constructed
        var desc = Object.getOwnPropertyDescriptor(_instanceDefaults, key)
        if (desc.get || desc.set || typeof desc.value === 'function') {
          return
        }
        // If the default value for an instanceDefault matches a model name...
        var modelName = _instanceDefaults[key]
        if (globalModels.hasOwnProperty(modelName)) {
          // Store the relationship
          _relationships[key] = globalModels[modelName]
          // Reset the instance default for this prop to null
          _instanceDefaults[key] = null
        }
        // Or if the value is a Date
        if (modelName === Date) {
          // Store the relationships
          _relationships[key] = Date
          // Reset the instance default for this prop to null
          _instanceDefaults[key] = null
        }
      })
      // Check the relationships to instantiate.
      Object.keys(_relationships).forEach(function(prop) {
        var Model = _relationships[prop]
        var related = data[prop]
        if (related) {
          // Handle arrays
          if (Array.isArray(related)) {
            related.forEach(function(item, index) {
              if (Model === Date) {
                related[index] = new Date(item)
              } else {
                var _a = createRelatedInstance({
                    item: item,
                    Model: Model,
                    idField: idField,
                    store: store
                  }),
                  model = _a.model,
                  storedModel = _a.storedModel
                // Replace the original array index with a reference to the model
                related[index] = storedModel || model
              }
            })
            // Handle objects
          } else {
            if (Model === Date) {
              data[prop] = new Date(data[prop])
            } else {
              var _a = createRelatedInstance({
                  item: related,
                  Model: Model,
                  idField: idField,
                  store: store
                }),
                model = _a.model,
                storedModel = _a.storedModel
              // Replace the data's prop value with a reference to the model
              data[prop] = storedModel || model
            }
          }
        }
      })
      // Copy all instanceDefaults, including accessors
      var props = Object.getOwnPropertyNames(_instanceDefaults)
      props.forEach(function(key) {
        var desc = Object.getOwnPropertyDescriptor(_instanceDefaults, key)
        Object.defineProperty(_this, key, desc)
      })
      // Copy over all instance data
      var dataProps = Object.getOwnPropertyNames(data)
      dataProps.forEach(function(key) {
        var desc = Object.getOwnPropertyDescriptor(data, key)
        var propertyExists = _this.hasOwnProperty(key)
        var isComputed =
          desc.get || desc.set || typeof desc.value === 'function'
        if (propertyExists && isComputed) {
          return
        }
        Object.defineProperty(_this, key, desc)
      })
      // If this record has an id, addOrUpdate the store
      if (data[idField] && !options.isClone && !options.skipCommit) {
        store.dispatch(namespace + '/addOrUpdate', this)
      }
    }
    FeathersVuexModel.prototype.clone = function() {
      if (this.isClone) {
        throw new Error('You cannot clone a copy')
      }
      var id = this[idField]
      return this._clone(id)
    }
    FeathersVuexModel.prototype.reset = function() {
      if (this.isClone) {
        var id = this[idField]
        this._reset(id)
      } else {
        throw new Error('You cannot reset a non-copy')
      }
    }
    FeathersVuexModel.prototype.commit = function() {
      if (this.isClone) {
        var id = this[idField]
        return this._commit(id)
      } else {
        throw new Error('You cannnot call commit on a non-copy')
      }
    }
    FeathersVuexModel.prototype.save = function(params) {
      if (this[idField]) {
        return preferUpdate ? this.update(params) : this.patch(params)
      } else {
        return this.create(params)
      }
    }
    FeathersVuexModel.prototype.create = function(params) {
      var data = Object.assign({}, this)
      if (data[idField] === null) {
        delete data[idField]
      }
      return this._create(data, params)
    }
    FeathersVuexModel.prototype.patch = function(params) {
      if (!this[idField]) {
        var error = new Error(
          'Missing ' +
            idField +
            ' property. You must create the data before you can patch with this data',
          this
        )
        return Promise.reject(error)
      }
      return this._patch(this[idField], this, params)
    }
    FeathersVuexModel.prototype.update = function(params) {
      if (!this[idField]) {
        var error = new Error(
          'Missing ' +
            idField +
            ' property. You must create the data before you can update with this data',
          this
        )
        return Promise.reject(error)
      }
      return this._update(this[idField], this, params)
    }
    FeathersVuexModel.prototype.remove = function(params) {
      return this._remove(this[idField], params)
    }
    FeathersVuexModel.prototype.toJSON = function() {
      return merge({}, this)
    }
    return FeathersVuexModel
  })()
  Object.assign(FeathersVuexModel, {
    options: options,
    copiesById: {},
    modelName: modelName
  })
  return FeathersVuexModel
}
exports.default = default_1
//# sourceMappingURL=model.old.js.map
