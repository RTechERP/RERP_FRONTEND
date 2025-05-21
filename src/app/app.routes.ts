import { Routes } from '@angular/router';
import { AssetsManagementComponent } from './components/assetsmanagement/LoadTSAssetManagement/AssetsManagement/AssetsManagement.component';
import { TypeAssetsComponent } from './components/assetsmanagement/TypeAssets/TypeAssets.component';
import { AssetsComponent } from './components/assetsmanagement/AssetsResouse/assets.component';
import { UnitManagementComponent } from './components/assetsmanagement/UnitManagement/UnitManagement.component';
import { AssetManagementHistoryComponent } from './components/assetsmanagement/BorrowAssets/AssetManagementHistory/AssetManagementHistory.component';
import { TransferAssetsComponent } from './components/assetsmanagement/BorrowAssets/TransferAssets/TransferAssets.component';
import { AssetAllocationComponent } from './components/assetsmanagement/AssetAllocation/AssetAllocation.component';
import { AssetStatusComponent } from './components/assetsmanagement/AssetStatus/AssetStatus.component';
import { TSReportBrokenAssetComponent } from './components/assetsmanagement/TSReportBrokenAsset/TSReportBrokenAsset.component';
export const routes: Routes = [
  { path: 'assetsmanagement', component: AssetsManagementComponent },
  { path: 'typeassets', component: TypeAssetsComponent },
  { path: 'AssetManagementHistory', component: AssetManagementHistoryComponent },
  { path: 'TransferAssets', component: TransferAssetsComponent },
  { path: 'assetsresouce', component: AssetsComponent },
  { path: 'assetallocation', component: AssetAllocationComponent },
    { path: 'assetstatus', component: AssetStatusComponent},
        { path: 'reportbroken', component: TSReportBrokenAssetComponent},
  { path: 'unitmanagement', component: UnitManagementComponent }
];
