import { Edit } from '@mui/icons-material';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import type { PortWithSettings } from '../../utils/mergePortsWithSettings';
import styles from './PortRow.module.scss';

interface PortRowProps {
  port: PortWithSettings;
  onEdit: () => void;
}

export const PortRow = ({
  port,
  onEdit,
}: PortRowProps) => {
  return (
    <tr key={port._id}>
      <td>
        {port.portName}
        {!port.isSystemPort && (
          <span className={styles['portRow__notFound']}> (не найден)</span>
        )}
      </td>
      <td>
        <span>{port.description || '—'}</span>
      </td>
      <td>
        <span className={port.isHidden ? styles['portRow__hidden'] : ''}>
          {port.isHidden ? 'Скрыт' : 'Видим'}
        </span>
      </td>
      <td>
        <IconButton
          icon={<Edit />}
          tooltip="Редактировать"
          variant="edit"
          onClick={onEdit}
        />
      </td>
    </tr>
  );
};

