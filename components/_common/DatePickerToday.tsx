import DatePicker from 'react-datepicker';
import React from 'react';


interface DatePickerTodayProps {
  className?: string;
  selected: Date | null;
  onChange: (date: Date | null, event?: React.SyntheticEvent<any, Event>) => void;
  placeholderText?: string;
}

export const DatePickerToday: React.FC<DatePickerTodayProps> = function DatePickerToday(
  {className = '', selected, onChange, placeholderText}) {
  return (
    <div>
      <DatePicker
        className={"form-control " + className}
        dateFormat="yyyy-MM-dd"
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}>
        <div className="h-8 flex absolute bottom-[-2rem] z-4 bg-inherit border-[1px] w-full left-[-1px] rounded-b-md secondary box-content">

          <button className="block w-1/2 transition-all secondary-hover border-r-[1px] " onClick={() => onChange(new Date())}>TODAY</button>
          <button className="block w-1/2 transition-all secondary-hover " onClick={() => onChange(null)}>CLEAR</button>
        </div>
      </DatePicker>    
    </div>
  )
}

/*
datePickerButtonToday: "absolute bottom-[-2rem] z-4 h-8 left-0 w-1/2",
datePickerButtonClear: "absolute bottom-[-2rem] z-4 h-8 right-0 w-1/2",
*/