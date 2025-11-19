import { Port, Device } from '../../../models/index.js';
import { reinitializeModbus } from '../../../utils/modbusReloader.js';
import { logAudit } from '../../../utils/auditLogger.js';
import { formatPort } from '../../../utils/portFormatter.js';

/**
 * Получить список всех портов
 */
export async function getPorts(req, res) {
    try {
        const ports = await Port.find()
            .sort({ name: 1 })
            .lean();

        const formattedPorts = ports.map(formatPort);

        res.json({
            success: true,
            count: formattedPorts.length,
            data: formattedPorts
        });
    } catch (error) {
        console.error('Ошибка получения портов:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения портов'
        });
    }
}

/**
 * Получить порт по ID
 */
export async function getPortById(req, res) {
    try {
        const port = await Port.findById(req.params.id).lean();

        if (!port) {
            return res.status(404).json({
                success: false,
                error: 'Порт не найден'
            });
        }

        res.json({
            success: true,
            data: formatPort(port)
        });
    } catch (error) {
        console.error('Ошибка получения порта:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения порта'
        });
    }
}

/**
 * Создать новый порт
 */
export async function createPort(req, res) {
    try {
        const portData = req.body;

        // Базовая валидация
        if (!portData.name || !portData.connectionType) {
            return res.status(400).json({
                success: false,
                error: 'Не все обязательные поля заполнены'
            });
        }

        // Валидация в зависимости от типа
        if (portData.connectionType === 'RTU') {
            if (!portData.port || !portData.baudRate) {
                return res.status(400).json({
                    success: false,
                    error: 'Для RTU необходимо указать порт и скорость'
                });
            }
        } else if (portData.connectionType === 'TCP') {
            if (!portData.host) {
                return res.status(400).json({
                    success: false,
                    error: 'Для TCP необходимо указать хост'
                });
            }
        }

        const port = await Port.create(portData);

        // Логируем создание порта
        if (req.user) {
            await logAudit({
                user: req.user,
                action: 'create',
                entityType: 'port',
                entityName: port.name,
                fieldName: 'name',
                newValue: port.name,
                req
            });
        }

        res.status(201).json({
            success: true,
            data: formatPort(port.toObject())
        });
    } catch (error) {
        console.error('Ошибка создания порта:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Порт с таким именем уже существует'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Ошибка создания порта'
        });
    }
}

/**
 * Обновить порт
 */
export async function updatePort(req, res) {
    try {
        const portData = req.body;

        // Проверяем, изменился ли isActive
        const oldPort = await Port.findById(req.params.id).lean();
        const isActiveChanged = oldPort && 'isActive' in portData && oldPort.isActive !== portData.isActive;

        const port = await Port.findByIdAndUpdate(
            req.params.id,
            portData,
            { new: true, runValidators: true }
        ).lean();

        if (!port) {
            return res.status(404).json({
                success: false,
                error: 'Порт не найден'
            });
        }

        // Реинициализируем Modbus, если изменился isActive или другие критичные параметры
        const criticalParamsChanged = isActiveChanged ||
            portData.connectionType !== oldPort?.connectionType ||
            (port.connectionType === 'RTU' && (portData.port !== oldPort?.port || portData.baudRate !== oldPort?.baudRate)) ||
            (port.connectionType === 'TCP' && (portData.host !== oldPort?.host || portData.tcpPort !== oldPort?.tcpPort));

        if (criticalParamsChanged) {
            await reinitializeModbus();
        }

        // Логируем изменения
        if (req.user && oldPort) {
            if (oldPort.name !== port.name) {
                await logAudit({
                    user: req.user,
                    action: 'update',
                    entityType: 'port',
                    entityName: port.name,
                    fieldName: 'name',
                    oldValue: oldPort.name,
                    newValue: port.name,
                    req
                });
            }
            if (isActiveChanged) {
                await logAudit({
                    user: req.user,
                    action: 'toggle',
                    entityType: 'port',
                    entityName: port.name,
                    oldValue: port.name,
                    newValue: port.isActive,
                    req
                });
            }
        }

        res.json({
            success: true,
            data: formatPort(port)
        });
    } catch (error) {
        console.error('Ошибка обновления порта:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Порт с таким именем уже существует'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Ошибка обновления порта'
        });
    }
}

/**
 * Удалить порт
 */
export async function deletePort(req, res) {
    try {
        // Проверяем, используется ли порт какими-либо устройствами
        const devicesUsingProfile = await Device.countDocuments({
            portId: req.params.id
        });

        if (devicesUsingProfile > 0) {
            return res.status(400).json({
                success: false,
                error: `Порт используется ${devicesUsingProfile} устройством(и). Удаление невозможно.`
            });
        }

        // Получаем данные порта перед удалением
        const port = await Port.findById(req.params.id).lean();

        if (!port) {
            return res.status(404).json({
                success: false,
                error: 'Порт не найден'
            });
        }

        await Port.findByIdAndDelete(req.params.id);

        // Логируем удаление порта
        if (req.user) {
            await logAudit({
                user: req.user,
                action: 'delete',
                entityType: 'port',
                entityName: port.name,
                oldValue: port.name,
                req
            });
        }

        res.json({
            success: true,
            message: 'Порт удален'
        });
    } catch (error) {
        console.error('Ошибка удаления порта:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка удаления порта'
        });
    }
}

