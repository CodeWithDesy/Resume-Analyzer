const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { analyzer } = require('./analyzer')

const app = express()
app.use(cors())
app.use(bodyParser.json())
const PORT = 5000

app.post('/analyze', analyzer)

app.listen(PORT, () => {
    console.log(`Server live on ${PORT}`)
})