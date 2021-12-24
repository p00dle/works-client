import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHideOnClickOutside } from '~/lib/react-utils';

interface MultiSelectProps {
  pool?: string[];
  value: string[];
  onChange: (value: string[]) => any;
  className?: string;
}

interface ListItem {
  selected: boolean;
  value: string;
}

function selectedIcon() {
  return '\u2611';
}

function notSelectedIcon() {
  return '\u2610';
}

function getListItems(selectedItems: string[], pool: string[]): ListItem[] {
  const selectedMap = {} as Record<string, true>;
  for (const item of selectedItems) {
    selectedMap[item] = true;
  }
  const output: ListItem[] = [];
  for (const value of pool) {
    const selected = selectedMap[value];
    output.push({value, selected});
  }
  return output;
}

export const MultiSelect: React.FC<MultiSelectProps> = function MultiSelect({value, onChange, pool, className = ''}) {
  if (!Array.isArray(pool)) throw new Error('pool must be an array');
  const {ref, shouldShow, show, hide} = useHideOnClickOutside(false);
  const [currentlySelected, setCurrentlySelected] = useState(value);
  function onClickSelect() {
    hide();
    onChange(currentlySelected);
  }
  function onClickCancel() {
    hide();
    setCurrentlySelected(value);
  }  
  useEffect(() => {
    setCurrentlySelected(value);
  }, [value])
  const allSelected = currentlySelected.length >= pool.length;
  const listItems = getListItems(currentlySelected, pool);
  const inputValue = allSelected
    ? pool.length === 0 ? 'None' : pool.length === 1 ? currentlySelected[0] : 'All'
    : currentlySelected.length === 1
      ? currentlySelected[0]
      : currentlySelected.length === 0 || pool.length === 0
        ? 'None'
        : 'Multiple';
  function selectFactory(item: ListItem): () => any {
    return () => {
      if (item.selected) {
        const index = currentlySelected.indexOf(item.value);
        if (index >= 0) setCurrentlySelected([...currentlySelected.slice(0, index), ...currentlySelected.slice(index + 1)]);
      } else {
        setCurrentlySelected([...currentlySelected, item.value]);
      }
    };
  }
   
  return (
    <div className={shouldShow ? 'arrow-up' : 'arrow-down'} ref={ref}>
      <input readOnly className={"form-control " + className} onClick={shouldShow ? hide : show} value={inputValue} />
      <div className={"absolute secondary border-2 rounded-md z-[4] select-none min-w-full " + (shouldShow ? "block" : "hidden")}>
        <ul className="block overflow-x-auto max-h-72 font-normal">
          <li className="flex p-1 space-x-2 cursor-pointer secondary-hover"
            key="___Select All" onClick={() => allSelected ? setCurrentlySelected([]) : setCurrentlySelected(pool)}>
            <div>{allSelected ? selectedIcon() : notSelectedIcon() }</div>
            <div>Select All</div>
          </li>
          {listItems.map(item =>
            <li className="flex p-1 space-x-2 cursor-pointer secondary-hover" key={item.value} onClick={selectFactory(item)}>
              <div>{item.selected ? selectedIcon() : notSelectedIcon() }</div>
              <div>{item.value}</div>
            </li>
          )}
        </ul>
        <div className="primary flex border-t-2 rounded-b-md">
          <button className="block grow border-r-2 border-inherit secondary-hover px-2" onClick={onClickSelect}>SELECT</button>
          <button className="block grow secondary-hover px-2" onClick={onClickCancel}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};


/*
return (
    <div className={shouldShow ? 'arrow-up' : 'arrow-down'} ref={ref}>
      <input readOnly className={className || "form-control"}  onClick={shouldShow ? hide : show} value={displayLabel} />
      <ul className={"py-1 absolute w-full secondary border-2 rounded-md z-[4] " + (shouldShow ? "block" : "hidden")} >
        { items.map(item => <SelectItem item={item} key={item.label} onSelect={onSelect} />) }
      </ul>
    </div>
  );
}

*/