import Vue from 'vue'
import App from './app.vue'
import router from './router'
import publicComponent from '../dist/publicComponent'
import '../dist/nhw-public-component-ui.css'
Vue.config.productionTip = false

Vue.use(publicComponent)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
