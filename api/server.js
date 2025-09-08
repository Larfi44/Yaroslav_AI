// api/server.js
const axios = require('axios');

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY; // set in Vercel dashboard

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!OPENROUTER_KEY) {
        return res.status(500).json({ error: { message: 'Server missing OPENROUTER_API_KEY env var' } });
    }

    try {
        // Vercel may pass parsed body or string; normalize
        let payload;
        try {
            payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        } catch (e) {
            return res.status(400).json({ error: { message: 'Invalid JSON body' } });
        }

        if (!payload.model) payload.model = 'mistralai/mistral-7b-instruct:free';

        // optional: adjust token usage based on mode sent by frontend
        if (payload.mode === 'fast') payload.max_tokens = payload.max_tokens || 150;
        if (payload.mode === 'standard') payload.max_tokens = payload.max_tokens || 350;
        // don't allow very large tokens from client
        if (payload.max_tokens && payload.max_tokens > 2000) payload.max_tokens = 2000;

        // POST to OpenRouter
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        return res.status(200).json(response.data);
    } catch (err) {
        console.error('OpenRouter proxy error:', err.response ? err.response.data : err.message);
        const status = err.response ? err.response.status : 500;
        const details = err.response ? err.response.data : { message: err.message };
        return res.status(status).json({ error: { message: 'Failed to fetch response from OpenRouter', details }});
    }
};
