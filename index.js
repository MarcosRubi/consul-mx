const cors = require('cors')
const express = require('express')
const app = express()
const morgan = require('morgan')
const Vendor = require('./src/consul.js')
require('dotenv').config()

// Configuraciones
app.set('port', process.env.PORT || 3000)
app.set('json spaces', 2)

// Middleware
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(cors())

// Routes
app.get('/', (req, res) => res.status(200).send('Hello'))
app.get('/consular/', Vendor.handler)

// Temporizador que llama a la ruta cada minuto
setInterval(() => {
  const url = 'http://localhost:3000/consular'
  fetch(url)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error))
}, 60 * 5000) // 1 minuto en milisegundos

// Iniciando el servidor
app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`)
})
