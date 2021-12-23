import * as React from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { HoverHint } from '~/components/_common/HoverHint';
import { Select } from '~/components/_common/Select';
import { format } from '~/lib/format';
import { useUid } from '~/lib/react-utils/useUid';

type InputType = 
  | 'integer' 
  | 'string' 
  | 'text' 
  | 'boolean' 
  | 'float' 
  | 'email' 
  | 'password' 
  | 'date' 
  | 'hidden'
  | 'enum'
  | 'submit'
  | 'file'
;

interface BaseInputProps {
  type: InputType;
  _value?: any;
  _onChange?: (...args: any[]) => any;
  _formUid?: string;
}

interface RestInputProps extends BaseInputProps {
  type: 'integer' | 'string' | 'text' | 'boolean' | 'float' | 'email' | 'password' | 'date' | 'file';
  prop: string;
  label?: string;
  initialValue?: any;
  hint?: string;
  readOnly?: boolean;
  className?: string;
}

interface HiddenInputProps extends BaseInputProps {
  type: 'hidden';
  prop: string;
  initialValue: any;
}

interface EnumInputProps extends BaseInputProps {
  type: 'enum';
  prop: string;
  values: string[] | {label: string, value: string}[];
  label?: string;
  initialValue?: any;
  hint?: string;
  readOnly?: boolean;
  className?: string;
}

interface SubmitInputProps extends BaseInputProps {
  type: 'submit';
  label?: string;
  className?: string;
}

type InputProps = 
  | RestInputProps
  | HiddenInputProps
  | EnumInputProps
  | SubmitInputProps
;
type NonSubmitInputProps = 
  | RestInputProps
  | HiddenInputProps
  | EnumInputProps
;

type NonHiddenInputProps = 
  | RestInputProps
  | SubmitInputProps
  | EnumInputProps
;


interface FormProps {
  onSubmit?: (values: any) => void;
  className?: string;
  display?: 'horizontal' | 'vertical';
}

function noOp() {

}

const inputTypes = {
  'integer': 'number',
  'float': 'number',
  'email': 'email',
  'string': 'text',
  'hidden': 'hidden',
  'password': 'password',
  'boolean': 'checkbox',
  'file': 'file',
} as const;

function areValuesStrings(arr: any[]): arr is string[] {
  return typeof arr[0] === 'string';
}



export const Input: React.FC<InputProps> = function Input(props) {
  const onChange = props._onChange || (() => void 0);
  switch(props.type) {
    case 'integer':
    case 'float':
    case 'string':
    case 'email':
    case 'password': 
    case 'boolean':
    case 'file':
      return <input type={inputTypes[props.type]} className={props.className || "form-control"} value={props._value} disabled={props.readOnly} name={props.prop} onChange={ev => onChange(props.type === 'boolean' ? ev.target.checked : ev.target.value) } id={props._formUid + props.prop} />
    case 'hidden':
      return <input type="hidden" value={props._value} name={props.prop} />
    case 'submit':
      return <input type="submit" className={props.className || "btn btn-primary"} value={props.label || 'SUBMIT'} />;
    case 'date':
      return <div><DatePicker selected={!props._value ? props._value : new Date(props._value)} dateFormat="yyyy-MM-dd" className={props.className || "form-control w-full"} onChange={date => onChange(date === null ? null : +date)} id={props._formUid + props.prop} /> </div>
    case 'text':
      return <textarea name={props.prop} className={props.className || "form-control"} disabled={props.readOnly} value={props._value} onChange={ev => onChange(ev.target.value)} id={props._formUid + props.prop} />
    case 'enum':
      if (!Array.isArray(props.values)) throw new Error('Input with type enum requires values to be an array');
      const options = areValuesStrings(props.values) ? props.values.map(val => ({label: val, value: val})) : props.values;
      return (
        <Select 
          name={props.prop} 
          value={props._value} 
          disabled={props.readOnly} 
          className={props.className || "form-control relative w-full"} 
          onChange={onChange} 
          id={props._formUid + props.prop}
          pool={options} />
      );
    default:
      // @ts-expect-error
      throw new Error('Invalid Input type: ' + props.type);
  }
}

// function serializeForm(form: HTMLFormElement): {[key: string]: any} {
//   const formData = new FormData(form);
//   const output = {};
//   formData.forEach((value, key) => {
//     output[key] = value;
//   });
//   return output;
// }

type InputElement = React.ReactElement<InputProps, typeof Input>

type HiddenInputElement = React.ReactElement<HiddenInputProps, typeof Input>

type NonSubmitInputElement = React.ReactElement<NonSubmitInputProps, typeof Input>;

type NonHiddenInputElement = React.ReactElement<NonHiddenInputProps, typeof Input>;

function validateChildren(children: React.ReactNode): InputElement[] {
  const arr = Array.isArray(children) ? children : [children];
  for (const elem of arr) {
    if (elem.type !== Input) {
      console.debug(elem);
      throw Error('Form only accepts Input as children');
    } 
  }
  return arr;
}

const defaultValuesByType: Record<InputType, any> = {
  'boolean': false,
  'date': null,
  'email': '',
  'enum': '',
  'float': 0,
  'hidden': null,
  'integer': 0,
  'password': '',
  'string': '',
  'submit': null,
  'text': '',
  'file': '',
}

function createInitialState(inputs: InputElement[] ): Record<string, any> {
  const output: Record<string, any> = {};
  for (const {props} of (inputs.filter(i => i.props.type !== 'submit' ) as NonSubmitInputElement[])) {
    const { prop, initialValue, type } = props;
    output[prop] = initialValue || defaultValuesByType[type];
  }
  return output;
}

export const Form: React.FC<FormProps> = function Form({onSubmit, children, className}) {
  const uid = useUid('form');
  const inputs = validateChildren(children);
  const [state, setState] = useState(() => createInitialState(inputs));
  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = function onFormSubmit(ev) {
    if (typeof onSubmit !== 'function') return;
    ev.preventDefault();
    onSubmit(state);
  }
  const onChangeFactory = (prop: string) => (val: any) => setState({...state, [prop]: val});

  return (
    <form className={className || "grid grid-cols-2 space-y-2 relative"} onSubmit={onFormSubmit} >
      {(inputs.filter(i => i.props.type !== 'hidden') as NonHiddenInputElement[]).map(({props}) => (
        props.type === 'submit' 
          ? [
            <label key={props.label ? props.label + '-label' : 'submit-label'} />,
            <Input key={props.label ? props.label + '-input' : 'submit-input'} {...props} />
          ] 
          : [
            <label key={props.prop + '-label'} className="pr-4 flex flex-row-reverse items-center" htmlFor={uid + props.prop} >
              {props.hint ? <HoverHint text={props.hint} /> : null}
              <span>{props.label || props.prop ? format.string.camelCaseToUpperCase(props.prop) : null}</span>
            </label>,
            <Input key={props.prop + '-input'} {...props} _value={state[props.prop]} _onChange={onChangeFactory(props.prop)} _formUid={uid} />
            ]
        ))}
      {(inputs.filter(i => i.props.type === 'hidden') as HiddenInputElement[]).map(({props}) => (
        <Input {...props} _value={state[props.prop]} key={props.prop} />
      ))}
    </form>
  );
};
