import { Delete, Edit, MoreVert, PowerSettingsNew, ContentCopy } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import type { Port } from '@/features/settings/port/types';
import { transliterate } from '@/shared/utils/transliterate';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { useThrottle } from '@/shared/hooks/useThrottle';
import { formatPortInfo, formatDevicesCount } from '../../utils/portUtils';
import styles from './PortCard.module.scss';
import React, { memo, useMemo, useCallback, useState, useRef } from 'react';

interface PortCardProps {
  port: Port;
  devicesCount?: number;
  onEdit?: (port: Port) => void;
  onDelete?: (portId: string, devicesCount: number) => void;
  onToggleActive?: (port: Port) => void;
  onClone?: (port: Port) => void;
  isPollingActive?: boolean;
}

export const PortCard = memo(
  ({ port, devicesCount = 0, onEdit, onDelete, onToggleActive, onClone, isPollingActive = false }: PortCardProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [actionsAnchorEl, setActionsAnchorEl] = useState<HTMLButtonElement | null>(null);
    const actionsButtonRef = useRef<HTMLButtonElement | null>(null);

    const portInfo = useMemo(() => formatPortInfo(port), [port]);
    const isActionsOpen = Boolean(actionsAnchorEl);

    const isActive = useMemo(() => {
      const slug = transliterate(port.name);
      return location.pathname === `/${slug}`;
    }, [port.name, location.pathname]);

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        // Не переходим, если клик был по кнопке редактирования/удаления
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        const slug = transliterate(port.name);
        navigate(`/${slug}`);
      },
      [port.name, navigate]
    );

    // Блокируем редактирование/удаление если опрос включен И порт активен
    const isEditDeleteDisabled = useMemo(() => isPollingActive && port.isActive, [isPollingActive, port.isActive]);

    const handleEdit = useCallback(() => {
      if (onEdit) {
        onEdit(port);
      }
    }, [onEdit, port]);

    const handleDelete = useCallback(() => {
      if (onDelete) {
        onDelete(port._id, devicesCount);
      }
    }, [onDelete, port._id, devicesCount]);

    const handleClone = useCallback(() => {
      if (onClone) {
        onClone(port);
      }
    }, [onClone, port]);

    const handleToggleInternal = useCallback(() => {
      if (onToggleActive) {
        onToggleActive(port);
      }
    }, [onToggleActive, port]);

    const { throttledFn: handleToggle, isLoading: isToggling } = useThrottle(handleToggleInternal, 1000);

    const handleActionsClick = useCallback(() => {
      if (actionsButtonRef.current) {
        setActionsAnchorEl(actionsButtonRef.current);
      }
    }, []);

    const handleActionsClose = useCallback(() => {
      setActionsAnchorEl(null);
    }, []);

    return (
      <li className={`${styles['portCard']} ${isActive ? styles['portCard_active'] : ''}`} onClick={handleCardClick}>
        <div className={styles['portCard__header']}>
          <div className={styles['portCard__title']}>
            <h4 className={styles['portCard__name']}>
              <span className={styles['portCard__nameText']}>{port.name}</span>
            </h4>
          </div>

          <div className={styles['portCard__headerActions']} onClick={(e) => e.stopPropagation()}>
            {onToggleActive && (
              <IconButton
                icon={<PowerSettingsNew fontSize="small" />}
                tooltip={port.isActive ? 'Выключить порт' : 'Включить порт'}
                variant="power"
                active={port.isActive}
                onClick={handleToggle}
                isLoading={isToggling}
              />
            )}

            {(onEdit || onDelete || onClone) && (
              <>
                <IconButton
                  icon={<MoreVert fontSize="small" />}
                  tooltip="Действия"
                  ref={actionsButtonRef}
                  onClick={handleActionsClick}
                  disabled={isToggling}
                />
                <Menu
                  anchorEl={actionsAnchorEl}
                  open={isActionsOpen}
                  onClose={handleActionsClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  classes={{ paper: styles['portCard__menu'] }}
                >
                  {onEdit && (
                    <MenuItem
                      onClick={() => {
                        handleActionsClose();
                        handleEdit();
                      }}
                      disabled={isEditDeleteDisabled || isToggling}
                      className={styles['portCard__menuItem']}
                    >
                      <Edit fontSize="small" />
                      <span className={styles['portCard__menuText']}>Редактировать</span>
                    </MenuItem>
                  )}
                  {onClone && (
                    <MenuItem
                      onClick={() => {
                        handleActionsClose();
                        handleClone();
                      }}
                      disabled={isToggling}
                      className={styles['portCard__menuItem']}
                    >
                      <ContentCopy fontSize="small" />
                      <span className={styles['portCard__menuText']}>Клонировать</span>
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem
                      onClick={() => {
                        handleActionsClose();
                        handleDelete();
                      }}
                      disabled={isEditDeleteDisabled || isToggling}
                      className={styles['portCard__menuItem']}
                    >
                      <Delete fontSize="small" />
                      <span className={styles['portCard__menuText']}>Удалить</span>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </div>
        </div>
        <div className={styles['portCard__info']}>
          <span className={styles['portCard__infoText']}>{portInfo}</span>
          {devicesCount > 0 && (
            <span className={styles['portCard__devicesCount']}>{formatDevicesCount(devicesCount)}</span>
          )}
        </div>
      </li>
    );
  }
);
