import {IVirtualScrollContainer, IVirtualScrollMeasurement, IVirtualScrollOptions, IVirtualScrollWindow} from './basic';

export function calcMeasure(rect: IVirtualScrollContainer, options: IVirtualScrollOptions): IVirtualScrollMeasurement {
  const numPossibleRows = Math.ceil(rect.height / options.itemHeight);
  const numPossibleColumns = options.itemWidth !== undefined ? Math.floor(rect.width / options.itemWidth) : 0;

  return {
    containerHeight: rect.height,
    containerWidth: rect.width,
    itemHeight: options.itemHeight,
    itemWidth: options.itemWidth,
    numPossibleRows,
    numPossibleColumns,
    numPossibleItems: numPossibleRows * numPossibleColumns,
  };
}

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));

export function calcScrollWindow(scrollTop: number, measure: IVirtualScrollMeasurement, numItems: number, dataTimestamp: number, options: IVirtualScrollOptions): IVirtualScrollWindow {
  const numVirtualItems = numItems;

  const requestedColumns = options.numLimitColumns !== undefined ? options.numLimitColumns : measure.numPossibleColumns;
  const numActualColumns = Math.min(numVirtualItems, requestedColumns);

  const numVirtualRows = Math.ceil(numVirtualItems / Math.max(1, numActualColumns));
  const virtualHeight = numVirtualRows * measure.itemHeight;
  const numAdditionalRows = options.numAdditionalRows !== undefined ? options.numAdditionalRows : 1;
  const requestedRows = measure.numPossibleRows + numAdditionalRows;
  const numActualRows = numActualColumns > 0 ? Math.min(requestedRows, numVirtualRows) : 0;

  const actualHeight = numActualRows * measure.itemHeight;

  const visibleEndRow = numActualColumns > 0 && numActualRows > 0 ? clamp(0, numVirtualRows - 1, Math.floor((scrollTop + actualHeight) / measure.itemHeight) - 1) : -1;

  return {
    actualHeight,
    containerHeight: measure.containerHeight,
    containerWidth: measure.containerWidth,
    dataTimestamp,
    itemHeight: measure.itemHeight,
    itemWidth: measure.itemWidth,
    numAdditionalRows,
    numActualRows,
    numActualColumns,
    numActualItems: Math.min(numActualRows * numActualColumns, numVirtualItems),
    numVirtualItems,
    numVirtualRows,
    scrollPercentage: clamp(0, 100, scrollTop / (virtualHeight - measure.containerHeight)),
    scrollTop,
    virtualHeight,
    visibleEndRow,
    visibleStartRow: visibleEndRow !== -1 ? Math.max(0, visibleEndRow - numActualRows + 1) : -1
  };
}

export function getMaxIndex(scrollWin: IVirtualScrollWindow) {
  return scrollWin.visibleEndRow * scrollWin.numActualColumns + scrollWin.numActualColumns - 1;
}
