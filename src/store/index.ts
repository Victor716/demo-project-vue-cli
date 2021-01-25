import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // Store can only share the status, cannot store the data after refresh
  state: {
    user: JSON.parse(window.localStorage.getItem('user') || 'null') // current login status
  },
  mutations: {
    // Mutation fn should be used to modify the data in store
    setUser (state, payload) {
      state.user = JSON.parse(payload)
      window.localStorage.setItem('user', payload)
    }
  },
  actions: {
  },
  modules: {
  }
})
