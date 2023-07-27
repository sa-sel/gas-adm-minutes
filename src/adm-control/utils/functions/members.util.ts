import { Student, fetchData } from '@lib';
import { ACGS, NamedRange } from '@adm-control/utils/constants';

export const getAllMembers = (): Student[] =>
  fetchData(ACGS.ss.getRangeByName(NamedRange.ProjectMembers), {
    map: row =>
      new Student({
        name: row[0],
        nickname: row[1],
        nUsp: row[2],
        phone: row[3],
        email: row[4],
      }),
  });
