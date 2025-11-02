import { forwardRef, useMemo } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';
import classNames from 'classnames';
import styles from './Input.module.scss';

export interface InputProps extends Omit<TextFieldProps, 'variant' | 'className'> {
  className?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, fullWidth = true, ...props }, ref) => {
    const inputClasses = classNames(
      styles.input,
      {
        [styles.input_error]: error,
        [styles.input_fullWidth]: fullWidth,
      },
      className
    );

    // Передаем пробел только когда helperText действительно отсутствует (undefined/null)
    // Это резервирует место для helper text, чтобы элементы не съезжали
    const displayHelperText = helperText !== undefined && helperText !== null ? helperText : ' ';
    const isPlaceholder = helperText === undefined || helperText === null;

    // Создаем объект classes только когда нужно
    const muiClasses = useMemo(() => {
      const baseClasses = {
        root: styles['input__root'],
      };

      if (isPlaceholder) {
        return {
          ...baseClasses,
          helperText: styles['input__helperPlaceholder'],
        };
      }

      return baseClasses;
    }, [isPlaceholder]);

    return (
      <TextField
        {...props}
        ref={ref}
        error={error}
        helperText={displayHelperText}
        fullWidth={fullWidth}
        variant="outlined"
        className={inputClasses}
        classes={muiClasses}
      />
    );
  }
);

Input.displayName = 'Input';