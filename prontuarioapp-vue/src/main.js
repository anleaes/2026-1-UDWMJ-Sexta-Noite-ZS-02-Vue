import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'

// Importações de estilos do Quasar
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: '#0284c7',
      secondary: '#0f172a',
      accent: '#38bdf8',
      dark: '#1e293b',
      positive: '#21ba45',
      negative: '#c0392b',
      info: '#31ccec',
      warning: '#f2c037'
    }
  }
})

app.mount('#app')
