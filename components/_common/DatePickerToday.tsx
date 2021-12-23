import DatePicker from 'react-datepicker';
import React from 'react';


interface DatePickerTodayProps {
  className?: string;
  selected: Date | null;
  onChange: (date: Date | null, event?: React.SyntheticEvent<any, Event>) => void;
  placeholderText?: string;
}

export const DatePickerToday: React.FC<DatePickerTodayProps> = function DatePickerToday(
  {className = 'form-control', selected, onChange, placeholderText}) {
  return (
    <div>
      <DatePicker
        className={className}
        dateFormat="yyyy-MM-dd"
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}>
        <div className="h-8 flex absolute bottom-[-2rem] z-4 bg-inherit border-[1px] w-full left-[-1px] rounded-b-md border-stone-500 box-content">

          <button className="block w-1/2 transition-all hover:bg-sky-500 border-r-[1px] border-r-stone-500" onClick={() => onChange(new Date())}>TODAY</button>
          <button className="block w-1/2 transition-all hover:bg-sky-500 " onClick={() => onChange(null)}>CLEAR</button>
        </div>
      </DatePicker>    
    </div>
  )
}

/*
datePickerButtonToday: "absolute bottom-[-2rem] z-4 h-8 left-0 w-1/2",
datePickerButtonClear: "absolute bottom-[-2rem] z-4 h-8 right-0 w-1/2",
*/