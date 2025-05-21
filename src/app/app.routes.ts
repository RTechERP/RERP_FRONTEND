import { Routes } from '@angular/router';
import { ListVPPComponent } from './components/VPP/list-vpp/list-vpp.component';
import { OfficeSupplyComponentComponent } from './components/VPP/OfficeSupplyUnit/office-supply-component/office-supply-component.component';
import { DangkyVppComponent } from './components/VPP/DangkyVPP/dangky-vpp/dangky-vpp.component'
import { OfficeSupplyRequestSummaryComponent } from './components/VPP/OfficeSupplyRequestSummary/office-supply-request-summary/office-supply-request-summary.component';
import { DailyreportComponent } from './components/dailyreport/dailyreport.component';
export const routes: Routes = [

    { path: 'listVPP', component: ListVPPComponent },
    { path: 'OUS', component: OfficeSupplyComponentComponent },
    { path: 'dkVPP', component: DangkyVppComponent },
    { path: 'officeSupplyRequestSummary', component: OfficeSupplyRequestSummaryComponent },
    { path: 'dailyreport', component: DailyreportComponent },
    { path: '**', redirectTo: '' },
];
