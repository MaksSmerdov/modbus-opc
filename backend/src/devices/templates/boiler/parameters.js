export const parametersRegisters = [
    {
      key: 'Уровень воды в барабане',
      category: 'parameters',
      type: 'holding',
      address: 0x0006,
      dataType: 'int16',
      unit: 'мм',
      minValue: -100,
      maxValue: 100
    },
    {
      key: 'Разрежение в топке котла',
      category: 'parameters',
      type: 'holding',
      address: 0x0008,
      dataType: 'float',
      byteOrder: 'BE',
      decimals: 1,
      unit: 'кг/м²',
    },
    {
      key: 'Давление воздуха перед горелкой',
      category: 'parameters',
      type: 'holding',
      address: 0x000a,
      dataType: 'float',
      byteOrder: 'BE',
      unit: 'кг/м²',
    },
    {
      key: 'Давление газа перед горелкой',
      category: 'parameters',
      type: 'holding',
      address: 12,
      dataType: 'float',
      byteOrder: 'BE',
      unit: 'кг/м²',
    },
    {
      key: 'Давление пара на выходе',
      category: 'parameters',
      type: 'holding',
      address: 14,
      dataType: 'float',
      byteOrder: 'BE',
      decimals: 1,
      unit: 'кг/см²',
    }
  ];
  