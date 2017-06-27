import {Component} from '@angular/core';

@Component({
  selector: 'app-shell',
  styles: [`
    .wrapper {
      display: block;
      height: 300px;
      margin-bottom: 20px;
    }`
  ],
  template: `
    <od-scrollwrapper [odId]="'wrapper0'" class="wrapper"></od-scrollwrapper>
    <od-scrollwrapper [odId]="'wrapper1'" class="wrapper"></od-scrollwrapper>`
})
export class AppComponent {
}
