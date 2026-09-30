/**
 * Thin trigger — all business logic lives in CaseTriggerHandler / CaseTriageService.
 */
trigger CaseTrigger on Case (before insert, after insert) {
    if (Trigger.isBefore && Trigger.isInsert) {
        CaseTriggerHandler.beforeInsert(Trigger.new);
    }
    if (Trigger.isAfter && Trigger.isInsert) {
        CaseTriggerHandler.afterInsert(Trigger.new);
    }
}
