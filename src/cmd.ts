/* tslint:disable:max-classes-per-file */
import {IVirtualScrollWindow} from './basic';

export enum CmdOption {
  Noop,
  CreateRow,
  ShiftRow,
  RemoveRow,
  CreateItem,
  UpdateItem,
  RemoveItem
}

export interface ICmd {
  cmdType: CmdOption;
}

export interface IRowRenderCmd extends ICmd {
  virtualIndex: number;
  actualIndex: number;
}

export interface ItemRenderCmd extends IRowRenderCmd {
  columnIndex: number;
  dataIndex: number;
}

export class NoopCmd implements ICmd {
  cmdType = CmdOption.Noop;
}

export class CreateRowCmd implements IRowRenderCmd {
  cmdType = CmdOption.CreateRow;
  constructor(
    public virtualIndex: number,
    public actualIndex: number,
    public initShift: number) {}
}

export class RemoveRowCmd implements IRowRenderCmd {
  cmdType = CmdOption.RemoveRow;
  constructor(
    public virtualIndex: number,
    public actualIndex: number) {}
}

export class ShiftRowCmd implements IRowRenderCmd {
  cmdType = CmdOption.ShiftRow;
  constructor(
    public virtualIndex: number,
    public actualIndex: number,
    public shift: number) {}
}

export class CreateItemCmd implements ItemRenderCmd {
  cmdType = CmdOption.CreateItem;
  constructor(
    public virtualIndex: number,
    public actualIndex: number,
    public columnIndex: number,
    public dataIndex: number) {}
}

export class UpdateItemCmd implements ItemRenderCmd {
  cmdType = CmdOption.UpdateItem;
  constructor(
    public virtualIndex: number,
    public actualIndex: number,
    public columnIndex: number,
    public dataIndex: number) {}
}

export class RemoveItemCmd implements ItemRenderCmd {
  cmdType = CmdOption.RemoveItem;
  constructor(
    public virtualIndex: number,
    public actualIndex: number,
    public columnIndex: number,
    public dataIndex: number) {}
}
