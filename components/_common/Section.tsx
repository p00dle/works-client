import { IconName } from '@fortawesome/fontawesome-common-types';
import * as React from 'react';
import { DatePickerToday } from '~/components/_common/DatePickerToday';
import { Icon } from '~/components/_common/Icon';
import { MultiSelect } from '~/components/_common/MutliSelect';
import { Select } from '~/components/_common/Select';
import { CsvColumns, CsvOptions, saveCsvAs } from '~/lib/csv';
import { format } from '~/lib/format';
import { useLocalStorageState } from '~/lib/react-utils';

type SectionControlType = 'select' | 'multi-select' | 'date' | 'export';

type Setters<T extends Record<string, any>> = Record<keyof T, <K extends keyof T>(val: T[K]) => void>;

interface SectionControlBase {
  type: SectionControlType;
  label?: string;
  icon?: IconName;
}

interface SectionControlNoProps extends SectionControlBase {
  type: 'date';
}

interface SectionControlSelect extends SectionControlBase {
  type: 'select' | 'multi-select';
  pool: string[];
}

interface SectionExport<T = any, X = T> {
  data: X[] | [T[], (data: T[]) => X[]];
  filename?: string;
  columns?: CsvColumns<X>;
  csvOptions?: Partial<CsvOptions>;
  icon?: IconName;
}

type SectionControl = 
  | SectionControlNoProps
  | SectionControlSelect

interface SectionProps<T extends Record<string, any>> {
  state?: T;
  setters?: Setters<T>;
  identifier?: string;
  title?: React.ReactNode | JSX.Element | string;
  controls?: Record<keyof T, SectionControl>;
  className?: string;
  sectionClassName?: string;
  exportData?: SectionExport;
  children: React.ReactNode;
}

interface SectionControlProps {
  value: any;
  onChange: (value: any) => void;
  control: SectionControl;
  label: string;
}

const SectionControl: React.FC<SectionControlProps> = function SectionControl({value, onChange, control, label}) {
  function getControl() {
    switch(control.type) {
      case 'multi-select': 
        return <MultiSelect className="px-2 border-2 h-8 border-t-0 rounded-b-md rounded-t-none max-w-[12rem]" value={value} pool={control.pool} onChange={onChange} />
      case 'date':
        return <DatePickerToday className="px-2 border-2 h-8  border-t-0 rounded-b-md rounded-t-none max-w-[12rem]" selected={value} onChange={onChange} />
      case 'select':
        return <Select className="px-2 border-2 h-8 border-t-0 rounded-b-md rounded-t-none max-w-[12rem]" value={value} pool={control.pool} onChange={onChange} />
    }
  }
  return (
    <div className="">
      <label className="block border-2 rounded-t-md tertiary space-x-4 px-2 h-8 py-1">
        {control.icon ? <Icon icon={control.icon} /> : null }
        <span className="">{label}</span>
      </label>
      {getControl()}
    </div>
  )
};

export const Section = function Section<T extends Record<string, any>>({title, controls, children, className = '', state, setters, sectionClassName = '', exportData }: SectionProps<T>): JSX.Element {
  return (
    <section className={"secondary border-2 rounded-xl border-inherit" + sectionClassName} >
      {title || controls 
        ? <title className={"flex items-center border-b-2 border-inherit px-2 space-x-4 " + (controls ? "h-24" : "h-16")} >
            { title ? <div className="text-xl grow">{title}</div> : null }
            { controls 
              ? (state && setters) 
                ? Object.entries(controls).map(([prop, control]) => (
                  <SectionControl key={prop} value={state[prop]} onChange={setters[prop]} control={control} label={control.label || format.string.camelCaseToUpperCase(prop)} />
                  ))
                : null
              : null
            }
            { exportData
              ? <div className="flex items-center justify-center border-2 h-12 tertiary rounded-lg w-12 text-3xl cursor-pointer" onClick={() => saveCsvAs(exportData.filename || 'report.csv', exportData.data, exportData.columns, exportData.csvOptions)}>
                  <Icon icon={exportData.icon || 'download'} />
                </div>
              : null
            }
          </title>
        : null
      }
      <div className={className}>
        {children}
      </div>
    </section>
  );
};



export function useSectionState<T extends Record<string, any>>(localStorageId: string | null, initialState: T): [T, Setters<T>] {
  const [state, setState] = useLocalStorageState(localStorageId, initialState);
  const setters: Partial<Setters<T>> = {};
  for (const prop of Object.keys(initialState)) {
    setters[prop as keyof T] = (val: any) => {
      setState({...state, [prop]: val});
    };
  }
  return [state, setters as Setters<T>];
}
