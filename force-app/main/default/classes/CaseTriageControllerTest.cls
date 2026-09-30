/**
 * Covers the dashboard read model and the override controller's error handling.
 */
@IsTest
private class CaseTriageControllerTest {

    @TestSetup
    static void makeData() {
        CaseTriageRuleTestDataFactory.seedDefaultRules();
        insert new List<Case>{
            new Case(Subject = 'Payment issue', Description = 'My payment failed'),
            new Case(Subject = 'Delivery question', Description = 'My package has not arrived')
        };
    }

    @IsTest
    static void testDashboardStatsReflectTriagedCases() {
        Test.startTest();
        CaseTriageDashboardController.DashboardStats stats = CaseTriageDashboardController.getDashboardStats();
        Test.stopTest();

        System.assertEquals(2, stats.totalCases, 'Two cases were inserted in setup');
        System.assertEquals(2, stats.triagedCount, 'Both cases should be Triaged');
        System.assertEquals(0, stats.pendingCount);
        System.assertEquals(0, stats.overriddenCount);
    }

    @IsTest
    static void testGetRecentCasesReturnsTriageFields() {
        Test.startTest();
        List<Case> cases = CaseTriageDashboardController.getRecentCases();
        Test.stopTest();

        System.assertEquals(2, cases.size(), 'Both recently created cases should be returned');
    }

    @IsTest
    static void testApplyOverrideThrowsForInvalidCaseId() {
        Boolean exceptionThrown = false;
        try {
            CaseTriageOverrideController.applyOverride(null, 'Payment', 'High', 'Payments', 'test reason');
        } catch (AuraHandledException ex) {
            exceptionThrown = true;
        }
        System.assert(exceptionThrown, 'Override should raise an AuraHandledException for an invalid Case Id');
    }
}
