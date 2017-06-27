import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {VirtualScrollModule} from '../../src/api';

import {AppComponent} from './app.component';
import {ScrollWrapper} from './ScrollWrapper.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, ScrollWrapper],
  imports: [
    BrowserModule,

    VirtualScrollModule
  ]
})
export class AppModule {}
