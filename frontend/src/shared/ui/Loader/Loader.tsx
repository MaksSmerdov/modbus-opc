import React from 'react';
import { CircularProgress, Box, type CircularProgressProps } from '@mui/material';
import styles from './Loader.module.scss';

export interface LoaderProps extends Omit<CircularProgressProps, 'className'> {
    className?: string;
    fullScreen?: boolean;
    size?: number | string;
}

export const Loader: React.FC<LoaderProps> = ({
    className,
    fullScreen = false,
    size = 40,
    ...props
}) => {
    const content = (
        <CircularProgress
            {...props}
            size={size}
            className={`${styles['loader']} ${className || ''}`}
        />
    );

    if (fullScreen) {
        return (
            <Box className={styles['loaderContainer']}>
                {content}
            </Box>
        );
    }

    return content;
};

export default Loader;
