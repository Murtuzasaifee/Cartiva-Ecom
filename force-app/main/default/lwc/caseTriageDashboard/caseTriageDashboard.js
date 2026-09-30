import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getDashboardStats from '@salesforce/apex/CaseTriageDashboardController.getDashboardStats';
import getRecentCases from '@salesforce/apex/CaseTriageDashboardController.getRecentCases';

const COLUMNS = [
    { label: 'Case', fieldName: 'CaseNumber' },
    { label: 'Subject', fieldName: 'Subject' },
    { label: 'Category', fieldName: 'Triage_Category__c' },
    { label: 'Priority', fieldName: 'Triage_Priority__c' },
    { label: 'Team', fieldName: 'Recommended_Team__c' },
    { label: 'Status', fieldName: 'Triage_Status__c' }
];

export default class CaseTriageDashboard extends LightningElement {
    columns = COLUMNS;
    stats = { totalCases: 0, triagedCount: 0, pendingCount: 0, overriddenCount: 0 };
    cases = [];
    error;

    wiredStatsResult;
    wiredCasesResult;

    @wire(getDashboardStats)
    wiredStats(result) {
        this.wiredStatsResult = result;
        if (result.data) {
            this.stats = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }

    @wire(getRecentCases)
    wiredCases(result) {
        this.wiredCasesResult = result;
        if (result.data) {
            this.cases = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }

    handleRefresh() {
        refreshApex(this.wiredStatsResult);
        refreshApex(this.wiredCasesResult);
    }
}
