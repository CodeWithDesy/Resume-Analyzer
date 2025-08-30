const axios = require('axios')
const dotenv = require('dotenv')
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
            model: "llama3-8b-8192",
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

module.exports = {analyzer}