"use client";

import React, { useState, useEffect, forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { ptBR } from 'date-fns/locale/pt-BR';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import "../components/datepicker.css"; // Update this import path

// Registrar o locale pt-BR
registerLocale('pt-BR', ptBR);
setDefaultLocale('pt-BR');

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = "Selecione uma data",
  required = false,
  icon = <FaCalendarAlt />,
  className = "",
}) => {
  // Converter string para objeto Date
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  
  // Atualizar o estado interno quando o valor externo mudar
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Manipulador de mudança de data
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    
    // Converter para formato ISO (YYYY-MM-DD) para armazenamento
    if (date) {
      const isoDate = date.toISOString().split('T')[0];
      onChange(isoDate);
    } else {
      onChange('');
    }
  };

  // Componente personalizado para o botão do calendário
  const CustomInput = forwardRef<HTMLInputElement, React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>(
    ({ value, onClick, onChange, placeholder }, ref) => (
      <div className="relative">
        <input
          ref={ref}
          className={`w-full px-2 py-1.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 transition-colors duration-200 text-sm pr-8 ${className}`}
          value={value as string}
          onChange={onChange}
          onClick={onClick}
          placeholder={placeholder}
          readOnly
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer text-[var(--primary)] hover:text-[var(--primary-hover)]"
          onClick={onClick}
        >
          {icon}
        </div>
      </div>
    )
  );

  // Renderização personalizada do cabeçalho do calendário
  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className="p-1 rounded-full hover:bg-[var(--hover-bg)] text-[var(--foreground)] disabled:opacity-50 transition-colors duration-200"
      >
        <FaChevronLeft size={14} />
      </button>

      <div className="flex space-x-2">
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(Number(value))}
          className="px-2 py-1 text-sm border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          {Array.from({ length: 20 }, (_, i) => date.getFullYear() - 10 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={date.getMonth()}
          onChange={({ target: { value } }) => changeMonth(Number(value))}
          className="px-2 py-1 text-sm border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          {[
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
          ].map((month, i) => (
            <option key={month} value={i}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className="p-1 rounded-full hover:bg-[var(--hover-bg)] text-[var(--foreground)] disabled:opacity-50 transition-colors duration-200"
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center">
          {icon && <span className="mr-1 text-[var(--primary)] text-xs">{icon}</span>} {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <ReactDatePicker
          id={id}
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          customInput={<CustomInput placeholder={placeholder} />}
          renderCustomHeader={renderCustomHeader}
          showPopperArrow={false}
          popperClassName="date-picker-popper z-50 !w-[220px]"
          calendarClassName="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-lg animate-fadeIn !text-xs"
          dayClassName={date => 
            `hover:bg-[var(--primary-light)] rounded-full transition-colors duration-200 !py-1 !h-6 !w-6 !leading-4 !m-[0.1rem]
             ${date.getDate() === selectedDate?.getDate() && 
               date.getMonth() === selectedDate?.getMonth() && 
               date.getFullYear() === selectedDate?.getFullYear() 
               ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]' 
               : ''}`
          }
          shouldCloseOnSelect={true}
          inline={false}
          wrapperClassName="w-full"

          weekDayClassName={() => "!text-xs !py-1 !h-5 !w-6 !m-[0.1rem]"}
        />
      </div>
      
      <style jsx global>{`
        .react-datepicker__header {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        .react-datepicker__month-container {
          width: 220px !important;
          padding-bottom: 0.3rem !important;
        }
        .react-datepicker__day-name {
          margin: 0.1rem !important;
          width: 1.5rem !important;
          height: 1.2rem !important;
          line-height: 1.2rem !important;
          font-size: 0.7rem !important;
        }
        .react-datepicker-wrapper,
        .react-datepicker__input-container {
          display: block !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default DatePicker;
