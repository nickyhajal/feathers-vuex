'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
function setupAuthState(_a) {
  var userService = _a.userService
  var state = {
    accessToken: null,
    payload: null,
    entityIdField: 'userId',
    isAuthenticatePending: false,
    isLogoutPending: false,
    errorOnAuthenticate: null,
    errorOnLogout: null,
    user: null
  }
  // If a userService string was passed, add a user attribute
  if (userService) {
    Object.assign(state, { userService: userService })
  }
  return state
}
exports.default = setupAuthState
//# sourceMappingURL=auth-module.state.js.map
