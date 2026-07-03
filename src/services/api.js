import axios from 'axios'

const api = axios.create({
  baseURL: 'http://api_valida.ivea.local/api', // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
