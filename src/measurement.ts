import {ItemHeightFunction, IVirtualScrollContainer, IVirtualScrollMeasurement, IVirtualScrollOptions, IVirtualScrollWindow} from './basic';

export async function calcMeasure(data: any[], rect: IVirtualScrollContainer, options: IVirtualScrollOptions): Promise<IVirtualScrollMeasurement> {
  if (typeof options.itemHeight === 'function' && options.numLimitColumns !== 1) {
    throw new Error('numLimitColumns must equal 1 when using variable item height.');
  }

  const itemHeight = typeof options.itemHeight === 'number' ? options.itemHeight : await (typeof options.itemHeight !== 'function' ? options.itemHeight : Promise.all(data.map(async (item, i) => (<ItemHeightFunction> options.itemHeight)(item, i))));

  const minItemHeight = typeof itemHeight === 'number' ? itemHeight : itemHeight.length === 0 ? 0 : itemHeight.reduce((a, b) => Math.min(a, b));

  const numPossibleRows = Math.ceil(rect.height / minItemHeight);
  const numPossibleColumns = options.itemWidth !== undefined ? Math.floor(rect.width / options.itemWidth) : 0;

  return {
    containerHeight: rect.height,
    containerWidth: rect.width,
    itemHeight,
    itemWidth: options.itemWidth,
    minItemHeight,
    numPossibleColumns,
    numPossibleItems: numPossibleRows * numPossibleColumns,
    numPossibleRows,
  };
}

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));

export function calcScrollWindow(scrollTop: number, measure: IVirtualScrollMeasurement, numItems: number, dataTimestamp: number, options: IVirtualScrollOptions): IVirtualScrollWindow {
  const numVirtualItems = numItems;

  const requestedColumns = options.numLimitColumns !== undefined ? options.numLimitColumns : measure.numPossibleColumns;
  const numActualColumns = Math.min(numVirtualItems, requestedColumns);

  const numVirtualRows = Math.ceil(numVirtualItems / Math.max(1, numActualColumns));
  const virtualHeight = typeof measure.itemHeight === 'number' ? numVirtualRows * measure.itemHeight : measure.itemHeight.reduce((a, b) => a + b, 0);
  const numAdditionalRows = options.numAdditionalRows !== undefined ? options.numAdditionalRows : 1;
  const requestedRows = measure.numPossibleRows + numAdditionalRows;
  const numActualRows = numActualColumns > 0 ? Math.min(requestedRows, numVirtualRows) : 0;

  const visibleStartRow = typeof measure.itemHeight === 'number' ? undefined : Math.max(0, measure.itemHeight.reduce(
    (a, b, i) => {
      if (a >= 0) {
        return a;
      }

      const sum = a + b;
      return sum >= 0 ? i : sum;
    },
    -scrollTop
  ));

  const actualHeight = typeof measure.itemHeight === 'number' ? numActualRows * measure.itemHeight : typeof visibleStartRow === 'number' ? measure.itemHeight.slice(visibleStartRow).reduce((a, b) => a + b, 0) : 0;

  const visibleEndRow = typeof measure.itemHeight === 'number' ? (numActualColumns > 0 && numActualRows > 0 ? clamp(0, numVirtualRows - 1, Math.floor((scrollTop + actualHeight) / measure.minItemHeight) - 1) : -1) : typeof visibleStartRow === 'number' ? (visibleStartRow + numActualRows - 1) : 0;

  const rowShifts = typeof measure.itemHeight === 'number' ? undefined : measure.itemHeight.reduce((arr, n) => arr.concat(arr[arr.length - 1] + n), [0]).slice(0, -1);

  return {
    actualHeight,
    containerHeight: measure.containerHeight,
    containerWidth: measure.containerWidth,
    dataTimestamp,
    itemHeight: measure.itemHeight,
    itemWidth: measure.itemWidth,
    numActualColumns,
    numActualItems: Math.min(numActualRows * numActualColumns, numVirtualItems),
    numActualRows,
    numAdditionalRows,
    numVirtualItems,
    numVirtualRows,
    rowShifts,
    scrollPercentage: clamp(0, 100, scrollTop / (virtualHeight - measure.containerHeight)),
    scrollTop,
    virtualHeight,
    visibleEndRow,
    visibleStartRow: typeof visibleStartRow === 'number' ? visibleStartRow : visibleEndRow !== -1 ? Math.max(0, visibleEndRow - numActualRows + 1) : -1
  };
}

export function getMaxIndex(scrollWin: IVirtualScrollWindow) {
  return scrollWin.visibleEndRow * scrollWin.numActualColumns + scrollWin.numActualColumns - 1;
}
