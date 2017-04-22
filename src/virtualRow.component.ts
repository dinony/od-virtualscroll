import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EmbeddedViewRef, HostBinding, TemplateRef,
  ViewChild, ViewContainerRef
} from '@angular/core';

import {ScrollItem} from './scrollItem';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'od-virtual-row',
  styles: [`:host { display: block; position: absolute; }`],
  template: `<div #viewRef></div>`
})
export class VirtualRowComponent {
  @ViewChild('viewRef', {read: ViewContainerRef}) private _viewContainer: ViewContainerRef;
  @HostBinding('style.transform') get getTransform() {
    return `translateY(${this._translateY}px)`;
  }

  private _translateY = 0;

  constructor(private _cdr: ChangeDetectorRef) {}

  addItem(template: TemplateRef<ScrollItem>, context: ScrollItem, index?: number): EmbeddedViewRef<ScrollItem> {
    this._cdr.markForCheck();
    return this._viewContainer.createEmbeddedView(template, context, index);
  }

  setTransform(translateY: number) {
    this._translateY = translateY;
  }

  updateItem(column: number, context: ScrollItem): EmbeddedViewRef<ScrollItem> {
    this._cdr.markForCheck();
    const viewRef = this._viewContainer.get(column) as EmbeddedViewRef<ScrollItem>;
    viewRef.context.$implicit = context;
    return viewRef;
  }

  removeItem(column: number): void {
    this._cdr.markForCheck();
    this._viewContainer.remove(column);
  }

  updateRow(row: number): void {
    for(let c = 0; c < this._viewContainer.length; c++) {
      const viewRef = this._viewContainer.get(c) as EmbeddedViewRef<ScrollItem>;
      viewRef.context.row = row;
    }
    this._cdr.markForCheck();
  }
}
