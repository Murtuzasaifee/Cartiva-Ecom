/**
 * Verifies the rule engine classification scenarios called out in the
 * Cartiva requirement document (Delivery, Payment, Return, Refund, Critical, default).
 */
@IsTest
private class CaseTriageServiceTest {

    @TestSetup
    static void makeData() {
        CaseTriageRuleTestDataFactory.seedDefaultRules();
    }

    @IsTest
    static void testPackageNotArrivedIsDelivery() {
        Test.startTest();
        insert new Case(Subject = 'Missing package', Description = 'My package has not arrived');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Triage_Priority__c, Recommended_Team__c, Triage_Status__c
                        FROM Case LIMIT 1];
        System.assertEquals('Delivery', result.Triage_Category__c, 'Category should be Delivery');
        System.assertEquals('Medium', result.Triage_Priority__c, 'Priority should be Medium');
        System.assertEquals('Logistics', result.Recommended_Team__c, 'Team should be Logistics');
        System.assertEquals('Triaged', result.Triage_Status__c, 'Status should be Triaged');
    }

    @IsTest
    static void testPaymentFailedIsHighPriority() {
        Test.startTest();
        insert new Case(Subject = 'Payment issue', Description = 'My payment failed');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Triage_Priority__c, Recommended_Team__c
                        FROM Case LIMIT 1];
        System.assertEquals('Payment', result.Triage_Category__c, 'Category should be Payment');
        System.assertEquals('High', result.Triage_Priority__c, 'Priority should be High');
        System.assertEquals('Payments', result.Recommended_Team__c, 'Team should be Payments');
    }

    @IsTest
    static void testReturnRequestIsReturnCategory() {
        Test.startTest();
        insert new Case(Subject = 'Return request', Description = 'I want to return the product');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Recommended_Team__c FROM Case LIMIT 1];
        System.assertEquals('Return', result.Triage_Category__c, 'Category should be Return');
        System.assertEquals('Returns', result.Recommended_Team__c, 'Team should be Returns');
    }

    @IsTest
    static void testMissingRefundIsRefundCategory() {
        Test.startTest();
        insert new Case(Subject = 'Refund question', Description = 'I haven\'t received my refund');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Recommended_Team__c FROM Case LIMIT 1];
        System.assertEquals('Refund', result.Triage_Category__c, 'Category should be Refund');
        System.assertEquals('Finance', result.Recommended_Team__c, 'Team should be Finance');
    }

    @IsTest
    static void testUnauthorizedCardActivityIsCritical() {
        Test.startTest();
        insert new Case(Subject = 'Unauthorized activity', Description = 'I see an unauthorized transaction on my card');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Triage_Priority__c, Recommended_Team__c
                        FROM Case LIMIT 1];
        System.assertEquals('Payment', result.Triage_Category__c, 'Category should be Payment');
        System.assertEquals('Critical', result.Triage_Priority__c, 'Priority should be Critical');
        System.assertEquals('Payments', result.Recommended_Team__c, 'Team should be Payments');
    }

    @IsTest
    static void testUnknownTopicDefaultsToGeneralLow() {
        Test.startTest();
        insert new Case(Subject = 'Business hours', Description = 'What are your business hours?');
        Test.stopTest();

        Case result = [SELECT Triage_Category__c, Triage_Priority__c, SLA_Hours__c, SLA_Due_Date__c FROM Case LIMIT 1];
        System.assertEquals('General', result.Triage_Category__c, 'Category should default to General');
        System.assertEquals('Low', result.Triage_Priority__c, 'Priority should default to Low');
        System.assertEquals(48, result.SLA_Hours__c, 'Default SLA is 48 hours');
        System.assertNotEquals(null, result.SLA_Due_Date__c, 'SLA due date should be populated');
    }
}
