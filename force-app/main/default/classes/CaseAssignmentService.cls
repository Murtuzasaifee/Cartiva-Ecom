/**
 * Resolves the recommended support team from a matched triage rule.
 */
public inherited sharing class CaseAssignmentService {

    public static final String DEFAULT_TEAM = 'General Support';

    public static String getTeam(Case_Triage_Rule__c rule) {
        return rule != null ? rule.Team__c : DEFAULT_TEAM;
    }
}
