# API Документация

## Базовый URL

```
http://localhost:3000/api
```

---

## 📊 Data API - Данные устройств

### Получить все устройства (real-time)

```http
GET /api/data/devices
```

**Ответ:**
```json
[
  {
    "name": "boiler1",
    "slaveId": 1,
    "lastUpdated": "31.10.2025 15:30:45",
    "isResponding": true,
    "data": {
      "parameters": {
        "Температура": { "value": 85.5, "unit": "°C" },
        "Давление": { "value": 12.3, "unit": "бар" }
      },
      "status": { ... }
    }
  }
]
```

### Получить данные устройства (real-time)

```http
GET /api/data/:deviceName
```

**Параметры:**
- `deviceName` - название устройства (boiler1, deaerator и т.д.)

**Пример:**
```bash
GET /api/data/boiler1
```

**Ответ:**
```json
{
  "name": "boiler1",
  "slaveId": 1,
  "lastUpdated": "31.10.2025 15:30:45",
  "isResponding": true,
  "data": {
    "parameters": { ... },
    "status": { ... }
  }
}
```

### Получить историю данных

```http
GET /api/data/:deviceName/history
```

**Query параметры:**
- `limit` (optional) - количество записей, по умолчанию 100
- `from` (optional) - начальная дата (ISO string или DD.MM.YYYY)
- `to` (optional) - конечная дата (ISO string или DD.MM.YYYY)

**Примеры:**
```bash
# Последние 100 записей
GET /api/data/boiler1/history

# Последние 50 записей
GET /api/data/boiler1/history?limit=50

# За период
GET /api/data/boiler1/history?from=2025-10-01&to=2025-10-31

# С ограничением
GET /api/data/boiler1/history?limit=200&from=2025-10-30T00:00:00Z
```

**Ответ:**
```json
{
  "deviceName": "Boiler1",
  "count": 100,
  "data": [
    {
      "_id": "673abc123...",
      "slaveId": 1,
      "data": {
        "parameters": { ... }
      },
      "date": "31.10.2025 15:30:45",
      "timestamp": "2025-10-31T12:30:45.000Z"
    }
  ]
}
```

---

## ⚙️ Config API - Конфигурация

### Устройства

#### Получить все устройства

```http
GET /api/config/devices
```

**Ответ:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "673abc...",
      "name": "boiler1",
      "slaveId": 1,
      "connectionProfileId": {
        "name": "rtu_com16_57600",
        "connectionType": "RTU"
      },
      "registerTemplateId": {
        "name": "boiler_template",
        "deviceType": "boiler"
      },
      "saveInterval": 30000,
      "logData": false,
      "isActive": true,
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

#### Получить устройство по ID

```http
GET /api/config/devices/:id
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "_id": "673abc...",
    "name": "boiler1",
    "slaveId": 1,
    "connectionProfileId": { ... },
    "registerTemplateId": { ... },
    "saveInterval": 30000,
    "logData": false,
    "isActive": true
  }
}
```

#### Создать устройство

```http
POST /api/config/devices
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "boiler4",
  "slaveId": 4,
  "connectionProfileId": "673abc123...",
  "registerTemplateId": "673def456...",
  "saveInterval": 30000,
  "logData": false,
  "isActive": true
}
```

**Ответ:** `201 Created`
```json
{
  "success": true,
  "data": { ... }
}
```

#### Обновить устройство

```http
PUT /api/config/devices/:id
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "boiler4_updated",
  "isActive": false
}
```

**Ответ:** `200 OK`

#### Удалить устройство

```http
DELETE /api/config/devices/:id
```

**Ответ:** `200 OK`
```json
{
  "success": true,
  "message": "Устройство удалено"
}
```

---

### Профили подключений

#### Получить все профили

```http
GET /api/config/profiles
```

**Ответ:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "673xyz...",
      "name": "rtu_com16_57600",
      "connectionType": "RTU",
      "port": "COM16",
      "baudRate": 57600,
      "dataBits": 8,
      "stopBits": 1,
      "parity": "none",
      "timeout": 500,
      "retries": 3,
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

#### Получить профиль по ID

```http
GET /api/config/profiles/:id
```

#### Создать RTU профиль

```http
POST /api/config/profiles
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "rtu_com3_9600",
  "connectionType": "RTU",
  "port": "COM3",
  "baudRate": 9600,
  "dataBits": 8,
  "stopBits": 1,
  "parity": "none",
  "timeout": 500,
  "retries": 3
}
```

**Ответ:** `201 Created`

#### Создать TCP профиль

```http
POST /api/config/profiles
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "tcp_gateway",
  "connectionType": "TCP",
  "host": "192.168.1.100",
  "tcpPort": 502,
  "timeout": 3000,
  "retries": 3
}
```

#### Обновить профиль

```http
PUT /api/config/profiles/:id
Content-Type: application/json
```

#### Удалить профиль

```http
DELETE /api/config/profiles/:id
```

**Примечание:** Профиль нельзя удалить, если он используется устройствами.

---

### Шаблоны регистров

#### Получить все шаблоны

```http
GET /api/config/templates
```

**Query параметры:**
- `deviceType` (optional) - фильтр по типу устройства

**Примеры:**
```bash
GET /api/config/templates
GET /api/config/templates?deviceType=boiler
```

