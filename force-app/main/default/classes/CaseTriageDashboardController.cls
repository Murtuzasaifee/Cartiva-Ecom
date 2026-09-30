/**
 * Read-only Apex controller backing the Case Triage Dashboard LWC.
 * Runs with sharing and enforces field/object security on every query.
 */
public with sharing class CaseTriageDashboardController {

    public class DashboardStats {
        @AuraEnabled public Integer totalCases;
        @AuraEnabled public Integer triagedCount;
        @AuraEnabled public Integer pendingCount;
        @AuraEnabled public Integer overriddenCount;
    }

    @AuraEnabled(cacheable=true)
    public static DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        stats.totalCases = 0;
        stats.triagedCount = 0;
        stats.pendingCount = 0;
        stats.overriddenCount = 0;

        List<AggregateResult> results = [
            SELECT Triage_Status__c statusValue, COUNT(Id) statusCount
            FROM Case
            WITH SECURITY_ENFORCED
            GROUP BY Triage_Status__c
        ];

        for (AggregateResult result : results) {
            String status = (String) result.get('statusValue');
            Integer count = (Integer) result.get('statusCount');
            stats.totalCases += count;

            if (status == 'Triaged') {
                stats.triagedCount += count;
            } else if (status == 'Manually Overridden') {
                stats.overriddenCount += count;
            } else {
                stats.pendingCount += count;
            }
        }

        return stats;
    }

    @AuraEnabled(cacheable=true)
    public static List<Case> getRecentCases() {
        return [
            SELECT Id, CaseNumber, Subject, Triage_Category__c, Triage_Priority__c,
                   Recommended_Team__c, Triage_Status__c
            FROM Case
            WITH SECURITY_ENFORCED
            ORDER BY CreatedDate DESC
            LIMIT 20
        ];
    }
}
