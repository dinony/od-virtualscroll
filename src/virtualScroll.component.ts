import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ComponentFactory, ComponentFactoryResolver, ContentChild,
  ElementRef, Input, OnDestroy, OnInit,
  TemplateRef, ViewChild,
  ViewContainerRef, NgZone
} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

import {combineLatest} from 'rxjs/observable/combineLatest';
import {concat} from 'rxjs/observable/concat';
import {empty} from 'rxjs/observable/empty';
import {from} from 'rxjs/observable/from';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {of} from 'rxjs/observable/of';

import {concatMap} from 'rxjs/operators/concatMap';
import {debounceTime} from 'rxjs/operators/debounceTime';
import {distinctUntilChanged} from 'rxjs/operators/distinctUntilChanged';
import {filter} from 'rxjs/operators/filter';
import {map} from 'rxjs/operators/map';
import {mergeMap} from 'rxjs/operators/mergeMap';
import {pairwise} from 'rxjs/operators/pairwise';
import {partition} from 'rxjs/operators/partition';
import {publish} from 'rxjs/operators/publish';
import {scan} from 'rxjs/operators/scan';
import {startWith} from 'rxjs/operators/startWith';
import {withLatestFrom} from 'rxjs/operators/withLatestFrom';

import {IVirtualScrollOptions, IVirtualScrollState} from './basic';
import {IVirtualScrollMeasurement, IVirtualScrollWindow} from './basic';
import {
  CmdOption, CreateItemCmd, CreateRowCmd,
  NoopCmd,  RemoveItemCmd, RemoveRowCmd,
  ShiftRowCmd, UpdateItemCmd
} from './cmd';
import {forColumnsIn, forColumnsInWithPrev, forRowsIn} from './enumerate';
import {calcMeasure, calcScrollWindow, getMaxIndex} from './measurement';
import {ScrollItem} from './scrollItem';
import {ScrollObservableService} from './service';
import {difference, intersection, isEmpty} from './set';
import {
  FocusItemCmd, FocusRowCmd, IUserCmd,
  SetScrollTopCmd, UserCmdOption
} from './userCmd';
import {VirtualRowComponent} from './virtualRow.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'od-virtualscroll',
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow-y: scroll;
    }

    .od-scroll-container {
      position: relative;
      width: 100%;
    }
  `],
  template: `
    <div class="od-scroll-container" [style.width]="width" [style.height.px]="height">
      <div #viewRef><div>
    </div>`,
})
export class VirtualScrollComponent implements OnInit, OnDestroy {
  @ContentChild(TemplateRef) private _templateRef: TemplateRef<ScrollItem>;
  @ViewChild('viewRef', {read: ViewContainerRef}) private _viewContainer: ViewContainerRef;

  @Input() vsData: Observable<any[]> = empty();
  @Input() vsOptions: Observable<IVirtualScrollOptions> = empty();
  @Input() vsResize: Observable<any> = empty();
  @Input() vsUserCmd: Observable<IUserCmd> = empty();
  @Input() vsDebounceTime: number = 0;
  @Input() vsEqualsFunc: (prevIndex: number, curIndex: number) => boolean = (prevIndex, curIndex) => prevIndex === curIndex;

  height = 0;
  width = '0px';

  private _rowFactory: ComponentFactory<VirtualRowComponent> = this._componentFactoryResolver.resolveComponentFactory(VirtualRowComponent);

  private _subs: Subscription[] = [];

  constructor(
    private _elem: ElementRef, private _cdr: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver, private _obsService: ScrollObservableService,
    private _zone: NgZone) {}

  private publish<T> (source: Observable<T>) : ConnectableObservable<T> {
    return publish<T>()(source);
  }

  ngOnInit() {
    const getContainerRect = () => this._elem.nativeElement.getBoundingClientRect();

    const getScrollTop = () => this._elem.nativeElement.scrollTop;

    const setScrollTop = (scrollTop: number) => { this._elem.nativeElement.scrollTop = scrollTop; };

    const initData: any[] = [];

    const data$ = this.publish(this.vsData.pipe(startWith(initData)));

    const defaultOptions = {itemWidth: 100, itemHeight: 100, numAdditionalRows: 1};

    const options$ = this.publish(this.vsOptions.pipe(startWith(defaultOptions)));

    const rect$ = merge(fromEvent(window, 'resize'), this.vsResize).pipe(
      debounceTime(this.vsDebounceTime, animationScheduler),
      map(() => getContainerRect()),
      startWith(getContainerRect()),
      map(({width, height}) => ({width, height}))
    );

    const scroll$ = new Subject<void>();
    this._zone.runOutsideAngular(() => {
      this._subs.push(
        fromEvent(this._elem.nativeElement, 'scroll').pipe(
          debounceTime(this.vsDebounceTime, animationScheduler)
        ).subscribe(() => {
          this._zone.run(() => scroll$.next())
        })
      )
    });

    const scrollTop$ = scroll$.pipe(
      map(() => getScrollTop()),
      startWith(0)
    );

    const measure$ = this.publish(combineLatest(data$, rect$, options$).pipe(
      mergeMap(async ([data, rect, options]) => {
        const measurement = await calcMeasure(data, rect, options);

        return {
          dataLength: data.length,
          dataTimestamp: (new Date()).getTime(),
          measurement
        };
      })
    ));

    const scrollWin$ = this.publish(combineLatest(scrollTop$, measure$, options$).pipe(
      map(([scrollTop, {dataLength, dataTimestamp, measurement}, options]) => calcScrollWindow(scrollTop, measurement, dataLength, dataTimestamp, options)),
      distinctUntilChanged((prevWin, curWin) => {
        return prevWin.visibleStartRow === curWin.visibleStartRow &&
          prevWin.visibleEndRow === curWin.visibleEndRow &&
          prevWin.numActualColumns === curWin.numActualColumns &&
          prevWin.numVirtualItems === curWin.numVirtualItems &&
          prevWin.dataTimestamp === curWin.dataTimestamp;
      })
    ));

    const dScrollWin$ = scrollWin$.pipe(pairwise());

    const renderCmd$ = this.publish(dScrollWin$.pipe(concatMap(([prevWin, curWin]) => {
      let rowsDiffCmd$ = of(new NoopCmd());
      let rowsUpdateCmd$ = of(new NoopCmd());

      const prevIndexMap = {};
      const curIndexMap = {};

      // abs: prevent iterating when prevWin has -1 -> -1
      forRowsIn(Math.abs(prevWin.visibleStartRow), prevWin.visibleEndRow, prevWin.numActualRows, (row, index) => {
        prevIndexMap[index] = row;
      });

      // abs: prevent iterating when curWin has -1 -> -1
      forRowsIn(Math.abs(curWin.visibleStartRow), curWin.visibleEndRow, curWin.numActualRows, (row, index) => {
        curIndexMap[index] = row;
      });

      const removeRowsMap = difference(prevIndexMap, curIndexMap);
      const createRowsMap = difference(curIndexMap, prevIndexMap);

      if(!isEmpty(removeRowsMap)) {
        const removeRowCmds: RemoveRowCmd[] = [];
        const removeItemCmds: RemoveItemCmd[] = [];

        for(const key in removeRowsMap) {
          const rowIndex = parseInt(key, 10);
          const row = removeRowsMap[key];
          removeRowCmds.push(new RemoveRowCmd(row, rowIndex));

          forColumnsIn(0, prevWin.numActualColumns - 1, row, prevWin.numActualColumns, prevWin.numVirtualItems, (c, dataIndex) => {
            removeItemCmds.push(new RemoveItemCmd(row, rowIndex, c, dataIndex));
          });
        }

        rowsDiffCmd$ = concat(from(removeItemCmds.reverse()), from(removeRowCmds));
      } else if(!isEmpty(createRowsMap)) {
        const createRowCmds: CreateRowCmd[] = [];
        const createItemCmds: CreateItemCmd[] = [];

        for(const key in createRowsMap) {
          const rowIndex = parseInt(key, 10);
          const row = createRowsMap[key];

          createRowCmds.push(new CreateRowCmd(row, rowIndex, curWin.rowShifts !== undefined ? curWin.rowShifts[row] : typeof curWin.itemHeight === 'number' ? row * curWin.itemHeight : 0));

          forColumnsIn(0, curWin.numActualColumns - 1, row, curWin.numActualColumns, curWin.numVirtualItems, (c, dataIndex) => {
            createItemCmds.push(new CreateItemCmd(row, rowIndex, c, dataIndex));
          });
        }

        rowsDiffCmd$ = concat(from(createRowCmds), from(createItemCmds));
      }

      const existingRows = intersection(prevIndexMap, curIndexMap);

      if(!isEmpty(existingRows)) {
        const shiftRowCmds: ShiftRowCmd[] = [];
        const createItemCmds: CreateItemCmd[] = [];
        const removeItemCmds: RemoveItemCmd[] = [];
        const updateItemCmds: UpdateItemCmd[] = [];
        const columnDiffCreateItemCmds: CreateItemCmd[] = [];
        const columnDiffRemoveItemCmds: RemoveItemCmd[] = [];

        const columnsDiffStart = Math.min(prevWin.numActualColumns, curWin.numActualColumns);
        const numColumns = curWin.numActualColumns - prevWin.numActualColumns;

        for(const key in existingRows) {
          const rowIndex = parseInt(key, 10);
          const prevRow = existingRows[key].left;
          const row = existingRows[key].right;

          if(row !== prevRow) {
            shiftRowCmds.push(new ShiftRowCmd(row, rowIndex, curWin.rowShifts !== undefined ? curWin.rowShifts[row] : typeof curWin.itemHeight === 'number' ? row * curWin.itemHeight : 0));
          }

          if(row !== prevRow || numColumns !== 0 || prevWin.numVirtualItems <= getMaxIndex(prevWin) || curWin.numVirtualItems <= getMaxIndex(curWin) || prevWin.dataTimestamp !== curWin.dataTimestamp) {
            forColumnsInWithPrev(0, columnsDiffStart - 1, row, curWin.numActualColumns, prevRow, prevWin.numActualColumns, (c, dataIndex, prevDataIndex) => {
              if(dataIndex >= curWin.numVirtualItems && prevDataIndex < prevWin.numVirtualItems) {
                removeItemCmds.push(new RemoveItemCmd(row, rowIndex, c, prevDataIndex));
              } else if(dataIndex < curWin.numVirtualItems && prevDataIndex >= prevWin.numVirtualItems) {
                createItemCmds.push(new CreateItemCmd(row, rowIndex, c, dataIndex));
              } else if(dataIndex < curWin.numVirtualItems && prevDataIndex < prevWin.numVirtualItems && !this.vsEqualsFunc(prevDataIndex, dataIndex)) {
                updateItemCmds.push(new UpdateItemCmd(row, rowIndex, c, dataIndex));
              }
            });
          }

          if(numColumns > 0) {
            forColumnsIn(columnsDiffStart, curWin.numActualColumns - 1, row, curWin.numActualColumns, curWin.numVirtualItems, (c, dataIndex) => {
              columnDiffCreateItemCmds.push(new CreateItemCmd(row, rowIndex, c, dataIndex));
            });
          } else if(numColumns < 0) {
            forColumnsIn(columnsDiffStart, prevWin.numActualColumns - 1, prevRow, prevWin.numActualColumns, prevWin.numVirtualItems, (c, dataIndex) => {
              columnDiffRemoveItemCmds.push(new RemoveItemCmd(prevRow, rowIndex, c, dataIndex));
            });
          }
        }

        rowsUpdateCmd$ = concat(
          merge(from(removeItemCmds.reverse()), from(createItemCmds), from(updateItemCmds), from(shiftRowCmds)),
          merge(from(columnDiffRemoveItemCmds.reverse()), from(columnDiffCreateItemCmds)));
      }

      return merge(rowsDiffCmd$, rowsUpdateCmd$);
    })));

    const updateScrollWinFunc$ = scrollWin$.pipe(map(scrollWindow => (state: IVirtualScrollState) => {
      state.scrollWindow = scrollWindow;

      this._obsService.emitScrollWin([scrollWindow]);

      state.needsCheck = true;
      return state;
    }));

    const createRowFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.CreateRow),
      map((cmd: CreateRowCmd) => (state: IVirtualScrollState) => {
        const newRow = this._viewContainer.createComponent(this._rowFactory);
        newRow.instance.setTransform(cmd.initShift);
        state.rows[cmd.actualIndex] = newRow;

        this._obsService.emitCreateRow([cmd, newRow]);

        state.needsCheck = false;
        return state;
      })
    );

    const removeRowFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.RemoveRow),
      map((cmd: RemoveRowCmd) => (state: IVirtualScrollState) => {
        const rowComp = state.rows[cmd.actualIndex];
        rowComp.destroy();
        delete state.rows[cmd.actualIndex];

        this._obsService.emitRemoveRow([cmd, rowComp]);

        state.needsCheck = false;
        return state;
      })
    );

    const shiftRowFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.ShiftRow),
      map(cmd => (state: IVirtualScrollState) => {
        const shift = cmd as ShiftRowCmd;
        const row = state.rows[shift.actualIndex];
        row.instance.updateRow(shift.virtualIndex);
        row.instance.setTransform(shift.shift);

        this._obsService.emitShiftRow([shift, row]);

        state.needsCheck = false;
        return state;
      })
    );

    const createItemFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.CreateItem),
      withLatestFrom(data$),
      map(([cmd, data]) => (state: IVirtualScrollState) => {
        const createItem = cmd as CreateItemCmd;
        const item = new ScrollItem(data[createItem.dataIndex], createItem.virtualIndex, createItem.columnIndex);
        const viewRef = state.rows[createItem.actualIndex].instance.addItem(this._templateRef, item);

        this._obsService.emitCreateItem([createItem, item, viewRef]);

        state.needsCheck = false;
        return state;
      })
    );

    const updateItemFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.UpdateItem),
      withLatestFrom(data$),
      map(([cmd, data]) => (state: IVirtualScrollState) => {
        const update = cmd as UpdateItemCmd;
        const item = data[update.dataIndex];
        const viewRef = state.rows[update.actualIndex].instance.updateItem(update.columnIndex, item);

        this._obsService.emitUpdateItem([update, item, viewRef]);

        state.needsCheck = false;
        return state;
      })
    );

    const removeItemFunc$ = renderCmd$.pipe(
      filter(cmd => cmd.cmdType === CmdOption.RemoveItem),
      map((cmd: RemoveItemCmd) => (state: IVirtualScrollState) => {
        const comp = state.rows[cmd.actualIndex];
        comp.instance.removeItem(cmd.columnIndex);

        this._obsService.emitRemoveItem([cmd]);

        state.needsCheck = false;
        return state;
      })
    );

    const userCmd$ = this.publish(this.vsUserCmd);

    const userSetScrollTop$ = userCmd$.pipe(filter(cmd => cmd.cmdType === UserCmdOption.SetScrollTop));

    const focusRowSetScrollTop$ = userCmd$.pipe(
      filter(cmd => cmd.cmdType === UserCmdOption.FocusRow),
      withLatestFrom(scrollWin$),
      map(([cmd, scrollWin]) => {
        const focusRow = cmd as FocusRowCmd;
        return new SetScrollTopCmd(scrollWin.rowShifts !== undefined ? scrollWin.rowShifts[focusRow.rowIndex] : typeof scrollWin.itemHeight === 'number' ? (focusRow.rowIndex * scrollWin.itemHeight) : 0);
      })
    );

    const focusItemSetScrollTop$ = userCmd$.pipe(
      filter(cmd => cmd.cmdType === UserCmdOption.FocusItem),
      withLatestFrom(scrollWin$),
      map(([cmd, scrollWin]) => {
        const focusItem = cmd as FocusItemCmd;
        return new SetScrollTopCmd(scrollWin.rowShifts !== undefined ? scrollWin.rowShifts[focusItem.itemIndex] : typeof scrollWin.itemHeight === 'number' ? (Math.floor(focusItem.itemIndex / scrollWin.numActualColumns) * scrollWin.itemHeight) : 0);
      })
    );

    const setScrollTopFunc$ = merge(userSetScrollTop$, focusRowSetScrollTop$, focusItemSetScrollTop$).pipe(
      map((cmd: SetScrollTopCmd) => (state: IVirtualScrollState) => {
        setScrollTop(cmd.value);

        state.needsCheck = false;
        return state;
      })
    );

    const scanFunc = (state: IVirtualScrollState, changeFn: (state: IVirtualScrollState) => IVirtualScrollState): IVirtualScrollState => changeFn(state);

    // Update store
    const main$: Observable<IVirtualScrollState> = merge(
        createRowFunc$, removeRowFunc$, shiftRowFunc$,
        createItemFunc$, removeItemFunc$, updateItemFunc$,
        updateScrollWinFunc$, setScrollTopFunc$)
      .pipe(scan(scanFunc, {measurement: null, scrollWindow: null, rows: {}, needsCheck: false}));

    this._subs.push(main$.pipe(filter(state => state.needsCheck && state.scrollWindow !== null)).subscribe(state => {
      this.height = state.scrollWindow.virtualHeight;

      if(state.scrollWindow.itemWidth === undefined) {
        this.width = '100%';
      } else {
        this.width = `${state.scrollWindow.itemWidth * state.scrollWindow.numActualColumns}px`;
      }

      this._cdr.markForCheck();
    }));

    // Order is important
    this._subs.push(userCmd$.connect());
    this._subs.push(renderCmd$.connect());
    this._subs.push(scrollWin$.connect());
    this._subs.push(measure$.connect());
    this._subs.push(options$.connect());
    this._subs.push(data$.connect());
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe());
  }
}
