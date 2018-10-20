'use strict'

/* eslint-disable no-new */

import Vue from 'vue'
import VueResource from 'vue-resource'
import Velocity from 'velocity'
import store from './store'

// ====================================
// Load Vue Components
// ====================================

// ====================================
// Initialize Vue Modules
// ====================================

Vue.use(VueResource)

// ====================================
// Register Vue Components
// ====================================

// ====================================
// Bootstrap Vue
// ====================================

document.addEventListener('DOMContentLoaded', ev => {
  window.requarks = new Vue({
    data: {
      mobileNavShown: false
    },
    components: {},
    store,
    el: '#root',
    methods: {
      scrollToTop(ev) {
        Velocity(document.documentElement, 'scroll', { duration: 1000, easing: 'ease', offset: '0', mobileHA: false })
      },
      scrollTo(ref) {
        Velocity(this.$refs[ref], 'scroll', { duration: 1000, easing: 'ease' })
      },
      goToHome(ev) {
        window.location.assign('/')
      },
      toggleMobileNav(ev) {
        this.mobileNavShown = !this.mobileNavShown
      }
    },
    mounted() {
    }
  })
})
