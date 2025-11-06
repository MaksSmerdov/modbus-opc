import { forwardRef } from 'react';
import { Skeleton as MuiSkeleton, type SkeletonProps as MuiSkeletonProps } from '@mui/material';
import classNames from 'classnames';
import styles from './Skeleton.module.scss';

export interface SkeletonProps extends Omit<MuiSkeletonProps, 'className'> {
    className?: string;
    variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
    animation?: 'pulse' | 'wave' | false;
    width?: number | string;
    height?: number | string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangular', animation = 'wave', width, height, ...props }, ref) => {
        const skeletonClasses = classNames(
            styles['skeleton'],
            {
                [styles['skeleton_text']]: variant === 'text',
                [styles['skeleton_rectangular']]: variant === 'rectangular',
                [styles['skeleton_rounded']]: variant === 'rounded',
                [styles['skeleton_circular']]: variant === 'circular',
            },
            className
        );

        return (
            <MuiSkeleton
                {...props}
                ref={ref}
                variant={variant}
                animation={animation}
                width={width}
                height={height}
                className={skeletonClasses}
            />
        );
    }
);

Skeleton.displayName = 'Skeleton';

