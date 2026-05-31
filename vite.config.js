import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // 👈 Сертификатты іске қосамыз
  ],
  server: {
    host: '0.0.0.0', // Телефоннан кіруге рұқсат беру
    port: 5173
  }
})