import { ACGS } from '../constants';

/** Fetch a named range's value. */
export const getNamedValue = (name: string): string => ACGS.ss?.getRangeByName(name).getValue();
