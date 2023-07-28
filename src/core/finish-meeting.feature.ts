import { ACGS, getNamedValue, NamedRange } from '@adm-control';
import { getAllMemberEmails } from '@hr';
import {
  alert,
  confirm,
  DialogTitle,
  DiscordEmbed,
  DiscordWebhook,
  exportToPdf,
  File,
  GS,
  institutionalEmails,
  MeetingVariable,
  SaDepartment,
  SafeWrapper,
  sendEmail,
  SheetLogger,
  substituteVariablesInFile,
  substituteVariablesInString,
} from '@lib';
import { searchValueInTableByKey } from '@utils/functions';

// TODO: how to use "@views/" here?
import emailBodyHtml from '../views/finish-meeting.email.html';

const dialogBody = `
Você tem certeza que deseja continuar com essa ação? Ela é irreversível e vai:
  - Exportar a ata da reunião para PDF;
  - Enviar o PDF da ata por email para a SA-SEL inteira;
  - Enviar a ata nos canais do Discord #general e da diretoria;
  - Excluir o documento editável da ata.
`;

const buildDiscordEmbeds = (meetingTitle: string, meetingMinutes: File, meetingEnd: Date): DiscordEmbed[] => {
  const fields: DiscordEmbed['fields'] = [];
  const meetingData = GS.doc.getBody().getTables()[0];

  if (meetingData) {
    const president = searchValueInTableByKey(meetingData, SaDepartment.Presidency);
    const vicePresident = searchValueInTableByKey(meetingData, SaDepartment.VicePresidency);
    const secretary = searchValueInTableByKey(meetingData, SaDepartment.Secretary);

    fields.pushIf(president, { name: SaDepartment.Presidency, value: president, inline: true });
    fields.pushIf(vicePresident, { name: SaDepartment.VicePresidency, value: vicePresident, inline: true });
    fields.pushIf(secretary, { name: SaDepartment.Secretary, value: secretary, inline: true });
  }

  return [
    {
      title: meetingTitle,
      url: meetingMinutes.getUrl(),
      timestamp: meetingEnd.toISOString(),
      fields,
      author: {
        name: 'SA-SEL',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
  ];
};

export const actuallyFinishMeeting = (meetingEnd: Date, logger?: SheetLogger) => {
  const minutesDocFile = substituteVariablesInFile(DriveApp.getFileById(GS.doc.getId()), {
    [MeetingVariable.End]: meetingEnd.asTime(),
  });

  logger?.log(DialogTitle.InProgress, `Horário de fim da reunião registrado: ${meetingEnd.asTimestamp()}`);

  const minutesPdf = exportToPdf(minutesDocFile).moveTo(minutesDocFile.getParents().next());
  const meetingTitle = minutesDocFile.getName().split(' - ')[1];

  logger?.log(DialogTitle.InProgress, 'PDF da ata exportado.');

  if (meetingTitle && ACGS.ss) {
    const target = getAllMemberEmails();

    if (target.length) {
      sendEmail({
        subject: `[SA-SEL] ${meetingTitle} - ${meetingEnd.asDateString()}`,
        target,
        htmlBody: substituteVariablesInString(emailBodyHtml, {
          [MeetingVariable.MeetingType]: meetingTitle,
        }),
        attachments: [minutesPdf],
      });

      logger?.log(DialogTitle.InProgress, 'Ata enviada por email para os membros.');
    }

    const boardWebhook = new DiscordWebhook(getNamedValue(NamedRange.WebhookBoardOfDirectors));
    const generalWebhook = new DiscordWebhook(getNamedValue(NamedRange.WebhookGeneral));
    const embeds: DiscordEmbed[] = buildDiscordEmbeds(meetingTitle, minutesPdf, meetingEnd);

    boardWebhook.post({ embeds });
    generalWebhook.post({ embeds });

    if (boardWebhook.url.isUrl() || generalWebhook.url.isUrl()) {
      logger?.log(DialogTitle.InProgress, 'Ata enviada no Discord.');
    }
  }

  alert({
    title: DialogTitle.Success,
    body: `Ata exportada para PDF com sucesso, o documento editável será excluído. Link:\n${minutesPdf.getUrl()}`,
  });
  logger?.log(DialogTitle.Success, 'Ata exportada para PDF com sucesso, documento editável será excluído');
  minutesDocFile.setTrashed(true);
};

export const finishMeeting = () =>
  SafeWrapper.factory(finishMeeting.name, {
    loggingSheet: () => ACGS.ss?.getSheetByName('Logs') || null,
    allowedEmails: institutionalEmails,
  }).wrap(logger => {
    const meetingEnd = new Date();

    confirm(
      {
        title: `Conclusão de Reunião - ${meetingEnd.asDateString()}`,
        body: dialogBody,
      },
      () => actuallyFinishMeeting(meetingEnd, logger),
      logger,
    );
    logger?.log(DialogTitle.InProgress, `Execução iniciada para reunião de ${meetingEnd.asDateString()}`);
  });
