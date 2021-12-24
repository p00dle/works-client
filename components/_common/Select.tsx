import * as React from 'react';
import { useState } from 'react';
import { useHideOnClickOutside } from '~/lib/react-utils';

interface Option<T> {
  label: string;
  value?: T;
  subMenu?: Option<T>[];
}

interface SelectProps<T> {
  name?: string;
  value: T extends string ? string : T;
  inputName?: string;
  pool?: Option<T>[] | string[];
  onChange?: (value: T) => any;
  disabled?: boolean;
  className?: string;
  id?: string;
}

interface SelectItemProps<T> {
  item: Option<T>;
  onSelect: (item: Option<T>) => any;
}

function isOptions<T>(arr: Option<T>[] | string[]): arr is Option<T>[] {
  return Array.isArray(arr) && arr.length > 0 && typeof (arr[0] as any).label === 'string';
}

function makeOptions<T>(arr: Option<T>[] | string[]) {
  return isOptions(arr) ? arr : (arr.map(label => ({label, value: label})) as unknown as Option<T>[]);
}

export function SelectItem<T>({item, onSelect}: SelectItemProps<T>): JSX.Element {
  const [collapsed, setCollapsed] = useState(true);
  const { label, subMenu } = item;
  const hasSubMenu = Array.isArray(subMenu) && subMenu.length > 0;
  const toggleCollapse = () => setCollapsed(prevValue => !prevValue);

  function onClick() {
    if (hasSubMenu) toggleCollapse();
    else onSelect(item);
  }

  const arrowClass = hasSubMenu
    ? collapsed
      ? 'arrow-up'
      : 'arrow-down'
    : '';

  return (
    <li className="" >
      <div className={"secondary-hover p-1" + arrowClass} onClick={onClick}>{label}</div>
      { Array.isArray(subMenu) && !collapsed
        ? (
          <ul className="">
            { subMenu.map(subItem => <SelectItem key={subItem.label} item={subItem} onSelect={onSelect} />)}
          </ul>
        )
        : null }
    </li>
  );
}

export function Select<T>({value, onChange, pool, disabled = false, name, className = '', id}: SelectProps<T>): JSX.Element {
  if (!Array.isArray(pool)) throw new Error('pool must be an array');
  const { shouldShow, show, hide, ref } = useHideOnClickOutside(false);
  const items = makeOptions(pool);
  function onSelect(item: Option<T>) {
    if (onChange && typeof item.value !== 'undefined') onChange(item.value);
    hide();
  }
  const displayLabel = String(items.some(a => a.value !== undefined) ? (items.find(a => a.value === value) || {label: ''}).label : value);
  return (
    <div className={shouldShow ? 'arrow-up' : 'arrow-down'} ref={ref}>
      <input readOnly className={"form-control " + className}  onClick={disabled ? undefined : (shouldShow ? hide : show)} value={displayLabel} disabled={disabled} name={name} id={id} />
      <ul className={"py-1 absolute w-full secondary border-2 rounded-md z-[4] select-none max-h-72 overflow-x-auto " + (shouldShow ? "block" : "hidden")} >
        { items.map(item => <SelectItem item={item} key={item.label} onSelect={onSelect} />) }
      </ul>
    </div>
  );
}
