import { hrSheets } from '@hr/utils/constants';
import { fetchData, Student, toString } from '@lib';

const parseRowToMember = (row: any[]): Student =>
  new Student({
    name: toString(row[0]),
    nickname: toString(row[1]) || undefined,
    nUsp: toString(row[2]),
    email: toString(row[5]) || undefined,
    phone: toString(row[3]).asPhoneNumber() || undefined,
  });

export const getAllMemberEmails = (): string[] =>
  fetchData(hrSheets.mainData, {
    filter: row => row[2] && row[5],
    map: row => parseRowToMember(row).email,
  });
