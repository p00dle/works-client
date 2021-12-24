import { format } from '~/lib/format';
import { saveAs } from 'file-saver';

type CsvColumnType = 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 'time' | 'custom';

interface CsvColumn<T, P extends keyof T = keyof T> {
  prop: P;
  type: CsvColumnType;
  stringify?: (val: T[P]) => string;
  label?: string;
}

export interface CsvOptions {
  delimiter: string;
  quote: string;
  escapeQuote: string;
  rowSeparator: string;
  ignoreUnderscoredProps: boolean;
}

const defaultOptions: CsvOptions = {
  delimiter: ',',
  quote: '"',
  escapeQuote: '""',
  rowSeparator: '\r\n',
  ignoreUnderscoredProps: false,
}

export type CsvColumns<T> = CsvColumn<T>[];

function stringifyDate(x: any): string {
  const isDate = x instanceof Date;
  if (!(isDate || (typeof x === 'number' && !isNaN(x)))) return '';
  const date = isDate ? x : new Date(x);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function stringifyDateTime(x: any): string {
  const isDate = x instanceof Date;
  if (!(isDate || (typeof x === 'number' && !isNaN(x)))) return '';
  const date = isDate ? x : new Date(x);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function stringifyTime(x: any): string {
  const isDate = x instanceof Date;
  if (!(isDate || (typeof x === 'number' && !isNaN(x)))) return '';
  const date = isDate ? x : new Date(x);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}


const stringifyersByType: Record<CsvColumnType, (val: any) => string> = {
  string: (x) => (typeof x === 'string' ? x : x ? '' + x : ''),
  integer: (x) => (x !== undefined && x !== null && !isNaN(x) ? (typeof x === 'number' ? x.toFixed(0) : '' + x) : ''),
  float: (x) => (x !== undefined && x !== null && !isNaN(x) ? '' + x : ''),
  boolean: (x) => (x !== undefined && x !== null) ? (x ? 'TRUE' : 'FALSE') : '',
  date: stringifyDate,
  datetime: stringifyDateTime,
  time: stringifyTime,
  custom: x => x === undefined || x === null ?  '' : '' + x,
};

function getStringify(prop: string): (a: any) => string {
  const [isTime, isDate, isTimestamp] = ['Time', 'Date', 'Timestamp'].map(
    (str) => prop.toLowerCase() === str.toLowerCase() || prop.includes(str),
  );
  if (isTimestamp || (isTime && isDate)) return stringifyDateTime;
  else if (isTime) return stringifyTime;
  else if (isDate) return stringifyDate;
  else return (a) => (a === undefined || a === null ? '' : '' + a);
}

function makeColumns<T>(arr: T[], ignoreUnderscored?: boolean): CsvColumn<T>[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  let props = Object.keys(arr[0]) as (keyof T)[];
  if (ignoreUnderscored) props = props.filter((prop) => String(prop)[0] !== '_');
  return props.map((prop: keyof T) => ({
    label: format.string.camelCaseToTitleCase(String(prop)),
    prop,
    type: 'custom' as const,
    stringify: getStringify(String(prop)),
  }));
}

function shouldEscape(str: string, delimiter: string, escape: string): boolean {
  return str.indexOf(delimiter) !== -1 || str.indexOf(escape) !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1;
}

function escape(str: string, quote: string, escapeQuote: string, quoteRegex: RegExp,  ): string {
  return quote + str.replace(quoteRegex, escapeQuote) + quote;
}

export function stringifyCsv<T>(arr: T[], columns?: CsvColumns<T>, options?: Partial<CsvOptions>) {
  const { delimiter, quote, escapeQuote, ignoreUnderscoredProps, rowSeparator } = options ? {...defaultOptions, ...options} : defaultOptions;
  const quoteRegex = new RegExp(quote, 'g');
  const cols = Array.isArray(columns) ? columns : makeColumns(arr, ignoreUnderscoredProps);
  const headerRow = cols.map(col => col.label || col.prop).join(delimiter);
  const stringifyers = cols.map(col => col.type === 'custom' ? col.stringify || stringifyersByType[col.type] : stringifyersByType[col.type] );
  const width = cols.length;
  const height = arr.length;
  const props = cols.map(col => col.prop);
  const rows = [headerRow];
  const shouldTestForEscape = cols.map(col => col.type === 'string' || col.type === 'custom');
  for (let row = 0; row < height; row++ ) {
    const rowStrings: string[] = [];
    for (let col = 0; col < width; col++ ) {
      let str = stringifyers[col](arr[row][props[col]]);
      if (shouldTestForEscape[col] && shouldEscape(str, delimiter, quote)) str = escape(str, quote, escapeQuote, quoteRegex);
      rowStrings[col] = str;
    }
    rows[row + 1] = rowStrings.join(delimiter);
  }
  return rows.join(rowSeparator);
}

function isTransformFunction<T, X = T>(val: any): val is [T[], (data: T[]) => X[]] {
  return Array.isArray(val) &&
    val.length === 2 &&
    Array.isArray(val[0]) &&
    typeof val[1] === 'function';

}

export function saveCsvAs<T, X = T>(filename: string, data: X[] | [T[], (data: T[]) => X[]], columns?: CsvColumns<X>, options?: Partial<CsvOptions>) {
  const arr = isTransformFunction<T, X>(data) ? data[1](data[0]) : data;
  const csvString = Array.isArray(arr) && arr.length > 0 ? stringifyCsv(arr, columns, options) : '""';
  saveAs(new Blob([csvString], { type: 'text/csv;charset=utf-8'}), filename);
}