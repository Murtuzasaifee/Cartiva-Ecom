/**
 * Orchestrates the Case triage rule engine. Bulk-safe: no SOQL/DML inside
 * loops, operates purely on the in-memory Case list passed by the trigger.
 */
public inherited sharing class CaseTriageService {

    /**
     * Evaluates and applies triage decisions to each Case in place.
     * Any per-case failure is isolated so one bad record cannot block the batch.
     */
    public static void triageCases(List<Case> cases) {
        for (Case c : cases) {
            try {
                String text = buildEvaluationText(c);
                Case_Triage_Rule__c matchedRule = CaseCategoryService.resolveRule(text);
                CaseTriageResult result = buildResult(matchedRule);
                applyResult(c, result);
            } catch (Exception ex) {
                applyFailure(c, ex);
            }
        }
    }

    private static String buildEvaluationText(Case c) {
        return (String.isNotBlank(c.Subject) ? c.Subject : '') + ' ' +
               (String.isNotBlank(c.Description) ? c.Description : '');
    }

    private static CaseTriageResult buildResult(Case_Triage_Rule__c matchedRule) {
        String category = CaseCategoryService.getCategory(matchedRule);
        String priority = CasePriorityService.getPriority(matchedRule);
        String team = CaseAssignmentService.getTeam(matchedRule);
        Decimal slaHours = CaseSLAService.getSLAHours(matchedRule);
        Datetime slaDueDate = CaseSLAService.calculateDueDate(slaHours);
        String reason = matchedRule != null
            ? ('Matched keyword \'' + matchedRule.Keyword__c + '\' → classified as ' + category +
               ' with ' + priority + ' priority, routed to ' + team + '.')
            : 'No matching keyword rule found. Defaulted to General category with Low priority.';

        return new CaseTriageResult(category, priority, team, slaHours, slaDueDate, reason);
    }

    private static void applyResult(Case c, CaseTriageResult result) {
        c.Triage_Category__c = result.category;
        c.Triage_Priority__c = result.priority;
        c.Recommended_Team__c = result.team;
        c.SLA_Hours__c = result.slaHours;
        c.SLA_Due_Date__c = result.slaDueDate;
        c.Triage_Reason__c = result.reason;
        c.Triage_Status__c = 'Triaged';
    }

    private static void applyFailure(Case c, Exception ex) {
        c.Triage_Status__c = 'Failed';
        c.Triage_Reason__c = 'Triage failed: ' + ex.getMessage();
        System.debug(LoggingLevel.ERROR, 'CaseTriageService failed for case: ' + ex.getMessage());
    }
}
