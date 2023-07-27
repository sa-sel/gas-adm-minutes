import { searchInTable, Table } from '@lib';

/** Searches for the first ocurrence with expected structure: `${key}: ${value}`. Returns the value. */
export const searchValueInTableByKey = (table: Table, key: string) => searchInTable(table, key)[0]?.getText().replace(key, '');
