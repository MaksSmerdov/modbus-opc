import { useState, useCallback, useRef, useEffect } from 'react';
import { Code } from '@mui/icons-material';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { Console } from '@/features/console';
import { useAppSelector } from '@/app/hooks/hooks';
import styles from './ConsolePanel.module.scss';

export const ConsolePanel: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Проверяем доступ: admin или operator
  const canAccessConsole = user?.role === 'admin' || user?.role === 'operator';

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Закрытие при клике вне консоли
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return;

      const target = event.target as Node;

      // Проверяем, находится ли клик внутри панели консоли
      if (panelRef.current.contains(target)) {
        return;
      }

      // Проверяем, не является ли клик на элемент MUI меню/портала
      // MUI рендерит выпадающие меню в портале, поэтому нужно проверить цепочку событий
      const path = event.composedPath();
      const isMuiMenu = path.some((element) => {
        if (element instanceof Element) {
          // Проверяем классы MUI меню и порталов
          const classList = element.classList;
          return (
            classList.contains('MuiPaper-root') ||
            classList.contains('MuiMenu-paper') ||
            classList.contains('MuiPopover-paper') ||
            classList.contains('MuiSelect-select') ||
            element.closest('[role="listbox"]') !== null ||
            element.closest('[role="option"]') !== null
          );
        }
        return false;
      });

      // Если клик не на MUI меню и не внутри панели, закрываем консоль
      if (!isMuiMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Обработчики для отслеживания фокуса и мыши
  const handleMouseEnter = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  if (!canAccessConsole) {
    return null;
  }

  return (
    <>
      <div
        ref={panelRef}
        className={`${styles['consolePanel']} ${isOpen ? styles['consolePanel_open'] : ''} ${
          !isFocused && isOpen ? styles['consolePanel_unfocused'] : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={-1}
      >
        <div className={styles['consolePanel__content']}>
          <Console pollingInterval={2000} maxHeight="100%" onClose={handleToggle} />
        </div>
      </div>

      {!isOpen && (
        <div className={styles['consolePanel__floatingButton']}>
          <IconButton icon={<Code />} onClick={handleToggle} tooltip="Открыть консоль" />
        </div>
      )}
    </>
  );
};
