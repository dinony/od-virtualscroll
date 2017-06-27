import {Component, Input, OnInit} from '@angular/core';

import {Observable} from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/range';

import 'rxjs/add/operator/reduce';

import {IVirtualScrollOptions, ScrollObservableService} from '../../src/api';

@Component({
  selector: 'od-scrollwrapper',
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
    </od-virtualscroll>`,
  providers: [ScrollObservableService]
})
export class ScrollWrapper {
  @Input() odId;

  constructor(private _scrollObs: ScrollObservableService) {}

  data$: Observable<number[]> = Observable.range(0, 100000).reduce((acc, cur) => { acc.push(cur); return acc; }, []);
  options$ = Observable.of({itemWidth: 202, itemHeight: 202, numAdditionalRows: 1});

  ngOnInit() {
    this._scrollObs.scrollWin$.subscribe(() => {
      console.log(`${this.odId}`);
    });
  }
}
