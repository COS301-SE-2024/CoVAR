const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const axios = require('axios');

const router = express.Router();

router.post('/topVulChain', authenticateToken ,async (req, res) => {
    const { chain_prompt } = req.body;

    try {
        //carry jwt through to chain server
        const token = req.headers.authorization;
        console.log('Token', token);
        const response = await axios.post('http://langchain:6000/topVulChain', { chain_prompt }, { headers: { Authorization: token } });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error occurred during /chain POST request:');
        console.error(`Request Data: ${JSON.stringify({ chain_prompt })}`);
        
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error(`Response Status: ${error.response.status}`);
            console.error(`Response Data: ${JSON.stringify(error.response.data)}`);
            res.status(500).json({
                message: 'Internal Server Error',
                error: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response was received
            console.error('No response received from the chain server.');
            console.error(`Request Details: ${JSON.stringify(error.request)}`);
            res.status(500).json({
                message: 'No response from the chain server',
                error: 'No response received'
            });
        } else {
            // Something else happened while setting up the request
            console.error(`Error Message: ${error.message}`);
            res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

module.exports = router;
