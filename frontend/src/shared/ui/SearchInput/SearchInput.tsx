import { useState, useEffect, useCallback, forwardRef } from 'react';
import { Search } from '@mui/icons-material';
import { Input } from '../Input/Input';
import styles from './SearchInput.module.scss';

export interface SearchInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
    disabled?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ value: externalValue, onChange, onSearch, placeholder = 'Поиск...', debounceMs = 300, className, disabled }, ref) => {
        const [internalValue, setInternalValue] = useState(externalValue ?? '');

        // Синхронизируем внутреннее значение с внешним
        useEffect(() => {
            if (externalValue !== undefined) {
                setInternalValue(externalValue);
            }
        }, [externalValue]);

        // Дебаунс для onSearch
        useEffect(() => {
            if (onSearch) {
                const timer = setTimeout(() => {
                    onSearch(internalValue);
                }, debounceMs);

                return () => clearTimeout(timer);
            }
        }, [internalValue, debounceMs, onSearch]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInternalValue(newValue);
            onChange?.(newValue);
        }, [onChange]);

        return (
            <div className={`${styles['searchInput']} ${className || ''}`}>
                <Search className={styles['searchInput__icon']} />
                <Input
                    ref={ref}
                    value={internalValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={styles['searchInput__input']}
                />
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';

