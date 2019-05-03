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
var serialize_error_1 = __importDefault(require('serialize-error'))
function makeAuthMutations() {
  return {
    setAccessToken: function(state, payload) {
      state.accessToken = payload
    },
    setPayload: function(state, payload) {
      state.payload = payload
    },
    setUser: function(state, payload) {
      state.user = payload
    },
    setAuthenticatePending: function(state) {
      state.isAuthenticatePending = true
    },
    unsetAuthenticatePending: function(state) {
      state.isAuthenticatePending = false
    },
    setLogoutPending: function(state) {
      state.isLogoutPending = true
    },
    unsetLogoutPending: function(state) {
      state.isLogoutPending = false
    },
    setAuthenticateError: function(state, error) {
      state.errorOnAuthenticate = Object.assign(
        {},
        serialize_error_1.default(error)
      )
    },
    clearAuthenticateError: function(state) {
      state.errorOnAuthenticate = null
    },
    setLogoutError: function(state, error) {
      state.errorOnLogout = Object.assign({}, serialize_error_1.default(error))
    },
    clearLogoutError: function(state) {
      state.errorOnLogout = null
    },
    logout: function(state) {
      state.payload = null
      state.accessToken = null
      if (state.user) {
        state.user = null
      }
    }
  }
}
exports.default = makeAuthMutations
//# sourceMappingURL=auth-module.mutations.js.map
