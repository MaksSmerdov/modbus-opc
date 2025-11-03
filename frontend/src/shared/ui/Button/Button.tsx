import { forwardRef } from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import classNames from 'classnames';
import styles from './Button.module.scss';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'className'> {
  className?: string;
  variant?: 'contained' | 'outlined' | 'text' ;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'contained', size = 'medium', fullWidth, ...props }, ref) => {
    const buttonClasses = classNames(
      styles.button,
      {
        [styles.button_contained]: variant === 'contained',
        [styles.button_outlined]: variant === 'outlined',
        [styles.button_text]: variant === 'text',
        [styles.button_small]: size === 'small',
        [styles.button_medium]: size === 'medium',
        [styles.button_large]: size === 'large',
        [styles.button_fullWidth]: fullWidth,
      },
      className
    );

    return (
      <MuiButton
        {...props}
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={buttonClasses}
        classes={{
          root: styles.button__root,
        }}
      />
    );
  }
);

Button.displayName = 'Button';