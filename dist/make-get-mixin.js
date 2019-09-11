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
var inflection_1 = __importDefault(require('inflection'))
function makeFindMixin(options) {
  var _a, _b, _c
  var service = options.service,
    params = options.params,
    fetchParams = options.fetchParams,
    queryWhen = options.queryWhen,
    id = options.id,
    _d = options.local,
    local = _d === void 0 ? false : _d,
    _e = options.qid,
    qid = _e === void 0 ? 'default' : _e,
    item = options.item,
    debug = options.debug
  var name = options.name,
    _f = options.watch,
    watch = _f === void 0 ? [] : _f
  if (typeof watch === 'string') {
    watch = [watch]
  } else if (typeof watch === 'boolean' && watch) {
    watch = ['query']
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
  var singularized = inflection_1.default.singularize(nameToUse)
  var prefix = inflection_1.default.camelize(singularized, true)
  var capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1)
  var SERVICE_NAME = prefix + 'ServiceName'
  var ITEM = item || prefix
  if (typeof service === 'function' && name === 'service' && !item) {
    ITEM = 'item'
  }
  var IS_GET_PENDING = 'isGet' + capitalized + 'Pending'
  var PARAMS = prefix + 'Params'
  var FETCH_PARAMS = prefix + 'FetchParams'
  var WATCH = prefix + 'Watch'
  var QUERY_WHEN = prefix + 'QueryWhen'
  var GET_ACTION = 'get' + capitalized
  var LOCAL = prefix + 'Local'
  var QID = prefix + 'Qid'
  var ID = prefix + 'Id'
  var data =
    ((_a = {}),
    (_a[IS_GET_PENDING] = false),
    (_a[WATCH] = watch),
    (_a[QID] = qid),
    _a)
  var mixin = {
    data: function() {
      return data
    },
    computed:
      ((_b = {}),
      (_b[ITEM] = function() {
        return this[ID]
          ? this.$store.getters[this[SERVICE_NAME] + '/get'](this[ID])
          : null
      }),
      (_b[QUERY_WHEN] = function() {
        return true
      }),
      _b),
    methods:
      ((_c = {}),
      (_c[GET_ACTION] = function(id, params) {
        var _this = this
        var paramsToUse = params || this[FETCH_PARAMS] || this[PARAMS]
        var idToUse = id || this[ID]
        if (!this[LOCAL]) {
          if (this[QUERY_WHEN]) {
            this[IS_GET_PENDING] = true
            if (idToUse) {
              return this.$store
                .dispatch(this[SERVICE_NAME] + '/get', [idToUse, paramsToUse])
                .then(function(response) {
                  _this[IS_GET_PENDING] = false
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
          "running 'created' hook in makeGetMixin for service \"" +
            service +
            '" (using name ' +
            nameToUse +
            '")'
        )
      debug && console.log(ID, this[ID])
      debug && console.log(PARAMS, this[PARAMS])
      debug && console.log(FETCH_PARAMS, this[FETCH_PARAMS])
      var pType = Object.getPrototypeOf(this)
      if (
        pType.hasOwnProperty(ID) ||
        pType.hasOwnProperty(PARAMS) ||
        pType.hasOwnProperty(FETCH_PARAMS)
      ) {
        if (!watch.includes(ID)) {
          watch.push(ID)
        }
        watch.forEach(function(prop) {
          if (typeof prop !== 'string') {
            throw new Error("Values in the 'watch' array must be strings.")
          }
          prop = prop.replace('query', PARAMS)
          if (pType.hasOwnProperty(FETCH_PARAMS)) {
            if (prop.startsWith(PARAMS)) {
              prop.replace(PARAMS, FETCH_PARAMS)
            }
          }
          _this.$watch(prop, _this[GET_ACTION])
        })
        return this[GET_ACTION]()
      } else {
        console.log(
          'No "' +
            ID +
            '", "' +
            PARAMS +
            '" or "' +
            FETCH_PARAMS +
            '" attribute was found in the makeGetMixin for the "' +
            service +
            '" service (using name "' +
            nameToUse +
            '").  No queries will be made.'
        )
      }
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
  setupAttribute(ID, id)
  setupAttribute(PARAMS, params)
  setupAttribute(FETCH_PARAMS, fetchParams)
  setupAttribute(QUERY_WHEN, queryWhen, 'computed')
  setupAttribute(LOCAL, local)
  return mixin
}
exports.default = makeFindMixin
//# sourceMappingURL=make-get-mixin.js.map
