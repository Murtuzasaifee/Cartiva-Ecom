# Ticket Assignment Flow (proposed)

Automatic Case ownership assignment (Queue routing) at ticket-log time, layered onto the
existing triage pipeline. **Not yet implemented** — this documents the proposed flow and the
exact classes/methods it touches, for review before building it.

Today `CaseAssignmentService.getTeam()` only returns a team *label* (`Recommended_Team__c`
picklist value) — no `Case.OwnerId` is ever set, and no Queue/Group metadata exists in the org.
This flow adds real ownership assignment on top of that, without changing the existing
category/priority/SLA logic.

## End-to-end sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant FE as React Frontend<br/>(TicketDetail.jsx)
    participant TC as TicketController<br/>(REST /api/tickets)
    participant TS as TicketService<br/>.createTicket()
    participant SCS as SalesforceCaseService<br/>.createCaseForTicket()
    participant MAP as SalesforceMapper<br/>.toCaseFields()
    participant SF as Salesforce REST API<br/>(POST /sobjects/Case)
    participant TRG as CaseTrigger<br/>(before insert)
    participant TH as CaseTriggerHandler<br/>.beforeInsert()
    participant TRI as CaseTriageService<br/>.triageCases()
    participant CAT as CaseCategoryService<br/>.resolveRule() / .getCategory()
    participant PRI as CasePriorityService<br/>.getPriority()
    participant ASG as CaseAssignmentService<br/>.getTeam() + NEW .resolveOwnerId()
    participant SLA as CaseSLAService<br/>.getSLAHours() / .calculateDueDate()
    participant QMAP as NEW: Team_Queue_Mapping__mdt<br/>(Custom Metadata Type)
    participant DB as Case (sObject, in-memory<br/>pre-insert record)
    participant AH as CaseTriggerHandler<br/>.afterInsert()
    participant AUD as Case_Triage_Decision__c<br/>(audit insert)
    participant Q as Salesforce Queue<br/>(e.g. Queue_Logistics)

    Customer->>FE: Submit "Report an Issue" form
    FE->>TC: POST /api/tickets {subject, description, issueType}
    TC->>TS: createTicket(dto)
    TS->>TS: save Ticket (H2, status=SYNC_PENDING)
    TS->>SCS: createCaseForTicket(ticket, order, customer)
    SCS->>MAP: toCaseFields(ticket, order, customer)
    MAP-->>SCS: {Subject, Description, External_Ticket_Id__c, External_Order_Id__c, ...}
    SCS->>SF: POST /sobjects/Case (JWT Bearer auth)

    rect rgb(245, 248, 255)
    note over SF,Q: Everything below happens inside ONE Salesforce transaction,<br/>triggered by the insert above
    SF->>TRG: Case insert fires
    TRG->>TH: beforeInsert(List<Case> newCases)
    TH->>TRI: triageCases(newCases)

    loop for each new Case
        TRI->>CAT: resolveRule(subject, description)
        CAT-->>TRI: matched Case_Triage_Rule__c (or null)
        TRI->>CAT: getCategory(rule)
        CAT-->>TRI: category string
        TRI->>PRI: getPriority(rule)
        PRI-->>TRI: priority string
        TRI->>ASG: getTeam(rule)
        ASG-->>TRI: team string (e.g. "Logistics")

        rect rgb(255, 248, 235)
        note right of ASG: NEW logic
        TRI->>ASG: resolveOwnerId(team)
        ASG->>QMAP: lookup Queue DeveloperName for team
        QMAP-->>ASG: "Queue_Logistics"
        ASG->>Q: query Group WHERE Type='Queue' AND DeveloperName=:queueName
        alt queue found
            Q-->>ASG: Queue Id
        else no matching queue / unmapped team
            ASG->>Q: fallback query "Queue_General_Support"
            Q-->>ASG: fallback Queue Id
        end
        ASG-->>TRI: ownerId
        end

        TRI->>SLA: getSLAHours(rule) / calculateDueDate(hours)
        SLA-->>TRI: slaHours, slaDueDate
        TRI->>DB: set Triage_Category__c, Triage_Priority__c,<br/>Recommended_Team__c, SLA_Hours__c, SLA_Due_Date__c,<br/>Triage_Reason__c, Triage_Status__c='Triaged',<br/>NEW: OwnerId = resolved queue Id
    end

    TH->>SF: Case records committed (with OwnerId set)
    SF->>AH: afterInsert(List<Case> newCases)
    AH->>AUD: insert Case_Triage_Decision__c<br/>(Category__c, Priority__c, Team__c, Reason__c,<br/>Decision_Source__c='Trigger', NEW: Assigned_Queue__c)
    SF-->>SCS: 201 Created {id: caseId}
    end

    SCS-->>TS: caseId
    TS->>TS: ticket.salesforceCaseId = caseId, status=SUBMITTED
    TS-->>TC: TicketResponse
    TC-->>FE: 201 Created
    FE-->>Customer: "Ticket submitted" confirmation

    note over Q: Case now sits in the assigned Queue's<br/>list view — any queue member can accept it
