const express = require('express')
const Analyzer = require('./analyzer')

async function analyze(req, res) {
    try {
           const {jobDescription, cvText} = req.body
           const analysis = await analyze(jobDescription, cvText)
            if (analysis.error) {
                return res.status(401).json({message: analysis.error})
            } else
                {res.json(analysis)
            }
    } catch (error) {
          console.log(error)
    }
}

module.exports = {analyze}