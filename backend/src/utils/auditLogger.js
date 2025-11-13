import { AuditLog } from '../models/audit/AuditLog.js';
import { User } from '../models/user/User.js';

/**
 * Форматирует значение для отображения
 */
function formatValue(value) {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Генерирует читаемое описание действия
 */
function generateActionDescription(action, entityType, entityName, fieldName, oldValue, newValue) {
    // Родительный падеж (кого? чего?) - для update
    const entityLabelsGenitive = {
        device: 'устройства',
        port: 'порта',
        tag: 'тега',
        user: 'пользователя',
        polling: 'опроса'
    };

    // Винительный падеж (кого? что?) - для create, delete, toggle
    const entityLabelsAccusative = {
        device: 'устройство',
        port: 'порт',
        tag: 'тег',
        user: 'пользователя',
        polling: 'опрос'
    };

    const fieldLabels = {
        name: 'название',
        address: 'адрес',
        slaveId: 'ID устройства',
        portId: 'порт',
        isActive: 'статус активности',
        role: 'роль',
        timeout: 'таймаут',
        retries: 'количество повторов',
        saveInterval: 'интервал сохранения',
        logData: 'логирование данных',
        connectionType: 'тип подключения',
        host: 'хост',
        tcpPort: 'TCP порт',
        port: 'COM порт',
        baudRate: 'скорость передачи',
        dataBits: 'биты данных',
        stopBits: 'стоп-биты',
        parity: 'четность',
        functionCode: 'код функции',
        dataType: 'тип данных',
        length: 'длина',
        category: 'категория'
    };

    if (action === 'create') {
        const entityLabel = entityLabelsAccusative[entityType] || entityType;
        const name = fieldName === 'name' ? newValue : '';
        return `Создал ${entityLabel}${name ? ` "${name}"` : ''}`;
    }

    if (action === 'delete') {
        const entityLabel = entityLabelsAccusative[entityType] || entityType;
        return `Удалил ${entityLabel} "${oldValue}"`;
    }

    if (action === 'update') {
        const entityLabel = entityLabelsGenitive[entityType] || entityType;
        if (fieldName) {
            const fieldLabel = fieldLabels[fieldName] || fieldName;
            return `Изменил ${fieldLabel} ${entityLabel} с "${formatValue(oldValue)}" на "${formatValue(newValue)}"`;
        }
        return `Изменил ${entityLabel} "${oldValue}"`;
    }

    if (action === 'toggle') {
        const entityLabel = entityLabelsAccusative[entityType] || entityType;
        return `${newValue ? 'Включил' : 'Выключил'} ${entityLabel} "${oldValue}"`;
    }

    const entityLabel = entityLabelsGenitive[entityType] || entityType;
    return `${action} ${entityLabel}`;
}

/**
 * Логирует действие пользователя
 * @param {Object} options - Параметры логирования
 * @param {Object} options.user - Пользователь (req.user)
 * @param {String} options.action - Действие: 'create', 'update', 'delete', 'toggle'
 * @param {String} options.entityType - Тип сущности: 'device', 'port', 'tag', 'user', 'polling'
 * @param {String} options.entityName - Название сущности
 * @param {String} options.fieldName - Название измененного поля (для update)
 * @param {*} options.oldValue - Старое значение
 * @param {*} options.newValue - Новое значение (для update/create)
 * @param {Object} options.req - Express request объект (опционально)
 */
export async function logAudit({
    user,
    action,
    entityType,
    entityName,
    fieldName = null,
    oldValue = null,
    newValue = null,
    req = null
}) {
    try {
        // Получаем полную информацию о пользователе
        const userDoc = await User.findById(user.userId).select('name email').lean();
        if (!userDoc) {
            console.error('Пользователь не найден для логирования:', user.userId);
            return;
        }

        // Генерируем описание действия
        const actionDescription = generateActionDescription(
            action,
            entityType,
            entityName,
            fieldName,
            oldValue,
            newValue
        );

        // Форматируем старое значение для отображения
        // Для delete и toggle не сохраняем старое значение
        let formattedOldValue = null;
        if (action === 'update' && oldValue !== null) {
            formattedOldValue = formatValue(oldValue);
        }

        await AuditLog.create({
            userId: user.userId,
            userName: userDoc.name,
            userEmail: userDoc.email,
            action: actionDescription,
            entityType,
            entityName,
            oldValue: formattedOldValue
        });
    } catch (error) {
        // Не прерываем выполнение при ошибке логирования
        console.error('Ошибка логирования аудита:', error);
    }
}

