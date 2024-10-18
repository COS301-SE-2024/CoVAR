const express = require('express');
const stringSimilarity = require('string-similarity');
const { authenticateToken } = require('../lib/securityFunctions');
const router = express.Router();
const { isVA,isAdmin } = require('../lib/serverHelperFunctions');
const pgClient = require('../lib/postgres');
function matchSentences(list1, list2) {
    // Remove duplicates based on nvtName, Port, and IP
    list1 = list1.filter((item, index, self) =>
        index === self.findIndex((t) => t.nvtName === item.nvtName && t.port === item.port && t.IP === item.IP)
    );
    list2 = list2.filter((item, index, self) =>
        index === self.findIndex((t) => t.nvtName === item.nvtName && t.port === item.port && t.IP === item.IP)
    );

    const matches = [];
    const unmatchedList1 = [];
    const unmatchedList2 = [...list2];

    list1.forEach((item1) => {
        const nvtName1 = item1.nvtName;
        let bestMatch = { target: null, score: 0 };

        unmatchedList2.forEach((item2) => {
            // Check if both Port and IP match before comparing nvtName
            if (item1.port === item2.port && item1.IP === item2.IP) {
                const nvtName2 = item2.nvtName;
                const similarity = stringSimilarity.compareTwoStrings(nvtName1, nvtName2);

                if (similarity > bestMatch.score) {
                    bestMatch = { target: item2, score: similarity };
                }
            }
        });

        if (bestMatch.score > 0.4) { // Similarity threshold for a match
            matches.push([item1, bestMatch.target]);
            const index = unmatchedList2.indexOf(bestMatch.target);
            unmatchedList2.splice(index, 1);
        } else {
            unmatchedList1.push(item1);
        }
    });

    return {
        matches,
        unmatchedList1,
        unmatchedList2
    };
}


router.post('/conflicts/match', authenticateToken, async (req, res) => {
    const userId = req.user.user_id;
    const VAResult =  await isVA(pgClient,userId);
    const adminResult = await isAdmin(pgClient,userId);
    if(!VAResult.isVA && !adminResult.isAdmin){
        return res.status(403).send('Not authorized as VA or admin');
    }
    const { listUploads } = req.body;

    if (!listUploads || listUploads.length === 0 || listUploads.length > 2) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // If only one list is provided
    if (listUploads.length === 1) {
        const list1 = listUploads[0];
        return res.json({ matches: [], unmatchedList1: list1, unmatchedList2: [] });
    }

    const [list1, list2] = listUploads;

    const { matches, unmatchedList1, unmatchedList2 } =  matchSentences(list1, list2);
    res.json({ matches, unmatchedList1, unmatchedList2 });
});

module.exports = router;