import { alert, DialogTitle, GS, Spreadsheet } from '@lib';

/** The administrative control spreadsheet namespace. */
export class ACGS {
  private static ssCache: Spreadsheet;

  /** The whole spreadsheet. */
  static get ss(): Spreadsheet | null {
    if (this.ssCache !== undefined) {
      return this.ssCache;
    }

    // Directories: "SA-SEL" -> "Administrativo" -> "Atas" -> Year -> doc
    const admDir = DriveApp.getFileById(GS.doc.getId()).getParents().next().getParents().next().getParents().next();

    const admControlName = 'Controle Administrativo';
    const admControlIt = admDir.getFilesByName(admControlName);

    if (admControlIt.hasNext()) {
      const admControlFile = admControlIt.next();

      if (admControlFile.getMimeType() === MimeType.GOOGLE_SHEETS) {
        this.ssCache = SpreadsheetApp.openById(admControlFile.getId());

        return this.ssCache;
      }
    }

    alert({
      title: DialogTitle.Error,
      body:
        `Não foi possível encontrar e abrir a planilha de controle do administrativo (arquivo buscado: "${admControlName}"), portanto a ` +
        'ata não será enviada por email nem Discord.\nIMPORTANTE: Entre em contato com a Diretoria de Tecnologia para resolver o problema.',
    });
    this.ssCache = null;

    return this.ssCache;
  }
}
