async function isOwner(pgClient, OrgName, OwnerId) {
    const ownerResult = await pgClient.query('SELECT owner FROM organizations WHERE name = $1', [OrgName]);
    if (ownerResult.rows.length === 0) {
        return { isOwner: false, error: 'Organization not found' };
    }
    
    if (ownerResult.rows[0].owner !== OwnerId) {
        return { isOwner: false, error: 'Not authorized as owner of the organization' };
    }
    
    return { isOwner: true };
}
module.exports = {
    isOwner
};