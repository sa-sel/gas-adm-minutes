import { HRGS } from './globals.constant';

export const enum hrSheetName {
  MainData = 'Controle Geral',
}

export class hrSheets {
  static get mainData() {
    return HRGS.ss.getSheetByName(hrSheetName.MainData);
  }
}
