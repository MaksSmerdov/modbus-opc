import { forwardRef } from 'react';
import {
    Select as MuiSelect,
    FormControl,
    InputLabel,
    FormHelperText,
    type SelectProps as MuiSelectProps,
} from '@mui/material';
import classNames from 'classnames';
import styles from './Select.module.scss';

export interface SelectProps extends Omit<MuiSelectProps, 'variant' | 'className'> {
    className?: string;
    label?: string;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
    ({ className, label, error, helperText, fullWidth = true, children, ...props }, ref) => {
        const selectClasses = classNames(
            styles['select'],
            {
                [styles['select_error']]: error,
                [styles['select_fullWidth']]: fullWidth,
            },
            className
        );

        const displayHelperText = helperText !== undefined && helperText !== null ? helperText : ' ';
        const isPlaceholder = helperText === undefined || helperText === null;

        return (
            <FormControl
                fullWidth={fullWidth}
                error={error}
                className={selectClasses}
                classes={{
                    root: styles['select__root'],
                }}
            >
                {label && <InputLabel className={styles['select__label']}>{label}</InputLabel>}
                <MuiSelect
                    {...props}
                    ref={ref}
                    label={label}
                    className={styles['select__input']}
                    classes={{
                        root: styles['select__selectRoot'],
                    }}
                >
                    {children}
                </MuiSelect>
                <FormHelperText
                    className={isPlaceholder ? styles['select__helperPlaceholder'] : styles['select__helperText']}
                >
                    {displayHelperText}
                </FormHelperText>
            </FormControl>
        );
    }
);

Select.displayName = 'Select';

