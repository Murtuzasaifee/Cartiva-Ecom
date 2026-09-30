/**
 * Trigger handler for Case. Keeps the trigger itself declarative and thin,
 * and isolates each context so bulk DML/SOQL stays outside per-record loops.
 */
public inherited sharing class CaseTriggerHandler {

    public static void beforeInsert(List<Case> newCases) {
        CaseTriageService.triageCases(newCases);
    }

    public static void afterInsert(List<Case> newCases) {
        List<Case_Triage_Decision__c> decisions = new List<Case_Triage_Decision__c>();

        for (Case c : newCases) {
            if (c.Triage_Status__c != 'Triaged') {
                continue;
            }
            decisions.add(new Case_Triage_Decision__c(
                Case__c = c.Id,
                Category__c = c.Triage_Category__c,
                Priority__c = c.Triage_Priority__c,
                Team__c = c.Recommended_Team__c,
                SLA_Hours__c = c.SLA_Hours__c,
                Reason__c = c.Triage_Reason__c,
                Decision_Date__c = Datetime.now(),
                Decision_Source__c = 'Rule Engine'
            ));
        }

        if (!decisions.isEmpty()) {
            insert decisions;
        }
    }
}
