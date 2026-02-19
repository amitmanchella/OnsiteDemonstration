import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  declarations: [
    HeaderComponent,
    SidebarComponent,
    DataTableComponent,
    CurrencyFormatPipe
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    DataTableComponent,
    CurrencyFormatPipe
  ]
})
export class SharedModule {}
