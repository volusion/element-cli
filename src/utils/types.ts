export interface AuditInfo {
    createdOn: string;
    updatedOn: string;
}
export interface MembershipResponse {
    auditInfo: AuditInfo;
    id: string;
    isPublic: boolean;
    name: string;
}
