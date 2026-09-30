/**
 * Apex controller for agent-driven Case lifecycle actions: changing the
 * customer-visible fulfillment status and recording a resolution.
 * Runs with sharing; enforces CRUD/FLS before mutating the Case record.
 */
public with sharing class CaseResolutionController {

    @AuraEnabled
    public static void updateFulfillmentStatus(Id caseId, String fulfillmentStatus) {
        try {
            if (!Schema.sObjectType.Case.isUpdateable()) {
                throw new CaseTriageException('You do not have permission to update this Case.');
            }
            Case caseToUpdate = getCaseOrThrow(caseId);
            caseToUpdate.Fulfillment_Status__c = fulfillmentStatus;
            update caseToUpdate;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled
    public static void resolveCase(Id caseId, String resolution) {
        try {
            if (!Schema.sObjectType.Case.isUpdateable()) {
                throw new CaseTriageException('You do not have permission to update this Case.');
            }
            Case caseToUpdate = getCaseOrThrow(caseId);
            caseToUpdate.Resolution__c = resolution;
            caseToUpdate.Fulfillment_Status__c = 'Resolved';
            update caseToUpdate;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    private static Case getCaseOrThrow(Id caseId) {
        List<Case> cases = [
            SELECT Id
            FROM Case
            WHERE Id = :caseId
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
        if (cases.isEmpty()) {
            throw new CaseTriageException('Case not found or not accessible.');
        }
        return cases[0];
    }
}
