const express = require('express');
const stringSimilarity = require('string-similarity');
const { authenticateToken } = require('../lib/securityFunctions');
const router = express.Router();

function matchSentences(list1, list2) {
    //remove duplicates.
    list1 = list1.filter((item, index, self) => index === self.findIndex((t) => (t.nvtName === item.nvtName && t.port === item.port)));
    list2 = list2.filter((item, index, self) => index === self.findIndex((t) => (t.nvtName === item.nvtName && t.port === item.port)));


    const matches = [];
    const unmatchedList1 = [];
    const unmatchedList2 = [...list2];

    list1.forEach((item1) => {
        const nvtName1 = item1.nvtName;
        let bestMatch = { target: null, score: 0 };

        unmatchedList2.forEach((item2) => {
            const nvtName2 = item2.nvtName;
            const similarity = stringSimilarity.compareTwoStrings(nvtName1, nvtName2);

            if (similarity > bestMatch.score) {
                bestMatch = { target: item2, score: similarity };
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

    const { matches, unmatchedList1, unmatchedList2 } = matchSentences(list1, list2);
    res.json({ matches, unmatchedList1, unmatchedList2 });
});

module.exports = router;