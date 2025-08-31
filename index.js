const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { analyzer } = require('./analyzer')

const app = express()
app.use(cors())
app.use(bodyParser.json())
const PORT = process.env.PORT || 5000

app.post('/analyze', analyzer)
app.get("/", (req, res) => {
  res.send("Resume Analyzer API is live! Use POST /analyze");
});

app.listen(PORT, () => {
    console.log(`Server live on ${PORT}`)
})