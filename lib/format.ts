type MaybeNumber = any;
type IntervalUnit = 'ms' | 's' | 'm' | 'h' | 'd';

function isNumber(n: MaybeNumber): n is number {
  return typeof n === 'number' && !isNaN(n);
}

export const format = {
  number: {
    asDate: (n: MaybeNumber): string => {
      if (!isNumber(n)) return '';
      const date = new Date(n);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return date.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
    },
    asDateTime: (n: MaybeNumber): string => {
      if (!isNumber(n)) return '';
      const date = new Date(n);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${
        String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    asPerc: (n: MaybeNumber, precision = 0): string => {
      if (!isNumber(n)) return '';
      return (n * 100).toFixed(precision) + '%';
    },
    asInteger: (n: MaybeNumber): string => {
      if (!isNumber(n)) return '';
      return '' + Math.round(n);
    },
    asFloat: (n: MaybeNumber, precision = 2): string => {
      if (!isNumber(n)) return '';
      return n.toFixed(precision);
    },
    asInterval: (n: MaybeNumber, unit: IntervalUnit): number => {
      if (!isNumber(n)) return 0;
      switch (unit) {
        case 'ms': return n;
        case 's': return Math.round(n / 1000);
        case 'm': return Math.round(n / 60000);
        case 'h': return Math.round(n / 3600000);
        case 'd': return Math.round(n / 86400000);
      }
    },
    asString: (n: MaybeNumber): string => isNumber(n) ? '' + n : '',
  },
  string: {
    camelCaseToTitleCase: (str: string): string => str.replace(/[A-Z]/g, x => ' ' + x).replace(/^[a-z]/, x => x.toUpperCase()),
    camelCaseToUpperCase: (str: string): string => str.replace(/[A-Z]/g, x => ' ' + x).toUpperCase(),
    dashToTitleDashCase: (str: string): string => str[0].toUpperCase() + str.slice(1).replace(/([ -])(.)/g, subStr => subStr[0] + subStr[1].toUpperCase()),
    asTitleCase: (str: string): string => str.replace(/[A-Z]/g, x => ' ' + x).replace(/^[a-z]/, x => x.toUpperCase()),
    id: (str: string): string => str,
  },
  boolean: {
    asUpperCase: (bool: boolean): string => bool ? 'TRUE': 'FALSE',
  },
  minutes: {
    asInterval: (n: number): string => {
      if (n < 1) return '0m';
      const chunks: string[] = [];
      const days = Math.floor(n / 1440);
      if (days > 0) chunks.push(days + 'd');
      const hours = Math.floor((n - days * 1440) / 60);
      if (hours > 0) chunks.push(hours + 'h');
      const minutes = n % 60;
      if (minutes > 0) chunks.push((n % 60) + 'm');
      return chunks.join(' ');
    }
  }
};
