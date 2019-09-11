'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
var utils_1 = require('./utils')
function makeFindMixin(options) {
  var _a, _b, _c
  var service = options.service,
    params = options.params,
    fetchQuery = options.fetchQuery,
    _d = options.queryWhen,
    queryWhen =
      _d === void 0
        ? function() {
            return true
          }
        : _d,
    _e = options.local,
    local = _e === void 0 ? false : _e,
    _f = options.qid,
    qid = _f === void 0 ? 'default' : _f,
    items = options.items,
    debug = options.debug
  var name = options.name,
    _g = options.watch,
    watch = _g === void 0 ? [] : _g
  if (typeof watch === 'string') {
    watch = [watch]
  } else if (typeof watch === 'boolean' && watch) {
    watch = ['params']
  }
  if (
    !service ||
    (typeof service !== 'string' && typeof service !== 'function')
  ) {
    throw new Error(
      "The 'service' option is required in the FeathersVuex make-find-mixin and must be a string."
    )
  }
  if (typeof service === 'function' && !name) {
    name = 'service'
  }
  var nameToUse = (name || service).replace('-', '_')
  var prefix = utils_1.getServicePrefix(nameToUse)
  var capitalized = utils_1.getServiceCapitalization(nameToUse)
  var SERVICE_NAME = prefix + 'ServiceName'
  var ITEMS = items || prefix
  if (typeof service === 'function' && name === 'service' && !items) {
    ITEMS = 'items'
  }
  var ITEMS_FETCHED = ITEMS + 'Fetched'
  var IS_FIND_PENDING = 'isFind' + capitalized + 'Pending'
  var PARAMS = prefix + 'Params'
  var FETCH_PARAMS = prefix + 'FetchParams'
  var WATCH = prefix + 'Watch'
  var QUERY_WHEN = prefix + 'QueryWhen'
  var FIND_ACTION = 'find' + capitalized
  var FIND_GETTER = 'find' + capitalized + 'InStore'
  var PAGINATION = prefix + 'PaginationData'
  var LOCAL = prefix + 'Local'
  var QID = prefix + 'Qid'
  var data =
    ((_a = {}),
    (_a[IS_FIND_PENDING] = false),
    (_a[WATCH] = watch),
    (_a[QID] = qid),
    _a)
  var mixin = {
    data: function() {
      return data
    },
    computed:
      ((_b = {}),
      (_b[ITEMS] = function() {
        return this[PARAMS] ? this[FIND_GETTER](this[PARAMS]).data : []
      }),
      (_b[ITEMS_FETCHED] = function() {
        if (this[FETCH_PARAMS]) {
          return this[FIND_GETTER](this[FETCH_PARAMS]).data
        } else {
          return this[ITEMS]
        }
      }),
      (_b[FIND_GETTER] = function() {
        var _this = this
        return function(params) {
          return _this.$store.getters[_this[SERVICE_NAME] + '/find'](params)
        }
      }),
      _b),
    methods:
      ((_c = {}),
      (_c[FIND_ACTION] = function(params) {
        var _this = this
        var paramsToUse
        if (params) {
          paramsToUse = params
        } else if (this[FETCH_PARAMS] || this[FETCH_PARAMS] === null) {
          paramsToUse = this[FETCH_PARAMS]
        } else {
          paramsToUse = this[PARAMS]
        }
        if (!this[LOCAL]) {
          if (
            typeof this[QUERY_WHEN] === 'function'
              ? this[QUERY_WHEN](paramsToUse)
              : this[QUERY_WHEN]
          ) {
            this[IS_FIND_PENDING] = true
            if (paramsToUse) {
              paramsToUse.query = paramsToUse.query || {}
              if (qid) {
                paramsToUse.qid = qid
              }
              return this.$store
                .dispatch(this[SERVICE_NAME] + '/find', paramsToUse)
                .then(function(response) {
                  _this[IS_FIND_PENDING] = false
                  return response
                })
            }
          }
        }
      }),
      _c),
    created: function() {
      var _this = this
      debug &&
        console.log(
          "running 'created' hook in makeFindMixin for service \"" +
            service +
            '" (using name ' +
            nameToUse +
            '")'
        )
      debug && console.log(PARAMS, this[PARAMS])
      debug && console.log(FETCH_PARAMS, this[FETCH_PARAMS])
      var pType = Object.getPrototypeOf(this)
      if (pType.hasOwnProperty(PARAMS) || pType.hasOwnProperty(FETCH_PARAMS)) {
        watch.forEach(function(prop) {
          if (typeof prop !== 'string') {
            throw new Error("Values in the 'watch' array must be strings.")
          }
          prop = prop.replace('params', PARAMS)
          if (pType.hasOwnProperty(FETCH_PARAMS)) {
            if (prop.startsWith(PARAMS)) {
              prop = prop.replace(PARAMS, FETCH_PARAMS)
            }
          }
          _this.$watch(prop, function() {
            return this[FIND_ACTION]()
          })
        })
        return this[FIND_ACTION]()
      } else {
        if (!local) {
          // TODO: Add this message to the logging:
          //       "Pass { local: true } to disable this warning and only do local queries."
          console.log(
            'No "' +
              PARAMS +
              '" or "' +
              FETCH_PARAMS +
              '" attribute was found in the makeFindMixin for the "' +
              service +
              '" service (using name "' +
              nameToUse +
              '").  No queries will be made.'
          )
        }
      }
    }
  }
  if (qid) {
    mixin.computed[PAGINATION] = function() {
      return this.$store.state[this[SERVICE_NAME]].pagination[qid]
    }
  }
  function hasSomeAttribute(vm) {
    var attributes = []
    for (var _i = 1; _i < arguments.length; _i++) {
      attributes[_i - 1] = arguments[_i]
    }
    return attributes.some(function(a) {
      return vm.hasOwnProperty(a) || Object.getPrototypeOf(vm).hasOwnProperty(a)
    })
  }
  function setupAttribute(NAME, value, computedOrMethods, returnTheValue) {
    if (computedOrMethods === void 0) {
      computedOrMethods = 'computed'
    }
    if (returnTheValue === void 0) {
      returnTheValue = false
    }
    if (typeof value === 'boolean') {
      data[NAME] = !!value
    } else if (typeof value === 'string') {
      mixin.computed[NAME] = function() {
        // If the specified computed prop wasn't found, display an error.
        if (returnTheValue) {
        } else {
          if (!hasSomeAttribute(this, value, NAME)) {
            throw new Error(
              'Value for ' +
                NAME +
                " was not found on the component at '" +
                value +
                "'."
            )
          }
        }
        return returnTheValue ? value : this[value]
      }
    } else if (typeof value === 'function') {
      mixin[computedOrMethods][NAME] = value
    }
  }
  setupAttribute(SERVICE_NAME, service, 'computed', true)
  setupAttribute(PARAMS, params)
  setupAttribute(FETCH_PARAMS, fetchQuery)
  setupAttribute(QUERY_WHEN, queryWhen, 'methods')
  setupAttribute(LOCAL, local)
  return mixin
}
exports.default = makeFindMixin
//# sourceMappingURL=make-find-mixin.js.map
