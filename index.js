import express from 'express';
import { extractContentFromUrl } from './lib/gemini.js';
import cors from 'cors';
import 'dotenv/config'

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.send('Welcome to the Content Extractor API');   
});

app.post('/api/extract', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                status: 'error',
                timestamp: new Date()
            });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ 
                error: 'Invalid URL format',
                status: 'error',
                timestamp: new Date()
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('Gemini API key not configured');
            return res.status(500).json({ 
                error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.',
                status: 'error',
                timestamp: new Date()
            });
        }

        // Check if API key is not just a placeholder
        if (process.env.GEMINI_API_KEY === 'your_gemini_api_key_here' || process.env.GEMINI_API_KEY.length < 10) {
            console.error('Invalid Gemini API key format');
            return res.status(500).json({ 
                error: 'Invalid Gemini API key. Please check your .env file configuration.',
                status: 'error',
                timestamp: new Date()
            });
        }

        const extractedContent = await extractContentFromUrl(url);

        return res.json(extractedContent);
    } catch (error) {
        console.error('Error extracting content:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            status: 'error',
            timestamp: new Date(),
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  WARNING: GEMINI_API_KEY not found in environment variables');
        console.warn('   Please create a .env file with your Gemini API key');
    } else if (process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('⚠️  WARNING: Using placeholder API key');
        console.warn('   Please replace with your actual Gemini API key');
    } else {
        console.log('✅ Gemini API key configured');
    }
});