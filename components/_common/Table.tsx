import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { DatePickerToday } from '~/components/_common/DatePickerToday';
import { MultiSelect } from '~/components/_common/MutliSelect';
import { getUniqueValuesByProp } from '~/lib/utils';

/* TODO: fix initial sort */

// TODO: pagination should show 1 2 3 4 5 6 ... 14 instead of 1 ... 2 3 4 5 6 ... 14; same for other direction

function noOp(): void {
  // noOp
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T, keyof T>[];
  classes?: {
    table?: string;
    header?: string;
    row?: string;
    row2?: string;
    footer?: string;
    input?: string;
    cell?: string;
    select?: string;
    pagination?: string;
    paginationButton?: string;
    paginationButtonSelected?: string;
    datePickerInput?: string;
  };
  maxRows?: number;
  maxPages?: number;
  useEmptyRows?: boolean;
  defaultSort?: {
    prop: keyof T;
    asc?: boolean;
  };
  onFilter?: (filtered: T[]) => any;
  onRowClick?: (row: T) => any;
}

interface TableColumn<T, P extends keyof T = keyof T> {
  header: string | JSX.Element;
  prop?: P;
  format?: (prop: T[P]) => string | JSX.Element;
  row?: (row: T) => string | JSX.Element;
  sort?: boolean;
  filter?: 'search' | 'select' | 'date';
  customClass?: (row: T, index?: number) => string;
  headerClass?: string;
  width?: number | string;
}

export type TableColumns<T> = TableColumn<T>[];

interface TransformedTableProps {
  data: any[];
  columns: TransformedTableColumn[];
  headers: TransformedTableHeader[];
  classes: {
    container: string;
    table: string;
    header: string;
    row: string;
    row2: string;
    cell: string;
    pagination: string;
    paginationButton: string;
    paginationButtonSelected: string;
    input: string;
    select: string;
    sort: string;
    search: string;
    searchButton: string;
    exportButton: string;
    datePickerContainer: string;
    datePickerInput: string;
  };
  initialPropSelectedAndPool: Record<any, {selected: any[], pool: any[]}>;
  initialPropSearch: Record<any, string>;
  initialDateFilters: Record<any, [number | null, number | null]>;
  onFilter?: (filtered: any[]) => any;
}

interface TransformedTableColumn {
  getValue: (row: any) => string | JSX.Element;
  getClass: (row: any, index: number) => string;
}

interface TransformedTableHeader {
  prop?: any;
  label: string | JSX.Element;
  sort?: boolean;
  filter?: 'search' | 'select' | 'date';
  width?: string | number;
  className?: string;
}


function transformProps<T>(props: TableProps<T>): TransformedTableProps {
  const suppliedClasses = props.classes || {};
  const classes = {
    container: "",
    table: "border-collapse w-full secondary border-inherit",
    header: "px-2 py-1 border-2 border-inherit text-left min-h-max",
    row: "row-odd border-2 h-8",
    row2: "row-even border-2 h-8",
    cell: "px-2",
    pagination: "py-2 flex place-content-center w-full space-x-2 border-2 border-inherit",
    paginationButton: "secondary secondary-hover border-2 rounded-md w-6",
    paginationButtonSelected: "secondary secondary-hover secondary-active border-2 rounded-md w-6",
    input: "form-control",
    select: "multi-select-default",
    sort: "cursor-pointer h-full grid grid-rows-2",
    datePickerContainer: "flex space-x-1 text-xs",
    datePickerInput: "form-control px-1 w-[5.25rem] ",
    search: "table-default-search",
    searchButton: "table-default-search-button",
    exportButton: "table-default-export-button",
    ...suppliedClasses
  };
  const initialPropSelectedAndPool: Record<any, { selected: any[], pool: any[]}> = {};
  const initialPropSearch: Record<any, string> = {};
  const initialDateFilters: Record<any, [null | number, null | number]> = {};
  return {
    data: props.defaultSort ? sortData(props.defaultSort.prop, props.data, props.defaultSort.asc) : props.data,
    columns: props.columns.map(col => {
      const output: Partial<TransformedTableColumn> = { };
      if (col.row) {
        output.getValue = col.row;
      } else if (col.prop) {
        output.getValue = col.format ? (row: any) => (col.format as (prop: any) => string | JSX.Element)(row[col.prop as string]) : (row: any) => {
          const val = row[col.prop as string];
          if (val === undefined || val === null) return '';
          return '' + val;
          
        };
      } else {
        throw new TypeError(`Expected either row or prop property to be defined on column ${col.header}`);
      }

      output.getClass = col.customClass ? col.customClass : () => classes.cell;
      return output as TransformedTableColumn;
    }),
    headers: props.columns.map(col => {
      if (col.sort && !col.prop) {
        throw new TypeError(`If sort is different than 'none' prop needs to be provided`);
      }
      if (col.filter && !col.prop) {
        throw new TypeError(`If filter is different than 'none' prop needs to be provided`);
      }
      if (col.filter === 'select' && col.prop) {
        const uniquePropValues = getUniqueValuesByProp(col.prop, props.data);
        uniquePropValues.sort();
        initialPropSelectedAndPool[col.prop] = { selected: uniquePropValues.slice(), pool: uniquePropValues.slice() };
      } else if (col.filter === 'search' && col.prop) {
        initialPropSearch[col.prop] = '';
      } else if (col.filter === 'date' && col.prop) {
        initialDateFilters[col.prop] = [null, null];
      }
      return {
        prop: col.prop,
        label: col.header,
        sort: col.sort,
        filter: col.filter,
        width: col.width,
        className: col.headerClass,
      };
    }),
    classes,
    initialPropSelectedAndPool,
    initialPropSearch,
    initialDateFilters,
    onFilter: props.onFilter
  };
}

