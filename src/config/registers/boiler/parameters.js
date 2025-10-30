export const parametersRegisters = [
    {
      key: 'Уровень воды в барабане',
      category: 'parameters',
      type: 'holding',
      address: 6,
      dataType: 'int16',
      unit: 'мм'
    },
    {
      key: 'Разрежение в топке котла',
      category: 'parameters',
      type: 'holding',
      address: 8,
      dataType: 'float',
      byteOrder: 'BE',
      decimals: 1,
      unit: 'кг/м²'
    },
    {
      key: 'Давление воздуха перед горелкой',
      category: 'parameters',
      type: 'holding',
      address: 10,
      dataType: 'float',
      byteOrder: 'BE',
      unit: 'кг/м²'
    },
    {
      key: 'Давление газа перед горелкой',
      category: 'parameters',
      type: 'holding',
      address: 12,
      dataType: 'float',
      byteOrder: 'BE',
      unit: 'кг/м²'
    },
    {
      key: 'Давление пара на выходе',
      category: 'parameters',
      type: 'holding',
      address: 14,
      dataType: 'float',
      byteOrder: 'BE',
      decimals: 1,
      unit: 'кг/см²'
    }
  ];
  