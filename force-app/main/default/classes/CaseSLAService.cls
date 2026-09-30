/**
 * Resolves SLA hours from a matched triage rule and calculates the due date.
 */
public inherited sharing class CaseSLAService {

    public static final Decimal DEFAULT_SLA_HOURS = 48;

    public static Decimal getSLAHours(Case_Triage_Rule__c rule) {
        return rule != null ? rule.SLA_Hours__c : DEFAULT_SLA_HOURS;
    }

    public static Datetime calculateDueDate(Decimal slaHours) {
        Integer hours = slaHours != null ? slaHours.intValue() : DEFAULT_SLA_HOURS.intValue();
        return Datetime.now().addHours(hours);
    }
}
