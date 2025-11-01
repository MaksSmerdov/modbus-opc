import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Modbus OPC Server API',
            version: '1.0.0',
            description: 'REST API для управления конфигурацией и получения данных с Modbus устройств',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Devices',
                description: 'Управление устройствами',
            },
            {
                name: 'Ports',
                description: 'Управление портами',
            },
            {
                name: 'Tags',
                description: 'Управление тэгами устройств',
            },
            {
                name: 'Data',
                description: 'Получение данных устройств',
            },
            {
                name: 'Polling',
                description: 'Управление опросом устройств',
            },
            {
                name: 'Settings',
                description: 'Настройки сервера',
            },
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'Описание ошибки',
                        },
                    },
                },
                Device: {
                    type: 'object',
                    required: ['name', 'slaveId', 'portId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB ObjectId',
                            example: '65f1234567890abcdef12345',
                        },
                        name: {
                            type: 'string',
                            description: 'Название устройства (может быть на русском)',
                            example: 'Котел №1',
                        },
                        slug: {
                            type: 'string',
                            description: 'Уникальный API ключ устройства (латиница, цифры, дефисы). Если не указан, генерируется автоматически из названия',
                            example: 'kotel-1',
                            pattern: '^[a-z0-9-_]+$',
                        },
                        slaveId: {
                            type: 'integer',
                            description: 'Modbus Slave ID',
                            minimum: 1,
                            maximum: 247,
                            example: 1,
                        },
                        portId: {
                            oneOf: [
                                { type: 'string', description: 'ID порта' },
                                { $ref: '#/components/schemas/Port' },
                            ],
                        },
                        timeout: {
                            type: 'integer',
                            description: 'Таймаут соединения (мс)',
                            default: 500,
                            minimum: 500,
                            maximum: 30000,
                            example: 500,
                        },
                        retries: {
                            type: 'integer',
                            description: 'Количество повторных попыток',
                            default: 3,
                            minimum: 1,
                            maximum: 15,
                            example: 3,
                        },
                        tags: {
                            type: 'array',
                            description: 'Массив тэгов устройства',
                            items: {
                                $ref: '#/components/schemas/Tag',
                            },
                        },
                        saveInterval: {
                            type: 'integer',
                            description: 'Интервал сохранения данных в БД (миллисекунды)',
                            default: 30000,
                            minimum: 5000,
                            example: 30000,
                        },
                        logData: {
                            type: 'boolean',
                            description: 'Сохранять ли данные в БД',
                            default: true,
                            example: true,
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Активно ли устройство',
                            default: true,
                            example: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                DeviceInput: {
                    type: 'object',
                    required: ['name', 'slaveId', 'portId'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Название устройства (может быть на русском)',
                            example: 'Котел №1',
                        },
                        slug: {
                            type: 'string',
                            description: 'Уникальный API ключ (опционально, генерируется автоматически если не указан)',
                            example: 'kotel-1',
                            pattern: '^[a-z0-9-_]+$',
                        },
                        slaveId: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 247,
                            example: 1,
                        },
                        portId: {
                            type: 'string',
                            example: '65f1234567890abcdef12345',
                        },
                        timeout: {
                            type: 'integer',
                            description: 'Таймаут соединения (мс)',
                            default: 500,
                            minimum: 500,
                            maximum: 30000,
                            example: 500,
                        },
                        retries: {
                            type: 'integer',
                            description: 'Количество повторных попыток',
                            default: 3,
                            minimum: 1,
                            maximum: 15,
                            example: 3,
                        },
                        saveInterval: {
                            type: 'integer',
                            description: 'Интервал сохранения данных в БД (миллисекунды)',
                            default: 30000,
                            minimum: 5000,
                            example: 30000,
                        },
                        logData: {
                            type: 'boolean',
                            default: true,
                            example: true,
                        },
                        isActive: {
                            type: 'boolean',
                            default: true,
                            example: true,
                        },
                    },
                },
                Port: {
                    type: 'object',
                    required: ['name', 'connectionType'],
                    properties: {
                        _id: {
                            type: 'string',
                            example: '65f1234567890abcdef12347',
                        },
                        name: {
                            type: 'string',
                            description: 'Уникальное имя порта',
                            example: 'RTU-485',
                        },
                        connectionType: {
                            type: 'string',
                            enum: ['RTU', 'TCP'],
                            example: 'RTU',
                        },
                        port: {
                            type: 'string',
                            description: 'COM порт (для RTU)',
                            example: 'COM3',
                        },
                        baudRate: {
                            type: 'integer',
                            description: 'Скорость передачи (для RTU)',
                            example: 9600,
                        },
                        dataBits: {
                            type: 'integer',
                            description: 'Биты данных (для RTU)',
                            default: 8,
                            example: 8,
                        },
                        stopBits: {
                            type: 'integer',
                            description: 'Стоп-биты (для RTU)',
                            default: 1,
                            example: 1,
                        },
                        parity: {
                            type: 'string',
                            description: 'Четность (для RTU)',
                            enum: ['none', 'even', 'odd'],
                            default: 'none',
                            example: 'none',
                        },
                        host: {
                            type: 'string',
                            description: 'IP адрес или хост (для TCP)',
                            example: '192.168.0.10',
                        },
                        tcpPort: {
                            type: 'integer',
                            description: 'TCP порт (для TCP)',
                            default: 502,
                            example: 502,
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Активен ли порт',
                            default: true,
                            example: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                PortRTU: {
                    type: 'object',
                    required: ['name', 'connectionType', 'port', 'baudRate'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'RTU-485',
                        },
                        connectionType: {
                            type: 'string',
                            enum: ['RTU'],
                            example: 'RTU',
                        },
                        port: {
                            type: 'string',
                            example: 'COM3',
                        },
                        baudRate: {
                            type: 'integer',
                            example: 9600,
                        },
                        dataBits: {
                            type: 'integer',
                            default: 8,
                            example: 8,
                        },
                        stopBits: {
                            type: 'integer',
                            default: 1,
                            example: 1,
                        },
                        parity: {
                            type: 'string',
                            enum: ['none', 'even', 'odd'],
                            default: 'none',
                            example: 'none',
                        },
                    },
                },
                PortTCP: {
                    type: 'object',
                    required: ['name', 'connectionType', 'host'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'PLC-TCP',
                        },
                        connectionType: {
                            type: 'string',
                            enum: ['TCP'],
                            example: 'TCP',
                        },
                        host: {
                            type: 'string',
                            example: '192.168.0.10',
                        },
                        tcpPort: {
                            type: 'integer',
                            default: 502,
                            example: 502,
                        },
                    },
                },
                Tag: {
                    type: 'object',
                    required: ['deviceId', 'address', 'name', 'dataType'],
                    properties: {
                        _id: {
                            type: 'string',
                            example: '65f1234567890abcdef12348',
                        },
                        deviceId: {
                            type: 'string',
                            description: 'ID устройства',
                            example: '65f1234567890abcdef12345',
                        },
                        address: {
                            type: 'integer',
                            description: 'Адрес регистра',
                            minimum: 0,
                            maximum: 65535,
                            example: 0,
                        },
                        length: {
                            type: 'integer',
                            description: 'Длина в регистрах. Обязателен только для типа "string". Для остальных типов вычисляется автоматически: int16/uint16/bool/bits=1, int32/uint32/float32=2, double=4',
                            minimum: 1,
                            maximum: 125,
                            example: 2,
                        },
                        name: {
                            type: 'string',
                            description: 'Название параметра',
                            example: 'Temperature',
                        },
                        category: {
                            type: 'string',
                            description: 'Категория',
                            default: 'general',
                            example: 'general',
                        },
                        functionCode: {
                            type: 'string',
                            description: 'Тип функции Modbus',
                            enum: ['holding', 'input', 'coil', 'discrete'],
                            default: 'holding',
                            example: 'holding',
                        },
                        dataType: {
                            type: 'string',
                            description: 'Тип данных',
                            enum: ['int16', 'uint16', 'int32', 'uint32', 'float32', 'string', 'bits'],
                            example: 'float32',
                        },
                        bitIndex: {
                            type: 'integer',
                            description: 'Индекс бита (только для типа bits)',
                            minimum: 0,
                            maximum: 15,
                            nullable: true,
                            example: null,
                        },
                        byteOrder: {
                            type: 'string',
                            description: 'Порядок байтов',
                            enum: ['BE', 'LE', 'ABCD', 'CDAB', 'BADC', 'DCBA'],
                            default: 'ABCD',
                            example: 'ABCD',
                        },
                        scale: {
                            type: 'number',
                            description: 'Масштабный коэффициент',
                            default: 1,
                            example: 1,
                        },
                        offset: {
                            type: 'number',
                            description: 'Смещение',
                            default: 0,
                            example: 0,
                        },
                        decimals: {
                            type: 'integer',
                            description: 'Количество знаков после запятой',
                            minimum: 0,
                            maximum: 10,
                            default: 0,
                            example: 2,
                        },
                        unit: {
                            type: 'string',
                            description: 'Единица измерения',
                            default: '',
                            example: '°C',
                        },
                        minValue: {
                            type: 'number',
                            description: 'Минимальное значение',
                            nullable: true,
                            example: null,
                        },
                        maxValue: {
                            type: 'number',
                            description: 'Максимальное значение',
                            nullable: true,
                            example: null,
                        },
                        description: {
                            type: 'string',
                            description: 'Описание',
                            default: '',
                            example: 'Температура котла',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Register: {
                    type: 'object',
                    required: ['address', 'length', 'name', 'dataType'],
                    properties: {
                        address: {
                            type: 'integer',
                            description: 'Адрес регистра',
                            minimum: 0,
                            example: 0,
                        },
                        length: {
                            type: 'integer',
                            description: 'Длина в регистрах',
                            minimum: 1,
                            example: 2,
                        },
                        name: {
                            type: 'string',
                            description: 'Название параметра',
                            example: 'Temperature',
                        },
                        dataType: {
                            type: 'string',
                            description: 'Тип данных',
                            example: 'float',
                        },
                    },
                },
                DeviceData: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Boiler1',
                        },
                        slug: {
                            type: 'string',
                            description: 'API ключ (slug) устройства',
                            example: 'boiler1',
                        },
                        slaveId: {
                            type: 'integer',
                            example: 1,
                        },
                        lastUpdated: {
                            type: 'string',
                            nullable: true,
                            description: 'Дата последнего обновления',
                            example: '31.10.2025 15:30:45',
                        },
                        isResponding: {
                            type: 'boolean',
                            description: 'Отвечает ли устройство',
                            example: true,
                        },
                        data: {
                            type: 'object',
                            nullable: true,
                            description: 'Актуальные данные (null если данные устарели)',
                            additionalProperties: true,
                            example: {
                                Temperature: 75.5,
                                Pressure: 1.2,
                            },
                        },
                    },
                },
                HistoricalData: {
                    type: 'object',
                    properties: {
                        deviceName: {
                            type: 'string',
                            example: 'Boiler1',
                        },
                        deviceSlug: {
                            type: 'string',
                            description: 'API ключ (slug) устройства',
                            example: 'boiler1',
                        },
                        count: {
                            type: 'integer',
                            example: 100,
                        },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: {
                                        type: 'string',
                                        example: '65f1234567890abcdef12349',
                                    },
                                    timestamp: {
                                        type: 'string',
                                        format: 'date-time',
                                    },
                                    values: {
                                        type: 'object',
                                        additionalProperties: true,
                                        example: {
                                            Temperature: 75.5,
                                            Pressure: 1.2,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/**/*.js'], // Путь к файлам с аннотациями
};

export const swaggerSpec = swaggerJsdoc(options);

