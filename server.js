require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, systemPrompt } = req.body;

        const messages = [
            {
                role: 'system',
                content: systemPrompt || `You are the FileVault AI assistant. FileVault is a file-sharing web app. Features: User page (browse/download/search/sort/filter files by folder), Login page (email login, signup, OAuth: Google/GitHub/Facebook/Discord), Manager page for admin/manager roles (upload files, delete files, select folders, sort, filter, sync status dot, Repair Sync button, sync panel), Profile page (avatar, role badge, linked accounts, change password, sign out). User roles: admin and manager get the manager page, user role gets the user page only. Keep answers short and use the exact button/section names from the site.`
            },
            ...(history || []).map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.parts[0].text
            })),
            { role: 'user', content: message }
        ];

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            max_tokens: 1024,
            messages
        });

        res.json({ text: response.choices[0].message.content });
    } catch (error) {
        console.error('SERVER ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));