import styles from './ConnectionModesPage.module.scss';

interface ModeRow {
  title: string;
  summary: string;
  whenToUse: string;
  howItWorks: string;
  configure: string;
}

const modeRows: ModeRow[] = [
  {
    title: 'RTU',
    summary: 'Классический Modbus RTU по COM/RS-485.',
    whenToUse: 'Устройство подключено напрямую к COM/USB-RS485 сервера/ПК.',
    howItWorks: 'Фреймы RTU идут по последовательному порту: адрес (Slave ID) + CRC.',
    configure:
      'Указать порт (COMx), скорость, биты данных/стоп-биты, четность. Питание/линия/терминатор — как обычно для RS-485.',
  },
  {
    title: 'TCP',
    summary: 'Modbus TCP (с MBAP-заголовком).',
    whenToUse: 'Устройство/шлюз говорит нативный Modbus TCP или на MOXA включен Modbus Gateway RTU→TCP.',
    howItWorks: 'TCP-соединение (обычно порт 502), поверх него Modbus TCP: MBAP + PDU. Slave ID нужен для gateway.',
    configure: 'Host + tcpPort (502 или свой), выбрать TCP. На MOXA включить Modbus Gateway.',
  },
  {
    title: 'TCP_RTU',
    summary: 'RTU-over-TCP (сырой RTU по TCP) для режима TCP Server/Device Server на MOXA.',
    whenToUse: 'Когда MOXA/преобразователь просто «пробрасывает» RTU-кадры по TCP (порт 4001/4002 и т.п.).',
    howItWorks: 'TCP-соединение без MBAP, отправляются те же RTU-фреймы, что и по COM. Slave ID обязателен.',
    configure:
      'Host + tcpPort (например 4001 для COM1), выбрать TCP_RTU. На MOXA оставить TCP Server (raw), правильную скорость/паритет/терминатор.',
  },
];

const faqItems = [
  'Если в Real COM всё работало и хотите то же по сети через MOXA в TCP Server — выберите TCP_RTU и укажите host:port MOXA.',
  'Если включили на MOXA Modbus Gateway — выберите TCP, порт 502 (или свой), опрашивайте как Modbus TCP.',
  'Прямое подключение по RS-485/COM — выбирайте RTU и задайте параметры линии.',
  'Slave ID нужен во всех режимах, где за одним шлюзом несколько устройств (RTU, TCP_RTU, TCP через gateway).',
  'Для TCP_RTU важно, чтобы мастер/клиент умел RTU-over-TCP (в проекте используется connectTelnet из modbus-serial).',
];

export const ConnectionModesPage = () => {
  return (
    <div className={styles['doc']}>
      <header className={styles['doc__header']}>
        <div>
          <p className={styles['doc__eyebrow']}>Подсказки по настройке портов</p>
          <h1 className={styles['doc__title']}>Режимы подключения Modbus</h1>
          <p className={styles['doc__subtitle']}>
            Кратко о том, чем отличаются RTU, TCP (Modbus TCP) и TCP_RTU (RTU over TCP), и когда какой использовать.
          </p>
        </div>
      </header>

      <section className={styles['doc__section']}>
        <h2 className={styles['doc__sectionTitle']}>Режимы</h2>
        <ul className={`${styles['doc__list']} list-reset`}>
          {modeRows.map((row) => (
            <li key={row.title} className={styles['doc__card']}>
              <div className={styles['doc__cardHeader']}>
                <h3 className={styles['doc__cardTitle']}>{row.title}</h3>
                <span className={styles['doc__tag']}>{row.summary}</span>
              </div>
              <p className={styles['doc__line']}>
                <strong>Когда использовать:</strong> {row.whenToUse}
              </p>
              <p className={styles['doc__line']}>
                <strong>Как работает:</strong> {row.howItWorks}
              </p>
              <p className={styles['doc__line']}>
                <strong>Настройка:</strong> {row.configure}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles['doc__section']}>
        <h2 className={styles['doc__sectionTitle']}>Быстрые подсказки</h2>
        <ul className={`${styles['doc__bullets']} list-reset`}>
          {faqItems.map((item) => (
            <li key={item} className={styles['doc__bulletItem']}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ConnectionModesPage;
