const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const { analyzer, fileUpload, analyzeFile } = require('./analyzer')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000

// Setup file upload
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

app.post('/analyze', analyzer)
app.post('/upload', upload.single('file'), fileUpload)
app.post('/analyze-file', upload.single('file'), analyzeFile)
app.get("/", (req, res) => {
  res.send("Resume Analyzer API is live! Use POST /analyze-file");
});

app.listen(PORT, () => {
    console.log(`Server live on ${PORT}`)
})