function range(start: number, end: number): number[] {
  if (start >= end) return [];
  const numbers = [];
  let i = start;
  let x = 0;
  while (i < end) numbers[x++] = i++;
  return numbers;
}

interface PropsSelectedAndPool {
  [prop: string]: {
    selected: string[];
    pool: string[];
  };
}

interface AppliedFilter {
  prop: string;
  type: 'search' | 'select' | 'date';
  value?: string;
  values?: string[];
  dates?: [number | null, number | null];
}

function sortData<T, P extends keyof T>(prop: P, data: T[], asc?: boolean): T[] {
  const sorter = asc ? (a: T, b: T) => a[prop] > b[prop] ? 1 : -1 : (a: T, b: T) => a[prop] > b[prop] ? -1 : 1;
  return data.slice(0).sort(sorter);
}

function filterByProp<T>(data: T[], prop: keyof T, values: string[]): T[] {
  const valueMap: Record<any, true> = {};
  for (const value of values) valueMap[value] = true;
  return data.filter(row => valueMap[row[prop] as unknown as string]);
}

function filterByRegex<T>(data: T[], prop: keyof T, regex: RegExp): T[] {
  return data.filter(row => regex.test(row[prop] as unknown as string));
}

function filterByDate<T>(data: T[], prop: keyof T, from: number | null, to: number | null): T[] {
  if (from) {
    if (to)   return data.filter(row => (row[prop] as unknown as number) >= from && (row[prop] as unknown as number) < to);
    else      return data.filter(row => (row[prop] as unknown as number) >= from);
  } else {
    if (to)   return data.filter(row => (row[prop] as unknown as number) < to);
    else      return data.slice(0);
  }
}

function pushOnArray<T>(value: T, array: T[]): T[] {
  return [...array, value];
}

function removeFromArray<T>(value: T | null | undefined, array: T[]): T[] {
  const index = array.indexOf(value as T);
  return index < 0 ? array : array.slice(0, index).concat(array.slice(index + 1));
}

// function clearFilterSymbol() {
//   return '\u2715';
// }

