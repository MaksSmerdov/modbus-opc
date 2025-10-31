import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  fullWidth = false,
  options,
  placeholder = 'Выберите...',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const classes = [
    styles['select-wrapper'],
    fullWidth && styles['select-wrapper--full-width'],
    error && styles['select-wrapper--error'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className={styles.select__label} htmlFor={selectId}>
          {label}
          {props.required && <span className={styles.select__required}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={styles.select__field}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.select__error}>{error}</span>}
    </div>
  );
}

