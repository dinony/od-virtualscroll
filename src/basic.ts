export type ItemHeightFunction = (item: any, i: number) => number|Promise<number>;

export interface IVirtualScrollOptions {
  itemWidth?: number;
  itemHeight: number|Promise<number>|ItemHeightFunction;
  numAdditionalRows?: number;
  numLimitColumns?: number;
}

export interface IVirtualScrollContainer {
  width: number;
  height: number;
}

export interface IVirtualScrollMeasurement {
  containerWidth: number;
  containerHeight: number;
  itemWidth?: number;
  itemHeight: number|number[];
  minItemHeight: number;
  numPossibleRows: number;
  numPossibleColumns: number;
  numPossibleItems: number;
}

export interface IVirtualScrollWindow {
  dataTimestamp: number;
  containerWidth: number;
  containerHeight: number;
  itemWidth?: number;
  itemHeight: number|number[];
  numVirtualItems: number;
  numVirtualRows: number;
  virtualHeight: number;
  numAdditionalRows: number;
  rowShifts?: number[];
  scrollTop: number;
  scrollPercentage: number;
  numActualRows: number;
  numActualColumns: number;
  actualHeight: number;
  numActualItems: number;
  visibleStartRow: number;
  visibleEndRow: number;
}

export interface IVirtualScrollState {
  measurement: IVirtualScrollMeasurement|null;
  scrollWindow: IVirtualScrollWindow|null;
  rows: {};
  needsCheck: boolean;
}
