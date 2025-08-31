const axios = require('axios')
const dotenv = require('dotenv')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
dotenv.config()

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function analyzer(req, res) {
try {
const { jobDescription, resume } = req.body


    if (!jobDescription || !resume) {
        return res.status(400).json({message: 'Job Description and resume are required'})
    }

    const prompt = `Analyze this resume against the job description:


Job Description: ${jobDescription}

Resume: ${resume}

Provide analysis in this format:
Match Percentage: [X]%
Strengths: [list key strengths]
Areas for improvement: [list areas to improve]  
Recommendations: [list specific recommendations]`


    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user", 
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        },
        {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    )

    const aiText = response.data.choices[0].message.content
    res.json({ result: aiText })

} catch (error) {
    console.log('Groq Error:', error.response?.data || error.message)
    
    // Smart fallback
    const { jobDescription, resume } = req.body
    const smartAnalysis = createSmartAnalysis(jobDescription, resume)
    res.json({ result: smartAnalysis })
}

}

async function fileUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({message: 'No file uploaded'})
        }

        const file = req.file
        let extractedText = ''

        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer)
            extractedText = pdfData.text
        } 
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docData = await mammoth.extractRawText({buffer: file.buffer})
            extractedText = docData.value
        }
        else {
            return res.status(400).json({message: 'Only PDF and DOCX files are supported'})
        }

        res.json({ text: extractedText })

    } catch (error) {
        console.log('File upload error:', error)
        res.status(500).json({message: 'File processing failed'})
 }
}

function createSmartAnalysis(jobDescription, resume) {
const jobSkills = extractSkills(jobDescription)
const resumeSkills = extractSkills(resume)

const matches = jobSkills.filter(skill => 
    resumeSkills.some(rSkill => 
        rSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(rSkill.toLowerCase())
    )
)

const missing = jobSkills.filter(skill => !matches.includes(skill))
const matchPercent = jobSkills.length > 0 ? 
    Math.round((matches.length / jobSkills.length) * 100) : 50

return `Match Percentage: ${matchPercent}%


Strengths:
${matches.length > 0 ?
matches.map(skill => `- Experience with ${skill}`).join('\n') :
'- Professional background demonstrated\n- Relevant work experience shown'}

Areas for improvement:
${missing.length > 0 ?
missing.slice(0, 3).map(skill => `- Consider developing ${skill} skills`).join('\n') :
'- Continue developing technical expertise\n- Add more quantifiable achievements'}

Recommendations:

- Highlight specific projects that demonstrate your skills
- Add measurable results and achievements
- Consider obtaining certifications in key technologies
  ${missing.length > 0 ? `- Focus on learning: ${missing.slice(0, 2).join(', ')}` : ''}
- Tailor your resume more specifically to job requirements`
  }

function extractSkills(text) {
const commonSkills = [
'JavaScript', 'Node.js', 'React', 'Python', 'Java', 'MongoDB',
'SQL', 'Express', 'Angular', 'Vue', 'Docker', 'AWS', 'Git',
'HTML', 'CSS', 'TypeScript', 'PostgreSQL', 'MySQL', 'Redis',
'API', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
]


return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
)

}

async function analyzeFile(req, res) {
    try {
        const { jobDescription } = req.body
        
        if (!jobDescription) {
            return res.status(400).json({message: 'Job Description is required'})
        }

        if (!req.file) {
            return res.status(400).json({message: 'Resume file is required'})
        }

        // Extract text from file
        const file = req.file
        let resume = ''

        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer)
            resume = pdfData.text
        } 
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docData = await mammoth.extractRawText({buffer: file.buffer})
            resume = docData.value
        }
        else {
            return res.status(400).json({message: 'Only PDF and DOCX files are supported'})
        }

        // Now analyze with AI
        const prompt = `Analyze this resume against the job description:

Job Description: ${jobDescription}

Resume: ${resume}

Provide analysis in this format:
Match Percentage: [X]%
Strengths: [list key strengths]
Areas for improvement: [list areas to improve]  
Recommendations: [list specific recommendations]`

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        const aiText = response.data.choices[0].message.content
        res.json({ result: aiText })

    } catch (error) {
        console.log('Analyze file error:', error.response?.data || error.message)
        
        // Smart fallback using extracted text
        const { jobDescription } = req.body
        let resume = ''
        
        try {
            const file = req.file
            if (file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(file.buffer)
                resume = pdfData.text
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const docData = await mammoth.extractRawText({buffer: file.buffer})
                resume = docData.value
            }
        } catch (extractError) {
            console.log('Text extraction failed:', extractError)
        }
        
        const smartAnalysis = createSmartAnalysis(jobDescription, resume)
        res.json({ result: smartAnalysis })
 }
}

module.exports = {analyzer, fileUpload, analyzeFile}