require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors()); // Allows your index.html to talk to this server
app.use(express.json());
console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "Found" : "NOT FOUND"); // ADD THIS
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use the FULL resource name which often bypasses versioning confusion
        const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash" 
});


        // Ensure history is formatted correctly for the SDK
        const chat = model.startChat({
            history: history && history.length > 0 ? history : [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});
// This tells the server to use the .env port OR 3000 if .env is missing
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));