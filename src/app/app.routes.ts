import { Routes } from '@angular/router';
import { OfficeSupplyComponentComponent } from './components/VPP/OfficeSupplyUnit/office-supply-component/office-supply-component.component';
import { DangkyVppComponent } from './components/VPP/DangkyVPP/dangky-vpp/dangky-vpp.component'
import { OfficeSupplyRequestSummaryComponent } from './components/VPP/OfficeSupplyRequestSummary/office-supply-request-summary/office-supply-request-summary.component';
import { DailyreportComponent } from './components/dailyreport/dailyreport.component';
import { OfficeSuppliesComponent } from './components/VPP/OfficeSupplies/office-supplies.component'

export const routes: Routes = [
    { path: 'listVPP', redirectTo: 'OfficeSupplies', pathMatch: 'full' },
    { path: 'OfficeSupplies', component: OfficeSuppliesComponent },
    { path: 'OUS', component: OfficeSupplyComponentComponent },
    { path: 'dkVPP', component: DangkyVppComponent },
    { path: 'officeSupplyRequestSummary', component: OfficeSupplyRequestSummaryComponent },
    { path: 'dailyreport', component: DailyreportComponent },
    { path: '**', redirectTo: '' },
];
