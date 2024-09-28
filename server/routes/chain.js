const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const axios = require('axios');
const router = express.Router();

// Helper function to safely stringify the error request
const safeStringify = (obj) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return undefined; // Circular reference found
            }
            cache.add(value);
        }
        return value;
    });
};

router.post('/unmatchedRecommendations', authenticateToken, async (req, res) => {
    const { chain_prompt_1 } = req.body;

    if (!chain_prompt_1) {
        return res.status(400).json({ error: 'chain_prompt_1 is required' });
    }

    try {
        const token = req.headers.authorization;
        const response = await axios.post('http://13.60.34.133/topVulChain',
            { chain_prompt_1 },
            { headers: { Authorization: token } }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error occurred during /unmatchedRecomendations POST request:');
        console.error(`Request Data: ${safeStringify({ chain_prompt_1 })}`);

        if (error.response) {
            console.error(`Response Status: ${error.response.status}`);
            console.error(`Response Data: ${safeStringify(error.response.data)}`);

            // Break out of the loop if it's a 502 Bad Gateway error
            if (error.response.status === 502) {
                return res.status(502).json({
                    message: 'Bad Gateway',
                    error: error.response.data
                });
            }

            res.status(500).json({
                message: 'Internal Server Error',
                error: error.response.data
            });
        } else if (error.request) {
            console.error('No response received from the chain server.');
            console.error(`Request Details: ${safeStringify(error.request)}`);

            res.status(500).json({
                message: 'No response from the chain server',
                error: 'No response received'
            });
        } else {
            console.error(`Error Message: ${error.message}`);
            res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

router.post('/matchedRecommendations', authenticateToken, async (req, res) => {
    const { chain_prompt_1, chain_prompt_2 } = req.body;

    if (!chain_prompt_1 || !chain_prompt_2) {
        return res.status(400).json({ error: 'Both chain_prompt_1 and chain_prompt_2 are required' });
    }

    try {
        const token = req.headers.authorization;
        const response = await axios.post('http://13.60.34.133/topVulChain',
            { chain_prompt_1, chain_prompt_2 },
            { headers: { Authorization: token } }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error occurred during /matchedRecommendations POST request:');
        console.error(`Request Data: ${safeStringify({ chain_prompt_1, chain_prompt_2 })}`);

        if (error.response) {
            console.error(`Response Status: ${error.response.status}`);
            console.error(`Response Data: ${safeStringify(error.response.data)}`);

            // Break out of the loop if it's a 502 Bad Gateway error
            if (error.response.status === 502) {
                return res.status(502).json({
                    message: 'Bad Gateway',
                    error: error.response.data
                });
            }

            res.status(500).json({
                message: 'Internal Server Error',
                error: error.response.data
            });
        } else if (error.request) {
            console.error('No response received from the chain server.');
            console.error(`Request Details: ${safeStringify(error.request)}`);

            res.status(500).json({
                message: 'No response from the chain server',
                error: 'No response received'
            });
        } else {
            console.error(`Error Message: ${error.message}`);
            res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

router.post('/topVulChain', authenticateToken, async (req, res) => {
    const { chain_prompt } = req.body;

    try {
        // Carry JWT through to chain server
        const token = req.headers.authorization;
        const response = await axios.post('http://13.60.34.133/topVulChain', { chain_prompt }, { headers: { Authorization: token } });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error occurred during /topVulChain POST request:');
        console.error(`Request Data: ${safeStringify({ chain_prompt })}`);

        if (error.response) {
            console.error(`Response Status: ${error.response.status}`);
            console.error(`Response Data: ${safeStringify(error.response.data)}`);

            // Break out of the loop if it's a 502 Bad Gateway error
            if (error.response.status === 502) {
                return res.status(502).json({
                    message: 'Bad Gateway',
                    error: error.response.data
                });
            }

            res.status(500).json({
                message: 'Internal Server Error',
                error: error.response.data
            });
        } else if (error.request) {
            console.error('No response received from the chain server.');
            console.error(`Request Details: ${safeStringify(error.request)}`);

            res.status(500).json({
                message: 'No response from the chain server',
                error: 'No response received'
            });
        } else {
            console.error(`Error Message: ${error.message}`);
            res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

module.exports = router;
