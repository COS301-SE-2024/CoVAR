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
async function isVA(pgClient, UserId){
    const VAResult = await pgClient.query('SELECT role FROM users WHERE user_id = $1', [UserId]);
    if (VAResult.rows.length === 0) {
        return { isVA: false, error: 'User not found' };
    }
    if (VAResult.rows[0].role !== 'va') {
        return { isVA: false, error: 'Not authorized as va' };
    }
    return { isVA: true };
}
async function isClient(pgClient, UserId){
    const ClientResult = await pgClient.query('SELECT role FROM users WHERE user_id = $1', [UserId]);
    if (ClientResult.rows.length === 0) {
        return { isClient: false, error: 'User not found' };
    }
    if (ClientResult.rows[0].role !== 'client') {
        return { isClient: false, error: 'Not authorized as client' };
    }
    return { isClient: true };
}
async function isUnauthorised(pgClient, UserId){
    const Unauthorised = await pgClient.query('SELECT role FROM users WHERE user_id = $1', [UserId]);
    if (Unauthorised.rows.length === 0) {
        return { isClient: false, error: 'User not found' };
    }
    if (Unauthorised.rows[0].role !== 'unauthorised') {
        return { isClient: false, error: 'Not authorized' };
    }
    return { Unauthorised: true };
}
async function getOrganizationId(pgClient, UserId) {
    const organizationIdResult = await pgClient.query('SELECT organization_id FROM users WHERE user_id = $1', [UserId]);
    if (organizationIdResult.rows.length === 0) {
        return { organizationId: null, error: 'Organization not found' };
    }
    return { organizationId: organizationIdResult.rows[0].organization_id };
}

async function getAllReportIds(pgClient, UserId) {
    const organizationIdResult = await getOrganizationId(pgClient, UserId);
    let reportIds;

    if (organizationIdResult.organizationId === null) {
        reportIds = await pgClient.query('SELECT report_id FROM user_reports WHERE user_id = $1', [UserId]);
    } else {
        reportIds = await pgClient.query('SELECT report_id FROM organization_reports WHERE organization_id = $1', [organizationIdResult.organizationId]);
    }

    return reportIds.rows.map(row => row.report_id);
}


module.exports = {
    isUnauthorised,
    isClient,
    isVA,
    isAdmin,
    isOwner,
    getAllReportIds,
    getOrganizationId
};