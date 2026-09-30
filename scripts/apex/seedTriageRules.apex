// Seeds the Cartiva keyword rules for the Case Triage rule engine.
// Run once after deploy: sf apex run --file scripts/apex/seedTriageRules.apex -o <org-alias>
// Safe to re-run: deletes and re-inserts so rule-table edits in this file take effect.

delete [SELECT Id FROM Case_Triage_Rule__c];

List<Case_Triage_Rule__c> rules = new List<Case_Triage_Rule__c>{
    new Case_Triage_Rule__c(Name = 'Fraud', Keyword__c = 'fraud', Category__c = 'Payment', Priority__c = 'Critical', Team__c = 'Payments', SLA_Hours__c = 2),
    new Case_Triage_Rule__c(Name = 'Unauthorized', Keyword__c = 'unauthorized', Category__c = 'Payment', Priority__c = 'Critical', Team__c = 'Payments', SLA_Hours__c = 2),

    new Case_Triage_Rule__c(Name = 'Delayed', Keyword__c = 'delayed', Category__c = 'Delivery', Priority__c = 'High', Team__c = 'Logistics', SLA_Hours__c = 8),
    new Case_Triage_Rule__c(Name = 'Late', Keyword__c = 'late', Category__c = 'Delivery', Priority__c = 'High', Team__c = 'Logistics', SLA_Hours__c = 8),
    new Case_Triage_Rule__c(Name = 'Damaged', Keyword__c = 'damaged', Category__c = 'Product Issue', Priority__c = 'High', Team__c = 'Product Support', SLA_Hours__c = 8),
    new Case_Triage_Rule__c(Name = 'Broken', Keyword__c = 'broken', Category__c = 'Product Issue', Priority__c = 'High', Team__c = 'Product Support', SLA_Hours__c = 8),
    new Case_Triage_Rule__c(Name = 'Defective', Keyword__c = 'defective', Category__c = 'Product Issue', Priority__c = 'High', Team__c = 'Product Support', SLA_Hours__c = 8),
    new Case_Triage_Rule__c(Name = 'PaymentFailed', Keyword__c = 'payment failed', Category__c = 'Payment', Priority__c = 'High', Team__c = 'Payments', SLA_Hours__c = 4),

    new Case_Triage_Rule__c(Name = 'Delivery', Keyword__c = 'delivery', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Delivered', Keyword__c = 'delivered', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Shipment', Keyword__c = 'shipment', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Shipping', Keyword__c = 'shipping', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Package', Keyword__c = 'package', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Parcel', Keyword__c = 'parcel', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Arrived', Keyword__c = 'arrived', Category__c = 'Delivery', Priority__c = 'Medium', Team__c = 'Logistics', SLA_Hours__c = 24),

    new Case_Triage_Rule__c(Name = 'WrongProduct', Keyword__c = 'wrong product', Category__c = 'Product Issue', Priority__c = 'Medium', Team__c = 'Product Support', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'MissingItem', Keyword__c = 'missing item', Category__c = 'Product Issue', Priority__c = 'Medium', Team__c = 'Product Support', SLA_Hours__c = 24),

    new Case_Triage_Rule__c(Name = 'Payment', Keyword__c = 'payment', Category__c = 'Payment', Priority__c = 'Medium', Team__c = 'Payments', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Charged', Keyword__c = 'charged', Category__c = 'Payment', Priority__c = 'Medium', Team__c = 'Payments', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Transaction', Keyword__c = 'transaction', Category__c = 'Payment', Priority__c = 'Medium', Team__c = 'Payments', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Card', Keyword__c = 'card', Category__c = 'Payment', Priority__c = 'Medium', Team__c = 'Payments', SLA_Hours__c = 24),

    new Case_Triage_Rule__c(Name = 'Return', Keyword__c = 'return', Category__c = 'Return', Priority__c = 'Medium', Team__c = 'Returns', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'SendBack', Keyword__c = 'send back', Category__c = 'Return', Priority__c = 'Medium', Team__c = 'Returns', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'ReturnProduct', Keyword__c = 'return product', Category__c = 'Return', Priority__c = 'Medium', Team__c = 'Returns', SLA_Hours__c = 24),

    new Case_Triage_Rule__c(Name = 'Refund', Keyword__c = 'refund', Category__c = 'Refund', Priority__c = 'Medium', Team__c = 'Finance', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'MoneyBack', Keyword__c = 'money back', Category__c = 'Refund', Priority__c = 'Medium', Team__c = 'Finance', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'RefundPending', Keyword__c = 'refund pending', Category__c = 'Refund', Priority__c = 'Medium', Team__c = 'Finance', SLA_Hours__c = 24),

    new Case_Triage_Rule__c(Name = 'Cancel', Keyword__c = 'cancel', Category__c = 'Cancellation', Priority__c = 'Medium', Team__c = 'Order Management', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'Cancellation', Keyword__c = 'cancellation', Category__c = 'Cancellation', Priority__c = 'Medium', Team__c = 'Order Management', SLA_Hours__c = 24),
    new Case_Triage_Rule__c(Name = 'CancelOrder', Keyword__c = 'cancel order', Category__c = 'Cancellation', Priority__c = 'Medium', Team__c = 'Order Management', SLA_Hours__c = 24)
};
insert rules;
System.debug('Seeded ' + rules.size() + ' Case Triage Rules.');
