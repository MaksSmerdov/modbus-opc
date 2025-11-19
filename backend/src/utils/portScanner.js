import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Получает все COM-порты из Windows через WMI (включая виртуальные)
 * Использует wmic вместо PowerShell для большей надежности
 * @returns {Promise<Array<{name: string, description?: string}>>}
 */
export async function getWindowsCOMPortsWMI() {
  try {
    // Используем wmic для получения всех COM-портов
    const command = `wmic path Win32_SerialPort get DeviceID,Name /format:csv`;
    const { stdout } = await execAsync(command, { encoding: 'utf8' });

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    // Парсим CSV формат wmic
    const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
    const ports = [];

    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const deviceId = parts[parts.length - 2]?.trim();
        const name = parts[parts.length - 1]?.trim();
        if (deviceId && deviceId.startsWith('COM')) {
          ports.push({
            name: deviceId,
            description: name || null
          });
        }
      }
    }

    return ports;
  } catch (error) {
    console.error('Ошибка получения COM-портов через WMI (wmic):', error.message);
    return [];
  }
}

/**
 * Получает COM-порты из реестра Windows (самый надежный метод для виртуальных портов)
 * @returns {Promise<Array<{name: string}>>}
 */
export async function getWindowsCOMPortsFromRegistry() {
  try {
    // Читаем реестр Windows через reg query
    const command = `reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DEVICEMAP\\SERIALCOMM"`;
    const { stdout } = await execAsync(command, { encoding: 'utf8' });

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    const ports = [];
    const lines = stdout.split('\n');

    for (const line of lines) {
      // Формат: "    \\Device\\Serial0    REG_SZ    COM1"
      const match = line.match(/COM\d+/i);
      if (match) {
        ports.push({
          name: match[0].toUpperCase()
        });
      }
    }

    return ports;
  } catch (error) {
    console.error('Ошибка получения COM-портов из реестра:', error.message);
    return [];
  }
}

/**
 * Получает все COM-порты из Windows через WMI (включая виртуальные)
 * Пробует несколько методов для максимального покрытия
 * @returns {Promise<Array<{name: string, description?: string}>>}
 */
export async function getWindowsCOMPorts() {
  // Пробуем несколько методов и объединяем результаты
  const [wmiPorts, registryPorts] = await Promise.all([
    getWindowsCOMPortsWMI(),
    getWindowsCOMPortsFromRegistry()
  ]);

  // Объединяем результаты, убирая дубликаты
  const portsMap = new Map();

  // Добавляем порты из WMI (с описанием)
  wmiPorts.forEach(port => {
    portsMap.set(port.name, port);
  });

  // Добавляем порты из реестра (если их еще нет)
  registryPorts.forEach(port => {
    if (!portsMap.has(port.name)) {
      portsMap.set(port.name, port);
    }
  });

  const allPorts = Array.from(portsMap.values());

  return allPorts;
}

/**
 * Получает все доступные COM-порты из Windows
 * Использует WMI и реестр для максимального покрытия (включая виртуальные порты)
 * Фильтрует скрытые порты для не-админов
 * @param {string} userRole - Роль пользователя ('admin', 'operator', 'viewer')
 * @param {Object} AvailablePortModel - Модель AvailablePort из Mongoose
 * @returns {Promise<Array<{name: string, manufacturer: string | null, ...}>>}
 */
export async function getAllAvailablePorts(userRole = 'viewer', AvailablePortModel) {
  // Получаем все COM-порты из Windows (включая виртуальные)
  const windowsPorts = await getWindowsCOMPorts();

  // Получаем настройки портов из БД
  const portSettings = await AvailablePortModel.find().lean();
  const settingsMap = new Map(portSettings.map(s => [s.portName, s]));

  // Форматируем порты с учетом настроек
  const formattedPorts = windowsPorts
    .map(winPort => {
      const settings = settingsMap.get(winPort.name);
      return {
        name: winPort.name,
        manufacturer: null,
        serialNumber: null,
        pnpId: null,
        vendorId: null,
        productId: null,
        locationId: null,
        description: settings?.description || winPort.description || null
      };
    })
    // Фильтруем скрытые порты для не-админов
    .filter(port => {
      const settings = settingsMap.get(port.name);
      return userRole === 'admin' || !settings?.isHidden;
    });

  console.log(`Итого доступно портов: ${formattedPorts.length}`, formattedPorts.map(p => p.name));

  return formattedPorts;
}

