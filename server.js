// api/chat.js
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
        const payload = req.body || {};

        // optional: small server-side safety checks
        if (!payload.model) payload.model = 'mistralai/mistral-7b-instruct:free';
        // allow adjusting token use by front-end (e.g. mode fast -> lower max_tokens),
        // but be careful not to let users set extremely high tokens.

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
