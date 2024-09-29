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
    isOwner,
    isAdmin,
    getAllReportIds,
    getOrganizationId
};