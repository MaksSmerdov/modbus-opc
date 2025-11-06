export type ConnectionType = 'RTU' | 'TCP';

export type Parity = 'none' | 'even' | 'odd';

export type BaudRate = 9600 | 19200 | 38400 | 57600 | 115200;

export type DataBits = 7 | 8;

export type StopBits = 1 | 2;

// Базовый интерфейс порта
export interface BasePort {
    _id: string;
    name: string;
    connectionType: ConnectionType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Порт RTU
export interface RTUPort extends BasePort {
    connectionType: 'RTU';
    port: string;
    baudRate: BaudRate;
    dataBits: DataBits;
    stopBits: StopBits;
    parity: Parity;
}

// Порт TCP
export interface TCPPort extends BasePort {
    connectionType: 'TCP';
    host: string;
    tcpPort: number;
}

// Объединенный тип порта
export type Port = RTUPort | TCPPort;

// Данные для создания/обновления RTU порта
export interface CreateRTUPortData {
    name: string;
    connectionType: 'RTU';
    port: string;
    baudRate?: BaudRate;
    dataBits?: DataBits;
    stopBits?: StopBits;
    parity?: Parity;
    isActive?: boolean;
}

// Данные для создания/обновления TCP порта
export interface CreateTCPPortData {
    name: string;
    connectionType: 'TCP';
    host: string;
    tcpPort: number;
    isActive?: boolean;
}

// Данные для создания порта (объединенный тип)
export type CreatePortData = CreateRTUPortData | CreateTCPPortData;

// Данные для обновления порта (все поля опциональны)
export type UpdatePortData = Partial<CreatePortData>;

// Ответ API при получении списка портов
export interface PortsListResponse {
    success: true;
    count: number;
    data: Port[];
}

// Ответ API при получении одного порта
export interface PortResponse {
    success: true;
    data: Port;
}

