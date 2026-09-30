/**
 * Seeds Case_Triage_Rule__c test data. Apex tests never see org data for
 * regular custom objects, so every test that triages a Case must insert
 * the rules it depends on via this factory.
 */
@IsTest
public class CaseTriageRuleTestDataFactory {

    public static void seedDefaultRules() {
        insert new List<Case_Triage_Rule__c>{
            // Critical — fraud / unauthorized payment
            rule('Fraud', 'fraud', 'Payment', 'Critical', 'Payments', 2),
            rule('Unauthorized', 'unauthorized', 'Payment', 'Critical', 'Payments', 2),

            // High — delivery delays, product damage, payment failure
            rule('Delayed', 'delayed', 'Delivery', 'High', 'Logistics', 8),
            rule('Late', 'late', 'Delivery', 'High', 'Logistics', 8),
            rule('Damaged', 'damaged', 'Product Issue', 'High', 'Product Support', 8),
            rule('Broken', 'broken', 'Product Issue', 'High', 'Product Support', 8),
            rule('Defective', 'defective', 'Product Issue', 'High', 'Product Support', 8),
            rule('PaymentFailed', 'payment failed', 'Payment', 'High', 'Payments', 4),

            // Medium — Delivery
            rule('Delivery', 'delivery', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Delivered', 'delivered', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Shipment', 'shipment', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Shipping', 'shipping', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Package', 'package', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Parcel', 'parcel', 'Delivery', 'Medium', 'Logistics', 24),
            rule('Arrived', 'arrived', 'Delivery', 'Medium', 'Logistics', 24),

            // Medium — Product Issue
            rule('WrongProduct', 'wrong product', 'Product Issue', 'Medium', 'Product Support', 24),
            rule('MissingItem', 'missing item', 'Product Issue', 'Medium', 'Product Support', 24),

            // Medium — Payment
            rule('Payment', 'payment', 'Payment', 'Medium', 'Payments', 24),
            rule('Charged', 'charged', 'Payment', 'Medium', 'Payments', 24),
            rule('Transaction', 'transaction', 'Payment', 'Medium', 'Payments', 24),
            rule('Card', 'card', 'Payment', 'Medium', 'Payments', 24),

            // Medium — Return
            rule('Return', 'return', 'Return', 'Medium', 'Returns', 24),
            rule('SendBack', 'send back', 'Return', 'Medium', 'Returns', 24),
            rule('ReturnProduct', 'return product', 'Return', 'Medium', 'Returns', 24),

            // Medium — Refund
            rule('Refund', 'refund', 'Refund', 'Medium', 'Finance', 24),
            rule('MoneyBack', 'money back', 'Refund', 'Medium', 'Finance', 24),
            rule('RefundPending', 'refund pending', 'Refund', 'Medium', 'Finance', 24),

            // Medium — Cancellation
            rule('Cancel', 'cancel', 'Cancellation', 'Medium', 'Order Management', 24),
            rule('Cancellation', 'cancellation', 'Cancellation', 'Medium', 'Order Management', 24),
            rule('CancelOrder', 'cancel order', 'Cancellation', 'Medium', 'Order Management', 24)
        };
    }

    private static Case_Triage_Rule__c rule(String name, String keyword, String category, String priority, String team, Integer slaHours) {
        return new Case_Triage_Rule__c(
            Name = name,
            Keyword__c = keyword,
            Category__c = category,
            Priority__c = priority,
            Team__c = team,
            SLA_Hours__c = slaHours
        );
    }
}
