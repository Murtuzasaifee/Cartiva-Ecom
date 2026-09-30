/**
 * Immutable value object holding the outcome of the rule engine for a single Case.
 */
public class CaseTriageResult {
    public String category { get; private set; }
    public String priority { get; private set; }
    public String team { get; private set; }
    public Decimal slaHours { get; private set; }
    public Datetime slaDueDate { get; private set; }
    public String reason { get; private set; }

    public CaseTriageResult(String category, String priority, String team, Decimal slaHours, Datetime slaDueDate, String reason) {
        this.category = category;
        this.priority = priority;
        this.team = team;
        this.slaHours = slaHours;
        this.slaDueDate = slaDueDate;
        this.reason = reason;
    }
}
