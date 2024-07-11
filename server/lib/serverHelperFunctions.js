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
async function isAdmin(pgClient, UserId){
    const adminResult = await pgClient.query('SELECT role FROM users WHERE user_id = $1', [UserId]);
    if (adminResult.rows.length === 0) {
        return { isAdmin: false, error: 'User not found' };
    }
    if (adminResult.rows[0].role !== 'admin') {
        return { isAdmin: false, error: 'Not authorized as admin' };
    }
    return { isAdmin: true };
}
module.exports = {
    isOwner,
    isAdmin
};