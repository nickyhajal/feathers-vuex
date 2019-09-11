'use strict'
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j]
    return r
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
var sift_1 = __importDefault(require('sift'))
var commons_1 = __importDefault(require('@feathersjs/commons'))
var adapter_commons_1 = __importDefault(require('@feathersjs/adapter-commons'))
var lodash_1 = require('lodash')
var global_models_1 = require('./global-models')
var lodash_2 = require('lodash')
var _ = commons_1.default._
var filterQuery = adapter_commons_1.default.filterQuery,
  sorter = adapter_commons_1.default.sorter,
  select = adapter_commons_1.default.select
var FILTERS = ['$sort', '$limit', '$skip', '$select']
var OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or']
var additionalOperators = ['$elemMatch']
var defaultOps = FILTERS.concat(OPERATORS).concat(additionalOperators)
function makeServiceGetters() {
  return {
    list: function(state) {
      return state.ids.map(function(id) {
        return state.keyedById[id]
      })
    },
    find: function(state) {
      return function(params) {
        params = params || {}
        // Set params.temps to false to not include the tempsById records
        params.temps = params.hasOwnProperty('temps') ? params.temps : true
        var paramsForServer = state.paramsForServer,
          whitelist = state.whitelist
        var q = lodash_1.omit(params.query || {}, paramsForServer)
        var customOperators = Object.keys(q).filter(function(k) {
          return k[0] === '$' && !defaultOps.includes(k)
        })
        var cleanQuery = lodash_1.omit(q, customOperators)
        var _a = filterQuery(cleanQuery, {
            operators: additionalOperators.concat(whitelist)
          }),
          query = _a.query,
          filters = _a.filters
        var values = _.values(state.keyedById)
        if (params.temps) {
          values = values.concat(_.values(state.tempsById))
        }
        values = sift_1.default(query, values)
        var total = values.length
        if (filters.$sort) {
          values.sort(sorter(filters.$sort))
        }
        if (filters.$skip) {
          values = values.slice(filters.$skip)
        }
        if (typeof filters.$limit !== 'undefined') {
          values = values.slice(0, filters.$limit)
        }
        if (filters.$select) {
          values = values.map(function(value) {
            return _.pick.apply(
              _,
              __spreadArrays([value], filters.$select.slice())
            )
          })
        }
        return {
          total: total,
          limit: filters.$limit || 0,
          skip: filters.$skip || 0,
          data: values
        }
      }
    },
    get: function(state) {
      return function(id, params) {
        if (params === void 0) {
          params = {}
        }
        var keyedById = state.keyedById,
          tempsById = state.tempsById,
          idField = state.idField,
          tempIdField = state.tempIdField
        var record = keyedById[id]
          ? select(params, idField)(keyedById[id])
          : undefined
        var tempRecord = tempsById[id]
          ? select(params, tempIdField)(tempsById[id])
          : undefined
        return record || tempRecord
      }
    },
    getCopyById: function(state) {
      return function(id) {
        var servicePath = state.servicePath,
          keepCopiesInStore = state.keepCopiesInStore,
          serverAlias = state.serverAlias
        if (keepCopiesInStore) {
          return state.copiesById[id]
        } else {
          var Model = lodash_2.get(
            global_models_1.globalModels,
            '[' + serverAlias + '].byServicePath[' + servicePath + ']'
          )
          return Model.copiesById[id]
        }
      }
    }
  }
}
exports.default = makeServiceGetters
//# sourceMappingURL=service-module.getters.js.map
