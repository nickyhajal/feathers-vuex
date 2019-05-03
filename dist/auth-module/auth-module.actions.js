'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
function makeAuthActions(feathersClient) {
  return {
    authenticate: function(store, data) {
      var commit = store.commit,
        state = store.state,
        dispatch = store.dispatch
      commit('setAuthenticatePending')
      if (state.errorOnAuthenticate) {
        commit('clearAuthenticateError')
      }
      return feathersClient
        .authenticate(data)
        .then(function(response) {
          return dispatch('responseHandler', response)
        })
        .catch(function(error) {
          commit('setAuthenticateError', error)
          commit('unsetAuthenticatePending')
          return Promise.reject(error)
        })
    },
    responseHandler: function(_a, response) {
      var commit = _a.commit,
        state = _a.state,
        dispatch = _a.dispatch
      if (response.accessToken) {
        commit('setAccessToken', response.accessToken)
        // Decode the token and set the payload, but return the response
        return feathersClient.passport
          .verifyJWT(response.accessToken)
          .then(function(payload) {
            commit('setPayload', payload)
            // Populate the user if the userService was provided
            if (
              state.userService &&
              payload.hasOwnProperty(state.entityIdField)
            ) {
              return dispatch(
                'populateUser',
                payload[state.entityIdField]
              ).then(function() {
                commit('unsetAuthenticatePending')
                return response
              })
            } else {
              commit('unsetAuthenticatePending')
            }
            return response
          })
        // If there was not an accessToken in the response, allow the response to pass through to handle two-factor-auth
      } else {
        return response
      }
    },
    populateUser: function(_a, userId) {
      var commit = _a.commit,
        state = _a.state,
        dispatch = _a.dispatch
      return dispatch(state.userService + '/get', userId, { root: true }).then(
        function(user) {
          commit('setUser', user)
          return user
        }
      )
    },
    logout: function(_a) {
      var commit = _a.commit
      commit('setLogoutPending')
      return feathersClient
        .logout()
        .then(function(response) {
          commit('logout')
          commit('unsetLogoutPending')
          return response
        })
        .catch(function(error) {
          return Promise.reject(error)
        })
    }
  }
}
exports.default = makeAuthActions
//# sourceMappingURL=auth-module.actions.js.map
