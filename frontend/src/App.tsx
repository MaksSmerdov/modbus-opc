import { useState } from 'react';
import { SetupWizard } from '@/features/config/components/SetupWizard/SetupWizard';
import { DeviceTester } from '@/features/config/components/DeviceTester/DeviceTester';

type AppView = 'wizard' | 'tester';

function App() {
  const [view, setView] = useState<AppView>('wizard');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px',
        display: 'flex',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setView('wizard')}
          style={{
            padding: '8px 16px',
            background: view === 'wizard' ? '#3b82f6' : '#fff',
            color: view === 'wizard' ? '#fff' : '#1a1a1a',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Мастер настройки
        </button>
        <button
          onClick={() => setView('tester')}
          style={{
            padding: '8px 16px',
            background: view === 'tester' ? '#3b82f6' : '#fff',
            color: view === 'tester' ? '#fff' : '#1a1a1a',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Тестирование устройств
        </button>
      </nav>

      {view === 'wizard' && <SetupWizard />}
      {view === 'tester' && <DeviceTester />}
    </div>
  );
}

export default App;
