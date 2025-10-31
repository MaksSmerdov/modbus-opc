import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const classes = [
    styles['input-wrapper'],
    fullWidth && styles['input-wrapper--full-width'],
    error && styles['input-wrapper--error'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className={styles.input__label} htmlFor={inputId}>
          {label}
          {props.required && <span className={styles.input__required}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={styles.input__field}
        {...props}
      />
      {error && <span className={styles.input__error}>{error}</span>}
    </div>
  );
}

