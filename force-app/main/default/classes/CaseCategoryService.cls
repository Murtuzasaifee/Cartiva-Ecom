/**
 * Resolves the best-matching Case_Triage_Rule__c record for a Case's text.
 * Rules are loaded once per transaction (single SOQL query, cached statically)
 * regardless of how many Cases are being triaged in the batch.
 */
public inherited sharing class CaseCategoryService {

    public static final String DEFAULT_CATEGORY = 'General';

    private static List<Case_Triage_Rule__c> cachedRules;

    /**
     * Returns the highest-severity rule whose keyword appears in the given text.
     * Ties are broken by the longest (most specific) keyword, then alphabetically.
     * Returns null when no keyword matches.
     */
    public static Case_Triage_Rule__c resolveRule(String text) {
        if (String.isBlank(text)) {
            return null;
        }
        String normalized = text.toLowerCase();
        Case_Triage_Rule__c bestRule = null;

        for (Case_Triage_Rule__c rule : getRules()) {
            if (String.isBlank(rule.Keyword__c) || !normalized.contains(rule.Keyword__c.toLowerCase())) {
                continue;
            }
            if (isBetterMatch(rule, bestRule)) {
                bestRule = rule;
            }
        }
        return bestRule;
    }

    public static String getCategory(Case_Triage_Rule__c rule) {
        return rule != null ? rule.Category__c : DEFAULT_CATEGORY;
    }

    private static Boolean isBetterMatch(Case_Triage_Rule__c candidate, Case_Triage_Rule__c current) {
        if (current == null) {
            return true;
        }
        Integer candidateRank = CasePriorityService.rank(candidate.Priority__c);
        Integer currentRank = CasePriorityService.rank(current.Priority__c);
        if (candidateRank != currentRank) {
            return candidateRank > currentRank;
        }
        if (candidate.Keyword__c.length() != current.Keyword__c.length()) {
            return candidate.Keyword__c.length() > current.Keyword__c.length();
        }
        return candidate.Keyword__c < current.Keyword__c;
    }

    private static List<Case_Triage_Rule__c> getRules() {
        if (cachedRules == null) {
            cachedRules = [
                SELECT Keyword__c, Category__c, Priority__c, Team__c, SLA_Hours__c
                FROM Case_Triage_Rule__c
                WITH SECURITY_ENFORCED
            ];
        }
        return cachedRules;
    }
}
