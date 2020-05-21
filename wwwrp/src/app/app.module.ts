import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SbpOlMapComponent } from './sbp-ol-map/sbp-ol-map.component';
import { SbpSidebarComponent } from './sbp-sidebar/sbp-sidebar.component';
import { SbpLocateComponent } from './sbp-locate/sbp-locate.component';
import { SbpPopupComponent } from './sbp-popup/sbp-popup.component';
import {MatCardModule} from '@angular/material/card';
import { SbpSettingsComponent } from './sbp-settings/sbp-settings.component';
import { SbpInventoryComponent } from './sbp-inventory/sbp-inventory.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SbpPhotoComponent } from './sbp-photo/sbp-photo.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatMenuModule} from '@angular/material/menu';
import {LayoutModule} from '@angular/cdk/layout';


@NgModule({
  declarations: [
    AppComponent,
    SbpOlMapComponent,
    SbpSidebarComponent,
    SbpLocateComponent,
    SbpPopupComponent,
    SbpSettingsComponent,
    SbpInventoryComponent,
    SbpPhotoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatButtonModule,
    FlexLayoutModule,
    HttpClientModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatIconModule,
    MatGridListModule,
    MatChipsModule,
    MatMenuModule,
    LayoutModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
