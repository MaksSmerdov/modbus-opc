import { forwardRef } from 'react';
import { Tooltip, CircularProgress } from '@mui/material';
import classNames from 'classnames';
import styles from './IconButton.module.scss';

export type IconButtonVariant = 'default' | 'power' | 'log' | 'edit' | 'delete';

export interface IconButtonProps {
    icon: React.ReactNode;
    tooltip?: string;
    disabled?: boolean;
    variant?: IconButtonVariant;
    active?: boolean;
    onClick?: () => void;
    className?: string;
    'aria-label'?: string;
    isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, tooltip, disabled = false, variant = 'default', active = false, onClick, className, 'aria-label': ariaLabel, isLoading = false }, ref) => {
        const buttonClasses = classNames(
            styles['iconButton'],
            styles[`iconButton_${variant}`],
            {
                [styles['iconButton_active']]: active,
                [styles['iconButton_disabled']]: disabled || isLoading,
            },
            className
        );

        const button = (
            <button
                ref={ref}
                className={buttonClasses}
                onClick={onClick}
                disabled={disabled || isLoading}
                aria-label={ariaLabel || tooltip}
                type="button"
            >
                {isLoading ? (
                    <CircularProgress size={16} className={styles['iconButton__loader']} />
                ) : (
                    icon
                )}
            </button>
        );

        if (tooltip) {
            return (
                <Tooltip title={tooltip} arrow>
                    <span>
                        {button}
                    </span>
                </Tooltip>
            );
        }

        return button;
    }
);

IconButton.displayName = 'IconButton';

