# od-virtualscroll

Observable-based virtual scroll implementation in Angular.

## Installation

```
npm i -S od-virtualscroll
```

## Features

- Efficient virtual scrolling / infinite scrolling
- Supports resizing
- Optimal updates
- Request a fixed cell size - adjusts number of cells per row
- Request a certain number of cells per row - adjusts cell width
- Debounce scrolling / resizing
- Advanced API that allows you to subscribe to key component observables
- Set scroll position
- Customizable equality checking (needed to identify cells)
- Supports ahead-of-time compilation and tree shaking
- A lot of code samples
- Ships with FESM5 and FESM15
- Also ships ES5/UMD, ES5/ES2015 and E2015/ES2015 exports (`{{target}}/{{module}}`)

## Demo

All examples are written in Angular 4 and provided in separate repositories to keep this repository simple.

| Name           | Description
|----------------|-------------------------------------
| [od-vsstatic](https://github.com/dinony/od-vsstatic) / [Demo](https://dinony.github.io/od-vsstatic/)     | Static example with 10k cells. Ideal for performance analysis and GC testing
| [od-vsdynamic](https://github.com/dinony/od-vsdynamic) / [Demo](https://dinony.github.io/od-vsdynamic/)  | Scroll through GIFs, without the risk of melting your CPU ([GIPHY API](https://api.giphy.com/))
| [od-vslist](https://github.com/dinony/od-vslist) / [Demo](https://dinony.github.io/od-vslist/)     | Render only 1 cell per row with dynamic width ([randomuser API](https://randomuser.me/documentation))
| [od-vsadvanced](https://github.com/dinony/od-vsadvanced) / [Demo](https://dinony.github.io/od-vsadvanced/) | Shows more advanced API features and utilizes the auxiliary debug module
| [od-vscolors](https://github.com/dinony/od-vscolors) / [Demo](https://dinony.github.io/od-vscolors/)   | Just for fun

However, this repository also holds a minimalistic demo, to allow local development and AoT compilation.

## Usage

Import the module and specify the cell and container styling (traditional layout or flexbox/... your choice). 

```typescript
// app.module.ts
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {VirtualScrollModule} from 'od-virtualscroll';
import {AppComponent} from './app.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    VirtualScrollModule
  ]
})
export class AppModule {}

// app.component.ts
import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IVirtualScrollOptions} from 'od-virtualscroll';

@Component({
  selector: 'app-shell',
  styles: [`...`],                      // <-- Style your cell and container
  template: `
    <od-virtualscroll [vsData]="data$" [vsOptions]="options$">
      <ng-template let-item let-row="row" let-column="column">
        <span>Row: {{row}}</span><br>
        <span>Column: {{column}}</span>
        {{item}}
      </ng-template>
    </od-virtualscroll>`
})
export class AppComponent {
  data$: Observable<any[]> = ... ;                      // <-- Define data
  options$: Observable<IVirtualScrollOptions> = ... ;   // <-- Define options
}
```

If you want to apply a traditional layout and wonder about the space between inline block elements - read [this](https://css-tricks.com/fighting-the-space-between-inline-block-elements/).

## Inputs

| Name             | Type                                              | Description
|------------------|---------------------------------------------------|-------------------------------------------------------------------------------------------------------
| vsData           | `Observable<any[]>`                               | Stream of data 
| vsOptions        | `Observable<IVirtualScrollOptions>`               | Stream of options
| vsResize         | `Observable<any>`                                 | Stream of resize commands (optional, default: `-\->`)
| vsScrollTop      | `Observable<SetScrollTopCmd>`                     | Stream of set scroll top commands (optional, default: `-\->`)
| vsDebounceTime   | `number`                                          | Debounce scroll and resize events [ms] (optional, default: 0)
| vsEqualsFunc     | `(prevIndex: number, curIndex:number) => boolean` | Function to determine equality, given two indicies in the array (optional, default: `(p,c) => p === c)`)

### IVirtualScrollOptions

```typescript
export interface IVirtualScrollOptions {
  itemWidth?: number;
  itemHeight: number;
  numAdditionalRows?: number;
  numLimitColumns?: number;
}
```

The component requires either fixed-size cells (itemWidth, itemHeight) or a fixed number of cells per row (itemHeight, numLimitColumns).

Further, to improve scrolling, additional rows may be requested.

## API

### ScrollObservableService
Inject the *ScrollObservableService* to subscribe to key component observables.

| Name             | Type                                                       | Description
|------------------|------------------------------------------------------------|-------------------------------------------------------
| scrollWin$       | `[IVirtualScrollWindow]`                                   | Stream of the most important inner data structure
| createRow$       | `[CreateRowCmd,  ComponentRef<VirtualRowComponent>]`       | Create row command and ComponentRef
| removeRow$       | `[RemoveRowCmd, ComponentRef<VirtualRowComponent>]`        | Remove row command and ComponentRef
| shiftRow$        | `[ShiftRowCmd, ComponentRef<VirtualRowComponent>]`         | Shift row command and ComponentRef
| createItem$      | `[CreateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]` | Create item command, scroll item and EmbeddedViewRef
| updateItem$      | `[UpdateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]` | Update item command, scroll item and EmbeddedViewRef
| removeItem$      | `[RemoveItemCmd]`                                          | Remove item command

The [od-vsdynamic](https://github.com/dinony/od-vsdynamic) and [od-vsadvanced](https://github.com/dinony/od-vsadvanced) examples show how the API may be used.

### IVirtualScrollWindow

This interface provides pretty much all needed information. 

```typescript
export interface IVirtualScrollWindow {
  dataTimestamp: number;
  containerWidth: number;
  containerHeight: number;
  itemWidth?: number;
  itemHeight: number;
  numVirtualItems: number;
  numVirtualRows: number;
  virtualHeight: number;
  numAdditionalRows: number;
  scrollTop: number;
  scrollPercentage: number;
  numActualRows: number;
  numActualColumns: number;
  actualHeight: number;
  numActualItems: number;
  visibleStartRow: number;
  visibleEndRow: number;
}
```
It is used internally and may also be useful in consuming application components.

E.g.: The [od-vsdynamic](https://github.com/dinony/od-vsdynamic) example.

### Further information

[api.ts](https://github.com/dinony/od-virtualscroll/blob/master/src/api.ts) reveals the current API surface.

## Module Format

The lib is AoT compatible and ships with FESM5 and FESM15 exports.

See [Angular Package Format v4.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview) for more info.

ES5/UMD, ES5/ES2015 and ES2015/ES2015 exports are also provided.

## NPM Scripts

```
npm run {{scriptName}}
```

| Name          | Description
|---------------|-------------------------------------------
| buildAll      | Build lib and demo
| cleanAll      | Remove generated directories
| buildDemo     | Build demo bundle with AoT compilation
| tslint        | Lint lib and demo
| serve         | Starts browser-sync for local development
| explore       | Source map explorer of AoT compiled demo

## Contribution & Contact

Contribution and feedback is highly appreciated.

[GitHub](https://github.com/dinony)

[Twitter](https://twitter.com/dinonysaur)

## License

MIT
