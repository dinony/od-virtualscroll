/* tslint:disable:max-classes-per-file */
export enum UserCmdOption {
  SetScrollTop,
  FocusRow,
  FocusItem
}

export interface IUserCmd {
  cmdType: UserCmdOption
}

export class SetScrollTopCmd implements IUserCmd {
  cmdType = UserCmdOption.SetScrollTop
  constructor(public value: number) {}
}

export class FocusRowCmd implements IUserCmd {
  cmdType = UserCmdOption.FocusRow
  constructor(public rowIndex: number) {}
}

export class FocusItemCmd implements IUserCmd {
  cmdType = UserCmdOption.FocusItem
  constructor(public itemIndex: number) {}
}
