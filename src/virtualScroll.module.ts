import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ScrollObservableService} from './service';
import {VirtualRowComponent} from './virtualRow.component';
import {VirtualScrollComponent} from './virtualScroll.component';

@NgModule({
  declarations: [VirtualRowComponent, VirtualScrollComponent],
  entryComponents: [VirtualRowComponent],
  exports: [VirtualScrollComponent],
  imports: [CommonModule],
  providers: [ScrollObservableService],
})
export class VirtualScrollModule { }
