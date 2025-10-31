export const parametersRegisters = [
    {
        key: 'Температура воды на входе',
        category: 'parameters',
        type: 'holding',
        address: 0x0000,
        dataType: 'float',
        unit: '°C',
    },
    {
        key: 'Температура воды на выходе',
        category: 'parameters',
        type: 'holding',
        address: 0x0004,
        dataType: 'float',
        unit: '°C',
    },
    {
        key: 'Уровень воды',
        category: 'parameters',
        type: 'holding',
        address: 0x0008,
        dataType: 'float',
        unit: 'мм',
    },
    {
        key: 'Давление пара',
        category: 'parameters',
        type: 'holding',
        address: 0x000a,
        dataType: 'float',
        decimals: 1,
        unit: 'кПа',
    }
]