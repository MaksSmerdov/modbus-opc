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
                name: 'Profiles',
                description: 'Управление профилями подключений',
            },
            {
                name: 'Templates',
                description: 'Управление шаблонами регистров',
            },
            {
                name: 'Data',
                description: 'Получение данных устройств',
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
                    required: ['name', 'slaveId', 'connectionProfileId', 'registerTemplateId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB ObjectId',
                            example: '65f1234567890abcdef12345',
                        },
                        name: {
                            type: 'string',
                            description: 'Уникальное имя устройства',
                            example: 'Boiler1',
                        },
                        slaveId: {
                            type: 'integer',
                            description: 'Modbus Slave ID',
                            minimum: 1,
                            maximum: 247,
                            example: 1,
                        },
                        connectionProfileId: {
                            oneOf: [
                                { type: 'string', description: 'ID профиля подключения' },
                                { $ref: '#/components/schemas/ConnectionProfile' },
                            ],
                        },
                        registerTemplateId: {
                            oneOf: [
                                { type: 'string', description: 'ID шаблона регистров' },
                                { $ref: '#/components/schemas/RegisterTemplate' },
                            ],
                        },
                        saveInterval: {
                            type: 'integer',
                            description: 'Интервал сохранения данных в БД (секунды)',
                            default: 60,
                            example: 60,
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
                    required: ['name', 'slaveId', 'connectionProfileId', 'registerTemplateId'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Boiler1',
                        },
                        slaveId: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 247,
                            example: 1,
                        },
                        connectionProfileId: {
                            type: 'string',
                            example: '65f1234567890abcdef12345',
                        },
                        registerTemplateId: {
                            type: 'string',
                            example: '65f1234567890abcdef12346',
                        },
                        saveInterval: {
                            type: 'integer',
                            default: 60,
                            example: 60,
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
                ConnectionProfile: {
                    type: 'object',
                    required: ['name', 'connectionType'],
                    properties: {
                        _id: {
                            type: 'string',
                            example: '65f1234567890abcdef12347',
                        },
                        name: {
                            type: 'string',
                            description: 'Уникальное имя профиля',
                            example: 'RTU-485',
                        },
                        connectionType: {
                            type: 'string',
                            enum: ['RTU', 'TCP'],
                            example: 'RTU',
                        },
                        timeout: {
                            type: 'integer',
                            description: 'Таймаут соединения (мс)',
                            default: 1000,
                            example: 1000,
                        },
                        retries: {
                            type: 'integer',
                            description: 'Количество повторных попыток',
                            default: 3,
                            example: 3,
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
                ConnectionProfileRTU: {
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
                        timeout: {
                            type: 'integer',
                            default: 1000,
                            example: 1000,
                        },
                        retries: {
                            type: 'integer',
                            default: 3,
                            example: 3,
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
                ConnectionProfileTCP: {
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
                        timeout: {
                            type: 'integer',
                            default: 1000,
                            example: 1000,
                        },
                        retries: {
                            type: 'integer',
                            default: 3,
                            example: 3,
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
                RegisterTemplate: {
                    type: 'object',
                    required: ['name', 'deviceType', 'registers'],
                    properties: {
                        _id: {
                            type: 'string',
                            example: '65f1234567890abcdef12348',
                        },
                        name: {
                            type: 'string',
                            description: 'Уникальное имя шаблона',
                            example: 'BoilerTemplate',
                        },
                        deviceType: {
                            type: 'string',
                            description: 'Тип устройства',
                            example: 'boiler',
                        },
                        registers: {
                            type: 'array',
                            description: 'Массив регистров',
                            minItems: 1,
                            items: {
                                $ref: '#/components/schemas/Register',
                            },
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

