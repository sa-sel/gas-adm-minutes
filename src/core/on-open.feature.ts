import { GS } from '@lib';
import { finishMeeting } from './finish-meeting.feature';

export const onOpen = () => {
  GS.ui.createMenu('[Reunião]').addItem('Concluir Reunião', finishMeeting.name).addToUi();
};
