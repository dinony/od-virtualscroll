import {Component} from '@angular/core'

import {Observable, of, range} from 'rxjs'
import {reduce} from 'rxjs/operators'

import {IVirtualScrollOptions} from '../../src/api'

@Component({
  selector: 'app-shell',
  styles: [`
    .outer-container {
      display: flex;
      height: 100vh;
      align-items: center;
      justify-content: center;
    }

    .inner-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      width: 92%;
    }

    .header {
      color: pink;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .border-wrapper {
      border: 4px dashed pink;
      flex: 1;
      overflow: hidden;
      height: 100%;
    }

    a {
      font-size: 14px;
      font-style: normal;
      text-decoration: none;
    }

    @media only screen and (max-width : 447px) {
      .header {
        display: none;
      }
    }

    .cell {
      align-items: center;
      border: 4px #b3eaff solid;
      box-sizing: border-box;
      display: inline-flex;
      height: 200px;
      justify-content: center;
      margin-right: -2px;
      position: relative;
      width: 200px;
    }

    .cell-info {
      font-size: 10px;
      position: absolute;
      right: 5px;
      text-align: right;
      top: 5px;
    }

    /deep/ .od-scroll-container {
      margin: 0 auto;
    }
  `],
  template: `
    <div class="outer-container">
      <div class="inner-container">
        <div class="header">
          <h1>od-virtualscroll</h1>
          <!--<a routerLink="/about">about &#187;</a>-->
        </div>
        <div class="border-wrapper">
          <od-virtualscroll [vsData]="data$" [vsOptions]="options$">
            <ng-template let-item let-row="row" let-column="column">
              <div class="cell">
                <div class="cell-info">
                  <span>Row: {{row}}</span><br>
                  <span>Column: {{column}}</span>
                </div>
                {{item}}
              </div>
            </ng-template>
          </od-virtualscroll>
        <div>
      </div>
    </div>`
})
export class AppComponent {
  data$: Observable<number[]> = range(0, 100000).pipe(reduce((acc, cur) => {
    acc.push(cur)
    return acc
  }, []))

  options$ = of({itemWidth: 202, itemHeight: 202, numAdditionalRows: 1})
}
