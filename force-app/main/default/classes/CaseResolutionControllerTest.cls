/**
 * Covers agent-driven fulfillment status changes and Case resolution.
 */
@IsTest
private class CaseResolutionControllerTest {

    @TestSetup
    static void makeData() {
        CaseTriageRuleTestDataFactory.seedDefaultRules();
        insert new Case(Subject = 'Delivery question', Description = 'My package has not arrived');
    }

    @IsTest
    static void testUpdateFulfillmentStatus() {
        Case triaged = [SELECT Id FROM Case LIMIT 1];

        Test.startTest();
        CaseResolutionController.updateFulfillmentStatus(triaged.Id, 'In Progress');
        Test.stopTest();

        Case result = [SELECT Fulfillment_Status__c FROM Case WHERE Id = :triaged.Id];
        System.assertEquals('In Progress', result.Fulfillment_Status__c);
    }

    @IsTest
    static void testResolveCaseSetsResolutionAndStatus() {
        Case triaged = [SELECT Id FROM Case LIMIT 1];

        Test.startTest();
        CaseResolutionController.resolveCase(triaged.Id, 'Shipment was delayed by the courier and is scheduled for delivery tomorrow.');
        Test.stopTest();

        Case result = [SELECT Resolution__c, Fulfillment_Status__c FROM Case WHERE Id = :triaged.Id];
        System.assertEquals('Resolved', result.Fulfillment_Status__c);
        System.assert(result.Resolution__c.contains('delayed by the courier'));
    }

    @IsTest
    static void testResolveCaseThrowsForInvalidCaseId() {
        Boolean exceptionThrown = false;
        try {
            CaseResolutionController.resolveCase(null, 'test resolution');
        } catch (AuraHandledException ex) {
            exceptionThrown = true;
        }
        System.assert(exceptionThrown, 'Resolve should raise an AuraHandledException for an invalid Case Id');
    }
}
