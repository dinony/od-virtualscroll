# od-virtualscroll

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/dinony/od-virtualscroll/master/LICENSE) [![Module format](https://img.shields.io/badge/module%20formats-umd%2Fes2015%2Ffesm5%2Ffesm15-blue.svg)](https://github.com/dinony/od-virtualscroll#module-format) [![Module format](https://img.shields.io/badge/supports-AoT-red.svg)](https://github.com/dinony/od-virtualscroll#module-format)

> Observable-based virtual scroll implementation in Angular.

## Installation

```
npm i -S od-virtualscroll
```

## Features

Let's you scroll efficiently through a humongous list/grid of items (with single predefined height) by recycling components and minimizing component updates.

- Handles resizing
- Efficient
  - Displays necessary amount of rows
  - Optimal updates on data change or resize
- Supports tiling
- Supports fixed number of columns
- Reactive component
  - Observable interface for most parts
- Supports AoT
- API
  - Subscribe to key component observables
- Plus
  - Debounce scrolling / resizing
  - Set scroll position, focus row or item via index
  - Customizable equality checking
  - A lot of code samples
- Module formats
  - Ships FESM5 and FESM15
  - Ships ES5/UMD, ES5/ES2015 and ES2015/ES2015 exports (`{{target}}/{{module}}`)

## Demo

All examples are written in Angular 4 and provided in separate repositories to keep this repository simple.

| Name           | Description
|----------------|-------------------------------------
| [od-vsstatic](https://github.com/dinony/od-vsstatic) / [Demo](https://dinony.github.io/od-vsstatic/)     | Static example with 100k cells. Ideal for performance analysis and GC testing
| [od-vsdynamic](https://github.com/dinony/od-vsdynamic) / [Demo](https://dinony.github.io/od-vsdynamic/)  | Scroll through GIFs, without the risk of a CPU meltdown ([GIPHY API](https://api.giphy.com/))
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
import {Observable} from 'rxjs';
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
| vsUserCmd        | `Observable<IUserCmd>`                            | Stream of user specific commands (optional, default: `-\->`)
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

### IUserCmd

Currently, the supported user specific commands are:

* `SetScrollTopCmd`: Set scroll top to specific value
* `FocusRowCmd`: Focus specific row index
* `FocusItemCmd`: Focus specific item index

E.g. Focus row index 42.

```typescript
data$ = // Data...;
userCmd$ = of(new FocusRowCmd(42)).delay(2000);
```

```html
<od-virtualscroll [vsData]="data$" [vsUserCmd]="userCmd$">
  <!-- Your template -->
</od-virtualscroll>
```

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

### Multiple Instances

The `ScrollObservableService` is registered on the VirtualScrollModule by default, so it is available on the root injector.
However, if you have multiple instances of the scroll component, a singleton instance of the `ScrollObservableService` is not enough.
Register the service on the wrapping component, via the providers property in the `@Component` decorator, so that the injector bubbling will stop on the Component level and will serve the right instance of the ScrollObservableService.

Check the [feature/testMultiInstances](https://github.com/dinony/od-virtualscroll/tree/feature/testMultiInstances) branch for a simple example.

### Further information

[api.ts](https://github.com/dinony/od-virtualscroll/blob/master/src/api.ts) reveals the current API surface.

## Module Format

The lib is AoT compatible and ships with FESM5 and FESM15 exports.

See [Angular Package Format v4.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview) for more info.

ES5/UMD, ES5/ES2015 and ES2015/ES2015 exports are also provided.

## Upgrade

### 1.0.x -> 1.1.x

1.1.x uses Angular6/RxJS6.

### 0.2.x -> 1.x

Rename component input `vsScrollTop` to `vsUserCmd`.

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
