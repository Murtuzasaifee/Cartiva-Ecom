/**
 * Verifies bulk processing (200 records, no governor-limit errors), audit trail
 * creation from the rule engine, and the manual override flow.
 */
@IsTest
private class CaseTriggerHandlerTest {

    @TestSetup
    static void makeData() {
        CaseTriageRuleTestDataFactory.seedDefaultRules();
    }

    @IsTest
    static void testBulkInsertProcessesTwoHundredCasesWithoutLimitErrors() {
        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < 200; i++) {
            cases.add(new Case(
                Subject = 'Bulk case ' + i,
                Description = Math.mod(i, 2) == 0 ? 'My payment failed' : 'My package has not arrived'
            ));
        }

        Test.startTest();
        insert cases;
        Test.stopTest();

        List<Case> triaged = [SELECT Id, Triage_Status__c, Triage_Category__c FROM Case];
        System.assertEquals(200, triaged.size(), 'All 200 cases should be inserted');
        for (Case c : triaged) {
            System.assertEquals('Triaged', c.Triage_Status__c, 'Every case should reach Triaged status');
            System.assert(
                c.Triage_Category__c == 'Payment' || c.Triage_Category__c == 'Delivery',
                'Category should be classified based on description'
            );
        }

        Integer decisionCount = [SELECT COUNT() FROM Case_Triage_Decision__c];
        System.assertEquals(200, decisionCount, 'One audit decision should be logged per triaged case');
    }

    @IsTest
    static void testRuleEngineDecisionCreatesAuditRecord() {
        Test.startTest();
        insert new Case(Subject = 'Payment issue', Description = 'My payment failed');
        Test.stopTest();

        Case_Triage_Decision__c decision = [
            SELECT Category__c, Priority__c, Team__c, Decision_Source__c
            FROM Case_Triage_Decision__c LIMIT 1
        ];
        System.assertEquals('Payment', decision.Category__c);
        System.assertEquals('High', decision.Priority__c);
        System.assertEquals('Payments', decision.Team__c);
        System.assertEquals('Rule Engine', decision.Decision_Source__c);
    }

    @IsTest
    static void testManualOverrideUpdatesCaseAndCreatesAuditRecord() {
        insert new Case(Subject = 'Delivery question', Description = 'My package has not arrived');
        Case triaged = [SELECT Id, Triage_Priority__c, Recommended_Team__c FROM Case LIMIT 1];
        System.assertEquals('Medium', triaged.Triage_Priority__c, 'Precondition: system assigned Medium priority');

        Test.startTest();
        CaseTriageOverrideController.applyOverride(
            triaged.Id,
            'Delivery',
            'High',
            'Logistics',
            'Customer has already contacted support twice.'
        );
        Test.stopTest();

        Case overridden = [
            SELECT Triage_Category__c, Triage_Priority__c, Recommended_Team__c, Triage_Status__c, Triage_Override__c
            FROM Case WHERE Id = :triaged.Id
        ];
        System.assertEquals('Delivery', overridden.Triage_Category__c);
        System.assertEquals('High', overridden.Triage_Priority__c);
        System.assertEquals('Logistics', overridden.Recommended_Team__c);
        System.assertEquals('Manually Overridden', overridden.Triage_Status__c);
        System.assertEquals(true, overridden.Triage_Override__c);

        Case_Triage_Decision__c auditRecord = [
            SELECT Decision_Source__c, Priority__c, Team__c
            FROM Case_Triage_Decision__c
            WHERE Case__c = :triaged.Id AND Decision_Source__c = 'Manual Override'
            LIMIT 1
        ];
        System.assertEquals('Manual Override', auditRecord.Decision_Source__c);
        System.assertEquals('High', auditRecord.Priority__c);
    }
}
