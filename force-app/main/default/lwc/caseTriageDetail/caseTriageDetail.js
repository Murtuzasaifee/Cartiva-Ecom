import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import applyOverride from '@salesforce/apex/CaseTriageOverrideController.applyOverride';
import updateFulfillmentStatus from '@salesforce/apex/CaseResolutionController.updateFulfillmentStatus';
import resolveCase from '@salesforce/apex/CaseResolutionController.resolveCase';

import EXTERNAL_ORDER_ID_FIELD from '@salesforce/schema/Case.External_Order_Id__c';
import ORDER_AMOUNT_FIELD from '@salesforce/schema/Case.Order_Amount__c';
import CATEGORY_FIELD from '@salesforce/schema/Case.Triage_Category__c';
import PRIORITY_FIELD from '@salesforce/schema/Case.Triage_Priority__c';
import TEAM_FIELD from '@salesforce/schema/Case.Recommended_Team__c';
import SLA_HOURS_FIELD from '@salesforce/schema/Case.SLA_Hours__c';
import SLA_DUE_FIELD from '@salesforce/schema/Case.SLA_Due_Date__c';
import REASON_FIELD from '@salesforce/schema/Case.Triage_Reason__c';
import STATUS_FIELD from '@salesforce/schema/Case.Triage_Status__c';
import FULFILLMENT_STATUS_FIELD from '@salesforce/schema/Case.Fulfillment_Status__c';
import RESOLUTION_FIELD from '@salesforce/schema/Case.Resolution__c';

// Spanning field: uiRecordApi requires this as a literal string, not a schema import,
// and must be read back via nested record.fields access — getFieldValue() doesn't support it.
const CONTACT_NAME_FIELD = 'Case.Contact.Name';

const FIELDS = [
    CONTACT_NAME_FIELD,
    EXTERNAL_ORDER_ID_FIELD,
    ORDER_AMOUNT_FIELD,
    CATEGORY_FIELD,
    PRIORITY_FIELD,
    TEAM_FIELD,
    SLA_HOURS_FIELD,
    SLA_DUE_FIELD,
    REASON_FIELD,
    STATUS_FIELD,
    FULFILLMENT_STATUS_FIELD,
    RESOLUTION_FIELD
];

const CATEGORY_OPTIONS = ['Delivery', 'Product Issue', 'Payment', 'Return', 'Refund', 'Cancellation', 'General'].map(
    (v) => ({ label: v, value: v })
);
const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'].map((v) => ({ label: v, value: v }));
const TEAM_OPTIONS = [
    'Logistics',
    'Product Support',
    'Payments',
    'Returns',
    'Finance',
    'Order Management',
    'General Support'
].map((v) => ({ label: v, value: v }));
const FULFILLMENT_STATUS_OPTIONS = [
    'New',
    'Triaged',
    'Assigned',
    'In Progress',
    'Waiting for Customer',
    'Resolved'
].map((v) => ({ label: v, value: v }));

export default class CaseTriageDetail extends LightningElement {
    @api recordId;

    isOverrideOpen = false;
    overrideCategory;
    overridePriority;
    overrideTeam;
    overrideReason = '';
    isSaving = false;

    resolutionText = '';
    isResolving = false;

    categoryOptions = CATEGORY_OPTIONS;
    priorityOptions = PRIORITY_OPTIONS;
    teamOptions = TEAM_OPTIONS;
    fulfillmentStatusOptions = FULFILLMENT_STATUS_OPTIONS;

    wiredCaseResult;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredCase(result) {
        this.wiredCaseResult = result;
        if (result.data) {
            this.resolutionText = getFieldValue(result.data, RESOLUTION_FIELD) || '';
        }
    }

    get customerName() {
        const contact = this.wiredCaseResult.data?.fields?.Contact?.value;
        return contact ? contact.fields.Name.value : null;
    }
    get externalOrderId() {
        return getFieldValue(this.wiredCaseResult.data, EXTERNAL_ORDER_ID_FIELD);
    }
    get orderAmount() {
        return getFieldValue(this.wiredCaseResult.data, ORDER_AMOUNT_FIELD);
    }
    get category() {
        return getFieldValue(this.wiredCaseResult.data, CATEGORY_FIELD);
    }
    get priority() {
        return getFieldValue(this.wiredCaseResult.data, PRIORITY_FIELD);
    }
    get team() {
        return getFieldValue(this.wiredCaseResult.data, TEAM_FIELD);
    }
    get slaHours() {
        return getFieldValue(this.wiredCaseResult.data, SLA_HOURS_FIELD);
    }
    get slaDueDate() {
        return getFieldValue(this.wiredCaseResult.data, SLA_DUE_FIELD);
    }
    get reason() {
        return getFieldValue(this.wiredCaseResult.data, REASON_FIELD);
    }
    get status() {
        return getFieldValue(this.wiredCaseResult.data, STATUS_FIELD);
    }
    get fulfillmentStatus() {
        return getFieldValue(this.wiredCaseResult.data, FULFILLMENT_STATUS_FIELD);
    }
    get hasData() {
        return Boolean(this.wiredCaseResult && this.wiredCaseResult.data);
    }

    handleOpenOverride() {
        this.overrideCategory = this.category;
        this.overridePriority = this.priority;
        this.overrideTeam = this.team;
        this.overrideReason = '';
        this.isOverrideOpen = true;
    }

    handleCancelOverride() {
        this.isOverrideOpen = false;
    }

    handleCategoryChange(event) {
        this.overrideCategory = event.detail.value;
    }

    handlePriorityChange(event) {
        this.overridePriority = event.detail.value;
    }

    handleTeamChange(event) {
        this.overrideTeam = event.detail.value;
    }

    handleReasonChange(event) {
        this.overrideReason = event.detail.value;
    }

    get isSaveDisabled() {
        return this.isSaving || !this.overrideCategory || !this.overridePriority || !this.overrideTeam || !this.overrideReason;
    }

    async handleSaveOverride() {
        this.isSaving = true;
        try {
            await applyOverride({
                caseId: this.recordId,
                category: this.overrideCategory,
                priority: this.overridePriority,
                team: this.overrideTeam,
                reason: this.overrideReason
            });
            this.isOverrideOpen = false;
            await refreshApex(this.wiredCaseResult);
            this.showToast('Triage Overridden', 'The Case triage decision was updated.', 'success');
        } catch (error) {
            this.showToast('Override Failed', this.extractErrorMessage(error), 'error');
        } finally {
            this.isSaving = false;
        }
    }

    async handleFulfillmentStatusChange(event) {
        const newStatus = event.detail.value;
        try {
            await updateFulfillmentStatus({ caseId: this.recordId, fulfillmentStatus: newStatus });
            await refreshApex(this.wiredCaseResult);
            this.showToast('Status Updated', 'Fulfillment status set to ' + newStatus + '.', 'success');
        } catch (error) {
            this.showToast('Status Update Failed', this.extractErrorMessage(error), 'error');
        }
    }

    handleResolutionChange(event) {
        this.resolutionText = event.detail.value;
    }

    get isResolveDisabled() {
        return this.isResolving || !this.resolutionText;
    }

    async handleResolveCase() {
        this.isResolving = true;
        try {
            await resolveCase({ caseId: this.recordId, resolution: this.resolutionText });
            await refreshApex(this.wiredCaseResult);
            this.showToast('Case Resolved', 'The customer will see this resolution.', 'success');
        } catch (error) {
            this.showToast('Resolve Failed', this.extractErrorMessage(error), 'error');
        } finally {
            this.isResolving = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    extractErrorMessage(error) {
        return error && error.body ? error.body.message : error.message;
    }
}
