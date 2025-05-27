import { Routes } from '@angular/router';
import { OfficeSupplyComponentComponent } from './components/VPP/OfficeSupplyUnit/office-supply-component/office-supply-component.component';
import { OfficeSupplyRequestSummaryComponent } from './components/VPP/OfficeSupplyRequestSummary/office-supply-request-summary/office-supply-request-summary.component';
import { DailyreportComponent } from './components/dailyreport/dailyreport.component';
import { OfficeSuppliesComponent } from './components/VPP/OfficeSupplies/office-supplies.component';
import { OfficeSupplyRequestsComponent } from './components/VPP/OfficeSupplyRequests/office-supply-requests.component';
import{Test1Component} from './components/VPP/test1/test1/test1.component'
export const routes: Routes = [
    { path: 'listVPP', redirectTo: 'OfficeSupplies', pathMatch: 'full' },
    { path: 'OfficeSupplies', component: OfficeSuppliesComponent },
    { path: 'OUS', component: OfficeSupplyComponentComponent },
    { path: 'officeSupplyRequests', component: OfficeSupplyRequestsComponent },
    { path: 'officeSupplyRequestSummary', component: OfficeSupplyRequestSummaryComponent },
    { path: 'dailyreport', component: DailyreportComponent },
    {path: 'test1', component:Test1Component,  pathMatch: 'full'},
    { path: '**', redirectTo: '' },
];