```

## Manual override reassignment (secondary flow)

Today `CaseTriageOverrideController.applyOverride()` lets an agent change
`Recommended_Team__c` but never touches `OwnerId` — after this change the Case's actual owner
would desync from the displayed team unless override also reassigns.

```mermaid
sequenceDiagram
    autonumber
    actor Agent
    participant LWC as caseTriageDetail (LWC)<br/>.handleSaveOverride()
    participant OC as CaseTriageOverrideController<br/>.applyOverride()
    participant ASG as CaseAssignmentService<br/>.resolveOwnerId() (NEW, reused)
    participant QMAP as Team_Queue_Mapping__mdt
    participant DB as Case (update)
    participant AUD as Case_Triage_Decision__c

    Agent->>LWC: pick new Category/Priority/Team, enter Reason, Save
    LWC->>OC: applyOverride(caseId, category, priority, team, reason)
    OC->>OC: WITH SECURITY_ENFORCED query Case by Id
    OC->>ASG: resolveOwnerId(team)
    ASG->>QMAP: lookup Queue for new team
    QMAP-->>ASG: Queue Id
    ASG-->>OC: ownerId
    OC->>DB: update Case SET Triage_Category__c, Triage_Priority__c,<br/>Recommended_Team__c, Triage_Reason__c,<br/>Triage_Status__c='Manually Overridden',<br/>NEW: OwnerId = ownerId
    OC->>AUD: insert Case_Triage_Decision__c<br/>(Decision_Source__c='Manual Override')
    OC-->>LWC: success
    LWC-->>Agent: toast "Triage Overridden"
```

## Impacted files

### Core assignment logic (required)

| File | Change |
|---|---|
| `force-app/main/default/classes/CaseAssignmentService.cls` | Add `resolveOwnerId(String team)` — queries the Queue mapped to `team`, falls back to a default queue. Existing `getTeam()` unchanged. |
| `force-app/main/default/classes/CaseTriageService.cls` | Call `CaseAssignmentService.resolveOwnerId()` and set `case.OwnerId` alongside the existing field writes, pre-insert. |
| `force-app/main/default/classes/CaseTriggerHandler.cls` | `afterInsert` audit-record builder: include assigned queue on the `Case_Triage_Decision__c` row. |
| `force-app/main/default/classes/CaseTriageOverrideController.cls` | `applyOverride()` — reassign `OwnerId` when `team` changes, so manual overrides don't desync ownership from the triage decision. |

### New metadata (required)

| File | Purpose |
|---|---|
| `force-app/main/default/queues/Queue_Logistics.queue-meta.xml` (×7, one per team) | Case queues — don't exist yet anywhere in the org. |
| `force-app/main/default/objects/Team_Queue_Mapping__mdt/*` | **New** Custom Metadata Type mapping `Team__c` picklist values → Queue `DeveloperName`, so the Apex lookup isn't a hardcoded switch statement. |
| `force-app/main/default/objects/Case_Triage_Decision__c/fields/Assigned_Queue__c.field-meta.xml` | New audit field capturing which queue got the Case. |
| `force-app/main/default/permissionsets/Case_Triage_User.permissionset-meta.xml` | Add `OwnerId` field permission + queue membership/visibility (currently has neither). |

### Tests (required)

| File | Change |
|---|---|
| `force-app/main/default/classes/CaseAssignmentServiceTest.cls` | **New** — doesn't exist today; needs full coverage for `resolveOwnerId()` incl. fallback path. |
| `force-app/main/default/classes/CaseTriageServiceTest.cls` | Add `OwnerId` assertions to existing scenarios (Delivery, Payment/High, Return, Refund, bulk, override). |
| `force-app/main/default/classes/CaseTriggerHandlerTest.cls` | Assert audit record captures `Assigned_Queue__c`. |
| `force-app/main/default/classes/CaseTriageControllerTest.cls` | Assert override reassigns `OwnerId`. |

### Optional — surfacing in UI

| File | Change |
|---|---|
| `force-app/main/default/lwc/caseTriageDetail/{.js,.html}` | Show assigned queue/owner name. |
| `force-app/main/default/lwc/caseTriageDashboard/*` | Break down stats by queue. |
| `backend/.../model/Ticket.java`, `dto/TicketResponse.java`, `salesforce/SalesforceMapper.java` | Pull owner/queue name back onto the local Ticket if it should show on the customer-facing status page. |
| `frontend/src/pages/TicketDetail.jsx` | Display assigned team/queue to the customer. |
