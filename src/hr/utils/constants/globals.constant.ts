import { ACGS, getNamedValue, NamedRange } from '@adm-control';
import { alert, DialogTitle, Spreadsheet } from '@lib';

/** The HR spreadsheet namespace. */
export class HRGS {
  private static ssCache: Spreadsheet;

  /** The whole spreadsheet. */
  static get ss(): Spreadsheet | null {
    if (this.ssCache === undefined) {
      try {
        this.ssCache = ACGS.ss ? SpreadsheetApp.openById(getNamedValue(NamedRange.SheetIdHR)) : null;
      } catch {
        alert({
          title: DialogTitle.Error,
          body:
            'Você não tem permissão para abrir a planilha do RH, portanto a ata não será enviada por email.\n' +
            'IMPORTANTE: Entre em contato com a Diretoria de Tecnologia para resolver o problema.',
        });
        this.ssCache = null;
      }
    }

    return this.ssCache;
  }
}