**Ответ:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "673qwe...",
      "name": "boiler_template",
      "deviceType": "boiler",
      "registers": [
        {
          "address": 6,
          "length": 1,
          "name": "Уровень воды в барабане",
          "category": "parameters",
          "dataType": "int16",
          "scale": 1,
          "offset": 0,
          "unit": "мм",
          "description": ""
        }
      ],
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

#### Получить шаблон по ID

```http
GET /api/config/templates/:id
```

#### Создать шаблон

```http
POST /api/config/templates
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "custom_boiler",
  "deviceType": "boiler",
  "registers": [
    {
      "address": 0,
      "length": 1,
      "name": "Температура",
      "category": "parameters",
      "dataType": "int16",
      "scale": 0.1,
      "offset": 0,
      "unit": "°C"
    },
    {
      "address": 2,
      "length": 2,
      "name": "Давление",
      "category": "parameters",
      "dataType": "float32",
      "scale": 1,
      "offset": 0,
      "unit": "бар"
    }
  ]
}
```

**Ответ:** `201 Created`

#### Обновить шаблон

```http
PUT /api/config/templates/:id
Content-Type: application/json
```

#### Удалить шаблон

```http
DELETE /api/config/templates/:id
```

**Примечание:** Шаблон нельзя удалить, если он используется устройствами.

---

## 📋 Справочники

### Типы данных регистров

| Тип | Описание | Размер |
|-----|----------|--------|
| `int16` | 16-бит целое со знаком | 1 регистр |
| `uint16` | 16-бит целое без знака | 1 регистр |
| `int32` | 32-бит целое со знаком | 2 регистра |
| `uint32` | 32-бит целое без знака | 2 регистра |
| `float32` | 32-бит с плавающей точкой | 2 регистра |
| `string` | Строка | переменный |
| `bits` | Отдельные биты | 1 регистр |

### Скорости передачи (baudRate)

- 9600
- 19200
- 38400
- 57600
- 115200

### Биты данных (dataBits)

- 7
- 8 (по умолчанию)

### Стоп-биты (stopBits)

- 1 (по умолчанию)
- 2

### Четность (parity)

- `none` (по умолчанию)
- `even`
- `odd`

---

## 🔢 Коды ответов

| Код | Описание |
|-----|----------|
| `200` | Успешный запрос |
| `201` | Ресурс создан |
| `400` | Ошибка валидации |
| `404` | Ресурс не найден |
| `500` | Внутренняя ошибка сервера |
| `503` | Сервис недоступен (Modbus не инициализирован) |

## ❌ Формат ошибок

```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

**Примеры ошибок:**

```json
// 400 Bad Request
{
  "success": false,
  "error": "Не все обязательные поля заполнены"
}

// 404 Not Found
{
  "success": false,
  "error": "Устройство не найдено"
}

// 503 Service Unavailable
{
  "error": "Modbus не инициализирован"
}
```

---

## 💡 Примеры использования

### JavaScript / Fetch

```javascript
// Получить все устройства (real-time)
const devices = await fetch('/api/data/devices')
  .then(r => r.json());

// Получить данные котла
const boiler = await fetch('/api/data/boiler1')
  .then(r => r.json());

// Получить историю
const history = await fetch('/api/data/boiler1/history?limit=50')
  .then(r => r.json());

// Создать устройство
const newDevice = await fetch('/api/config/devices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'boiler4',
    slaveId: 4,
    connectionProfileId: '673abc...',
    registerTemplateId: '673def...',
    saveInterval: 30000,
    isActive: true
  })
}).then(r => r.json());
```

### cURL

```bash
# Получить все устройства
curl http://localhost:3000/api/data/devices

# Получить данные котла
curl http://localhost:3000/api/data/boiler1

# Получить историю
curl "http://localhost:3000/api/data/boiler1/history?limit=50"

# Создать устройство
curl -X POST http://localhost:3000/api/config/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "boiler4",
    "slaveId": 4,
    "connectionProfileId": "673abc123...",
    "registerTemplateId": "673def456...",
    "saveInterval": 30000,
    "isActive": true
  }'

# Обновить устройство
curl -X PUT http://localhost:3000/api/config/devices/673abc... \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Удалить устройство
curl -X DELETE http://localhost:3000/api/config/devices/673abc...
```

---

## ⚠️ Важные примечания

1. **Данные актуальны только если устройство отвечает** - если `lastUpdated` старше 1 минуты, `data` будет `null`

2. **После изменения конфигурации требуется перезапуск сервера** для применения изменений к Modbus менеджеру

3. **Профиль нельзя удалить**, если он используется хотя бы одним устройством

4. **Шаблон нельзя удалить**, если он используется хотя бы одним устройством

5. **SlaveId должен быть уникальным** для каждого устройства на одном порту

6. **Имя устройства должно быть уникальным** в системе

7. **Минимальный saveInterval** - 5000мс (5 секунд)

---

## 🔄 Миграция из старых URL

Если вы переходите со старых URL:

| Старый URL | Новый URL |
|------------|-----------|
| `GET /api/devices` | `GET /api/data/devices` |
| `GET /api/:deviceName-data` | `GET /api/data/:deviceName` |
| `GET /api/:deviceName-history` | `GET /api/data/:deviceName/history` |

Config API остался без изменений.

