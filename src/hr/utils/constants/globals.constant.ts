import { ACGS, getNamedValue, NamedRange } from '@adm-control';
import { Spreadsheet } from '@lib';

/** The HR spreadsheet namespace. */
export class HRGS {
  private static ssCache: Spreadsheet;

  /** The whole spreadsheet. */
  static get ss(): Spreadsheet | null {
    if (this.ssCache === undefined) {
      this.ssCache = ACGS.ss ? SpreadsheetApp.openById(getNamedValue(NamedRange.SheetIdHR)) : null;
    }

    return this.ssCache;
  }
}
