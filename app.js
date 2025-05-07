import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '')));

// Google Generative AI setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

// Initialize the Gemini API - using standard configuration
const genAI = new GoogleGenerativeAI(apiKey);

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle both GET and POST requests for generating content
app.get('/generate-content', handleGenerateContent);
app.post('/generate-content', handleGenerateContent);

async function handleGenerateContent(req, res) {
    // Get prompt from query string (GET) or request body (POST)
    const prompt = req.method === 'GET' ? req.query.prompt : req.body.prompt;
    
    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    try {
        console.log('Generating content for prompt:', prompt);
        
        // Get the model - trying both pro versions based on API errors above
        let model;
        let responseText;
        let errorMessage;
        
        try {
            // First try with gemini-pro
            model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const prompt1Result = await model.generateContent(prompt);
            responseText = prompt1Result.response.text();
        } catch (error1) {
            console.log('First model attempt failed:', error1.message);
            errorMessage = error1.message;
            
            try {
                // If that fails, try with gemini-1.5-pro
                model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const prompt2Result = await model.generateContent(prompt);
                responseText = prompt2Result.response.text();
            } catch (error2) {
                console.log('Second model attempt failed:', error2.message);
                throw new Error(`Failed with both model versions. Original error: ${errorMessage}`);
            }
        }
        
        console.log('Generated response:', responseText);
        res.send(responseText);
    } catch (error) {
        console.error('Detailed error:', error);
        
        // Provide API key info (without revealing the key)
        console.log('API Key starts with:', apiKey.substring(0, 5) + '...');
        
        let errorMessage = 'Error generating content: ' + error.message;
        res.status(500).send(errorMessage);
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Make sure you have set a valid GEMINI_API_KEY in your .env file`);
});