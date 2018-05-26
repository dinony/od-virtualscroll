export function forRowsIn(start: number, end: number, numActualRows: number, iteratee: (virtualRowIndex: number, actualRowIndex: number) => void) {
  for(let r = start; r <= end; r++) {
    iteratee(r, r % numActualRows)
  }
}

export function forColumnsIn(start: number, end: number, row: number, numColumns: number, numTotalItems: number, iteratee: (columnIndex: number, dataIndex: number) => void) {
  const getDataIndex = (c: number) => row * numColumns + c

  for(let c = start, dataIndx = getDataIndex(c); c <= end && dataIndx < numTotalItems; c++, dataIndx = getDataIndex(c)) {
    iteratee(c, dataIndx)
  }
}

export function forColumnsInWithPrev(start: number, end: number, row: number, numColumns: number, prevRow: number, numPrevColumns: number, iteratee: (columnIndex: number, dataIndex: number, prevDataIndex: number) => void) {
  for(let c = start; c <= end; c++) {
    iteratee(c, row * numColumns + c, prevRow * numPrevColumns + c)
  }
}
