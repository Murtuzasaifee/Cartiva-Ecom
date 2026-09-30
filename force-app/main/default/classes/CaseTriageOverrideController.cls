/**
 * Apex controller backing the manual override action on the Case Triage Detail LWC.
 * Runs with sharing; enforces CRUD/FLS before mutating the Case record.
 */
public with sharing class CaseTriageOverrideController {

    @AuraEnabled
    public static void applyOverride(Id caseId, String category, String priority, String team, String reason) {
        try {
            if (!Schema.sObjectType.Case.isUpdateable()
                || !Schema.sObjectType.Case_Triage_Decision__c.isCreateable()) {
                throw new CaseTriageException('You do not have permission to override triage decisions.');
            }

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

            Case caseToUpdate = cases[0];
            caseToUpdate.Triage_Category__c = category;
            caseToUpdate.Triage_Priority__c = priority;
            caseToUpdate.Recommended_Team__c = team;
            caseToUpdate.Triage_Reason__c = reason;
            caseToUpdate.Triage_Override__c = true;
            caseToUpdate.Triage_Status__c = 'Manually Overridden';
            update caseToUpdate;

            insert new Case_Triage_Decision__c(
                Case__c = caseId,
                Category__c = category,
                Priority__c = priority,
                Team__c = team,
                Reason__c = reason,
                Decision_Date__c = Datetime.now(),
                Decision_Source__c = 'Manual Override'
            );
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}
