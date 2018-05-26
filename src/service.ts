import {ComponentRef, EmbeddedViewRef, Injectable} from '@angular/core'

import {Observable, ReplaySubject, Subject} from 'rxjs'

import {IVirtualScrollWindow} from './basic'

import {
  CreateItemCmd, CreateRowCmd, RemoveItemCmd,
  RemoveRowCmd, ShiftRowCmd, UpdateItemCmd
} from './cmd'

import {ScrollItem} from './scrollItem'
import {VirtualRowComponent} from './virtualRow.component'

@Injectable()
export class ScrollObservableService {
  private _scrollWin = new ReplaySubject<[IVirtualScrollWindow]>(1)
  scrollWin$ = this._scrollWin.asObservable()
  emitScrollWin = (e: [IVirtualScrollWindow]) => this._scrollWin.next(e)

  private _createRow = new Subject<[CreateRowCmd,  ComponentRef<VirtualRowComponent>]>()
  createRow$ = this._createRow.asObservable()
  emitCreateRow = (e: [CreateRowCmd,  ComponentRef<VirtualRowComponent>]) => this._createRow.next(e)

  private _removeRow = new Subject<[RemoveRowCmd, ComponentRef<VirtualRowComponent>]>()
  removeRow$ = this._removeRow.asObservable()
  emitRemoveRow = (e: [RemoveRowCmd, ComponentRef<VirtualRowComponent>]) => this._removeRow.next(e)

  private _shiftRow = new Subject<[ShiftRowCmd, ComponentRef<VirtualRowComponent>]>()
  shiftRow$ = this._shiftRow.asObservable()
  emitShiftRow = (e: [ShiftRowCmd, ComponentRef<VirtualRowComponent>]) => this._shiftRow.next(e)

  private _createItem = new Subject<[CreateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]>()
  createItem$ = this._createItem.asObservable()
  emitCreateItem = (e: [CreateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]) => this._createItem.next(e)

  private _updateItem = new Subject<[UpdateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]>()
  updateItem$ = this._updateItem.asObservable()
  emitUpdateItem = (e: [UpdateItemCmd, ScrollItem, EmbeddedViewRef<ScrollItem>]) => this._updateItem.next(e)

  private _removeItem = new Subject<[RemoveItemCmd]>()
  removeItem$ = this._removeItem.asObservable()
  emitRemoveItem = (e: [RemoveItemCmd]) => this._removeItem.next(e)
}
