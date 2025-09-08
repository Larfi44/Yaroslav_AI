const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// IMPORTANT: Move this to an environment variable in a real production environment
const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

app.post('/api/chat', async (req, res) => {
    try {
        const payload = req.body;
        if (payload.mode === 'fast') {
            payload.max_tokens = 150;
        }

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling OpenRouter API:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ 
            error: { 
                message: 'Failed to fetch response from AI.',
                details: error.response ? error.response.data : null
            }
        });
    }
});

module.exports = app;
