import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

const api_url = 'https://api.example.com' // Replace with your actual API URL

app.use(router)
app.config.globalProperties.$api_url = api_url

app.mount('#app')
