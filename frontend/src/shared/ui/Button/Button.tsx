import { forwardRef } from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import classNames from 'classnames';
import styles from './Button.module.scss';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'className'> {
  className?: string;
  variant?: 'contained' | 'outlined' | 'text' | 'success' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'contained', size = 'medium', fullWidth, sx, ...props }, ref) => {
    // Маппинг новых вариантов на старые для MUI
    const muiVariant = variant === 'success' || variant === 'danger' || variant === 'default'
      ? 'contained'
      : variant;

    const buttonClasses = classNames(
      styles.button,
      {
        [styles.button_contained]: variant === 'contained',
        [styles.button_outlined]: variant === 'outlined',
        [styles.button_text]: variant === 'text',
        [styles.button_success]: variant === 'success',
        [styles.button_danger]: variant === 'danger',
        [styles.button_default]: variant === 'default',
        [styles.button_small]: size === 'small',
        [styles.button_medium]: size === 'medium',
        [styles.button_large]: size === 'large',
        [styles.button_fullWidth]: fullWidth,
      },
      className
    );

    // Определяем цвета для новых вариантов через sx prop для надежного переопределения MUI стилей
    let variantSx: Record<string, unknown> | undefined = undefined;
    if (variant === 'success') {
      variantSx = {
        backgroundColor: '#2e7d32', // Более приглушенный зеленый (Material-UI success)
        color: 'white',
        '&:hover': {
          backgroundColor: '#1b5e20',
        },
        '&:disabled': {
          backgroundColor: 'rgba(46, 125, 50, 0.3)',
          color: 'rgba(255, 255, 255, 0.5)',
        },
      };
    } else if (variant === 'danger') {
      variantSx = {
        backgroundColor: '#c62828', // Еще более приглушенный красный
        color: 'white',
        '&:hover': {
          backgroundColor: '#b71c1c',
        },
        '&:disabled': {
          backgroundColor: 'rgba(198, 40, 40, 0.3)',
          color: 'rgba(255, 255, 255, 0.5)',
        },
      };
    } else if (variant === 'default') {
      variantSx = {
        backgroundColor: '#1976d2', // Более приглушенный синий (Material-UI primary)
        color: 'white',
        '&:hover': {
          backgroundColor: '#1565c0',
        },
        '&:disabled': {
          backgroundColor: 'rgba(25, 118, 210, 0.3)',
          color: 'rgba(255, 255, 255, 0.5)',
        },
      };
    }

    // Объединяем sx стили
    const combinedSx = variantSx
      ? (Array.isArray(sx) ? [variantSx, ...sx] : sx ? [variantSx, sx] : variantSx)
      : sx;

    return (
      <MuiButton
        {...props}
        ref={ref}
        variant={muiVariant}
        size={size}
        fullWidth={fullWidth}
        className={buttonClasses}
        sx={combinedSx}
        classes={{
          root: styles.button__root,
        }}
      />
    );
  }
);

Button.displayName = 'Button';