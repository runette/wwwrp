import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SbpSidebarComponent} from './sbp-sidebar/sbp-sidebar.component';
import {SbpPhotoComponent} from './sbp-photo/sbp-photo.component';
import {SbpInventoryComponent} from './sbp-inventory/sbp-inventory.component'
 
const routes: Routes = [
  { path: '', component: SbpSidebarComponent },
  { path: 'photo', component:SbpPhotoComponent},
  { path: 'inventory', component:SbpInventoryComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
