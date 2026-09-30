/**
 * Resolves Case priority from a matched triage rule and provides the
 * severity ranking used to break ties between multiple keyword matches.
 */
public inherited sharing class CasePriorityService {

    public static final String DEFAULT_PRIORITY = 'Low';

    private static final Map<String, Integer> PRIORITY_RANK = new Map<String, Integer>{
        'Critical' => 4,
        'High' => 3,
        'Medium' => 2,
        'Low' => 1
    };

    public static String getPriority(Case_Triage_Rule__c rule) {
        return rule != null ? rule.Priority__c : DEFAULT_PRIORITY;
    }

    public static Integer rank(String priority) {
        return PRIORITY_RANK.containsKey(priority) ? PRIORITY_RANK.get(priority) : 0;
    }
}