export function Table<T>(props: TableProps<T>): JSX.Element {
  const { maxRows = 10, maxPages = 9, useEmptyRows = true, defaultSort } = props;
  const {data, columns, classes, headers, onFilter,
    initialPropSelectedAndPool, initialPropSearch, initialDateFilters } = useMemo(() => {
      return transformProps(props);
    }, [props.columns, props.data]);
  const [displayData, setDisplayData] = useState(data);
  const [propSelectedAndPool, setPropSelectedAndPool] = useState(initialPropSelectedAndPool);
  const [propSearched, setPropSearched] = useState(initialPropSearch);
  const [propDateFilters, setPropDateFilters] = useState(initialDateFilters);
  const [filterStack, setFilterStack] = useState<AppliedFilter[]>([]);
  const [sortedBy, setSortedBy] = useState(defaultSort ? { prop: defaultSort.prop, asc: defaultSort.asc === undefined ? true : defaultSort.asc } : {});
  const [selectedPage, setSelectedPage] = useState(0);
  const totalPages = displayData.length % maxRows === 0 ? (displayData.length / maxRows) - 1 : Math.floor(displayData.length / maxRows);
  const lastPageIsEmpty = totalPages * maxRows === displayData.length;
  const paginate = displayData.length > maxRows;
  const dataToShow =  paginate ? displayData.slice(selectedPage * maxRows, selectedPage * maxRows + maxRows) : displayData;
  const onRowClick = props.onRowClick || noOp;
  const emptyRows = useEmptyRows &&
    data.length > maxRows &&
    dataToShow.length < maxRows ? (new Array(maxRows - dataToShow.length).fill(0)) : [];
  useEffect(function updatePropsSelectedAndPool() {
    setPropSelectedAndPool(initialPropSelectedAndPool);
  }, [initialPropSelectedAndPool])
  useEffect(function applyFilters() {
    let filteredData = data;
    const appliedSelectFilters: {[prop: string]: boolean} = {};
    for (const { prop, type, value, values, dates}  of filterStack) {
      switch (type) {
        case 'search':
          filteredData = filterByRegex(filteredData as any[], prop, new RegExp(value as string, 'i'));
          break;
        case 'select':
          appliedSelectFilters[prop] = true;
          propSelectedAndPool[prop] = { selected: values as string[], pool: getUniqueValuesByProp(prop, filteredData as any[]) };
          filteredData = filterByProp(filteredData as any[], prop, values as string[]);
          break;
        case 'date':
          const from = dates && dates[0] || null;
          const to = dates && dates[1] || null;
          filteredData = filterByDate(filteredData as any[], prop, from, to);
          break;
      }
    }
    for (const prop of Object.keys(propSelectedAndPool).filter(p => !appliedSelectFilters[p])) {
      const pool = getUniqueValuesByProp(prop, filteredData as any[]);
      pool.sort();
      propSelectedAndPool[prop] = { selected: propSelectedAndPool[prop].selected, pool };
    }
    if (sortedBy.prop) {
      filteredData = sortData(sortedBy.prop, filteredData as any[], sortedBy.asc as boolean);
    } 
    setDisplayData(filteredData);
    setPropSelectedAndPool({...propSelectedAndPool});
    setSelectedPage(0);
  }, [filterStack]);
  
  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  useEffect(() => {
    if (onFilter) onFilter(displayData);
  }, [displayData]);

  function onFilterSelect(prop: string): (selected: string[]) => any {
    return selected => {
      let updatedFilterStack = removeFromArray(filterStack.find(f => f.prop === prop), filterStack);
      if (propSelectedAndPool[prop] && selected.length < propSelectedAndPool[prop].pool.length) {
        updatedFilterStack = pushOnArray({type: 'select', prop, values: selected}, updatedFilterStack);
      }
      setFilterStack(updatedFilterStack);
    };
  }

  function onSearchChange(prop: string): (event: { target: { value: string }}) => any {
    return event => {
      const text = event.target.value;
      propSearched[prop] = text;
      let updatedFilterStack = removeFromArray(filterStack.find(f => f.prop === prop), filterStack);
      if (text !== '') {
        updatedFilterStack = pushOnArray({type: 'search', prop, value: text}, updatedFilterStack);
      }
      setPropSearched({...propSearched});
      setFilterStack(updatedFilterStack);
    };
  }

  function onDateChange(prop: string, isFrom: boolean): (date: Date | null) => any {
    return date => {
      let updatedFilterStack = removeFromArray(filterStack.find(f => f.prop === prop), filterStack);
      const dates: [number | null, number | null] = isFrom ? [+(date as Date), propDateFilters[prop][1]] : [propDateFilters[prop][0], +(date as Date)];
      propDateFilters[prop] = dates;
      if (date !== null || propDateFilters[prop][isFrom ? 1 : 0]) {
        updatedFilterStack = pushOnArray({type: 'date', prop, dates}, updatedFilterStack);
      }
      setPropDateFilters({...propDateFilters});
      setFilterStack(updatedFilterStack);

    };
  }

  function onSortData(prop: keyof T) {
    return () => {
      const asc = !sortedBy.asc;
      setSortedBy({prop, asc});
      setDisplayData(sortData(prop, displayData, asc));
    };
  }
  function makePaginationButton(n: number) {
    return <button key={n} className={selectedPage === n ? classes.paginationButtonSelected : classes.paginationButton} onClick={() => setSelectedPage(n)}>{n + 1}</button>;
  }
  function makeThreeDots(key: string) {
    return <button key={key} className={classes.paginationButton} disabled >...</button>;
  }
  return (
      <div className={classes.container}>
        <table className={classes.table}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th className={`${classes.header} ${h.className || ''}`} key={i} style={{width: h.width}}>
                <div className="grid grid-cols-[1fr_1rem] h-full">
                  <div>
                    <label>{h.label}</label>
                    <div>
                      {h.filter === 'select'
                      ? (
                        <MultiSelect
                          className={classes.input}
                          value={propSelectedAndPool[h.prop as string] ? propSelectedAndPool[h.prop as string].selected : []}
                          pool={propSelectedAndPool[h.prop as string] ? propSelectedAndPool[h.prop as string].pool : []}
                          onChange={onFilterSelect(h.prop as string)}
                        />
                      ) : h.filter === 'search'
                      ? (
                        <div className={classes.search}>
                          <input value={propSearched[h.prop as string]} className={classes.input} onChange={onSearchChange(h.prop as string)} placeholder={'Search'}/>
                          <button className={classes.searchButton}></button>
                        </div>
                      ) : h.filter === 'date'
                      ? (
                        <div className={classes.datePickerContainer}>
                          <DatePickerToday
                            className={classes.datePickerInput}
                            selected={propDateFilters[h.prop as string][0] ? new Date(propDateFilters[h.prop as string][0] as number) : null}
                            onChange={onDateChange(h.prop as string, true)}
                            placeholderText="From">
                          </DatePickerToday>
                          <DatePickerToday
                            className={classes.datePickerInput}
                            selected={propDateFilters[h.prop as string][1] ? new Date(propDateFilters[h.prop as string][1] as number) : null}
                            onChange={onDateChange(h.prop as string, false)}
                            placeholderText="To" >
                          </DatePickerToday>
                        </div>
                      ) : <div></div>
                    }
                    </div>
                  </div>
                  {h.sort
                    ? (
                      <div onClick={onSortData(h.prop)} className={classes.sort}>
                        {!sortedBy.asc || h.prop !== sortedBy.prop ? <div>{'\u25B2'}</div> : <div></div>}
                        {sortedBy.asc || h.prop !== sortedBy.prop ? <div>{'\u25BC'}</div> : <div></div>}
                      </div>
                    ) : <div />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataToShow.map((row, i) =>
            <tr key={i} className={i % 2 === 0 ? classes.row2 : classes.row} onClick={() => onRowClick(row)}>
              {columns.map((c, j) =>
                <td key={j} className={c.getClass(row, i)}>{c.getValue(row)}</td>
              )}
            </tr>
          )}
          {emptyRows.map((_, i) =>
            <tr key={i} className={i % 2 === 0 ? classes.row2 : classes.row}>
              {columns.map((c, j) =>
                <td key={j} ></td>
              )}
            </tr>
          )}
        </tbody>
      </table>
        {paginate
          ? (
            <div className={classes.pagination}>
              <button className={classes.paginationButton} disabled={selectedPage === 0} onClick={() => setSelectedPage(selectedPage - 1)}>{'\u25C0'}</button>
              {makePaginationButton(0)}
              {totalPages <= maxPages
                ? range(1, totalPages).map(n => (
                  <button key={n} className={selectedPage === n ? classes.paginationButtonSelected : classes.paginationButton} onClick={() => setSelectedPage(n)}>
                    {n + 1}
                  </button>
                ))
                : selectedPage < 3 || selectedPage > totalPages - 3
                  ? [ ...range(1, 4).map(makePaginationButton), makeThreeDots('...'), ...range(totalPages - 3, totalPages).map(makePaginationButton) ]
                  : [ makeThreeDots('...1'), ...range(selectedPage - 2, selectedPage + 3).map(makePaginationButton), makeThreeDots('...2')]
              }
              {lastPageIsEmpty ? null : makePaginationButton(totalPages)}
              <button className={classes.paginationButton} disabled={selectedPage === totalPages} onClick={() => setSelectedPage(selectedPage + 1)}>{'\u25B6'}</button>
            </div>
          ) : null
        }        
    </div>
    
  );
}
