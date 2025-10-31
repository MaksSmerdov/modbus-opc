import { useState } from 'react';
import { ProfileForm } from '../ProfileForm/ProfileForm';
import { TemplateForm } from '../TemplateForm/TemplateForm';
import { DeviceForm } from '../DeviceForm/DeviceForm';
import { 
  useCreateProfileMutation, 
  useCreateTemplateMutation, 
  useCreateDeviceMutation 
} from '../../api';
import type { CreateConnectionProfileDto, CreateRegisterTemplateDto, CreateDeviceDto } from '../../types/config.types';
import styles from './SetupWizard.module.scss';

type Step = 'profile' | 'template' | 'device' | 'success';

export function SetupWizard() {
  const [step, setStep] = useState<Step>('profile');
  const [profileId, setProfileId] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');

  const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateTemplateMutation();
  const [createDevice, { isLoading: isCreatingDevice }] = useCreateDeviceMutation();

  const handleProfileSubmit = async (data: CreateConnectionProfileDto) => {
    try {
      const result = await createProfile(data).unwrap();
      if (result.data) {
        setProfileId(result.data._id);
        setStep('template');
      }
    } catch (error) {
      console.error('Ошибка создания профиля:', error);
      alert('Не удалось создать профиль подключения');
    }
  };

  const handleTemplateSubmit = async (data: CreateRegisterTemplateDto): Promise<string> => {
    try {
      const result = await createTemplate(data).unwrap();
      if (result.data) {
        setTemplateId(result.data._id);
        setStep('device');
        return result.data._id;
      }
      throw new Error('Не удалось получить ID шаблона');
    } catch (error) {
      console.error('Ошибка создания шаблона:', error);
      alert('Не удалось создать шаблон регистров');
      throw error;
    }
  };

  const handleDeviceSubmit = async (data: CreateDeviceDto) => {
    try {
      const result = await createDevice(data).unwrap();
      if (result.data) {
        setDeviceName(data.name);
        setStep('success');
      }
    } catch (error) {
      console.error('Ошибка создания устройства:', error);
      alert('Не удалось создать устройство');
    }
  };

  const handleReset = () => {
    setStep('profile');
    setProfileId('');
    setTemplateId('');
    setDeviceName('');
  };

  return (
    <div className={styles['setup-wizard']}>
      <div className={styles['setup-wizard__progress']}>
        <div className={`${styles['setup-wizard__step']} ${step === 'profile' ? styles['setup-wizard__step--active'] : ''} ${['template', 'device', 'success'].includes(step) ? styles['setup-wizard__step--completed'] : ''}`}>
          <div className={styles['setup-wizard__step-number']}>1</div>
          <div className={styles['setup-wizard__step-label']}>Профиль подключения</div>
        </div>

        <div className={styles['setup-wizard__step-line']} />

        <div className={`${styles['setup-wizard__step']} ${step === 'template' ? styles['setup-wizard__step--active'] : ''} ${['device', 'success'].includes(step) ? styles['setup-wizard__step--completed'] : ''}`}>
          <div className={styles['setup-wizard__step-number']}>2</div>
          <div className={styles['setup-wizard__step-label']}>Шаблон регистров</div>
        </div>

        <div className={styles['setup-wizard__step-line']} />

        <div className={`${styles['setup-wizard__step']} ${step === 'device' ? styles['setup-wizard__step--active'] : ''} ${step === 'success' ? styles['setup-wizard__step--completed'] : ''}`}>
          <div className={styles['setup-wizard__step-number']}>3</div>
          <div className={styles['setup-wizard__step-label']}>Устройство</div>
        </div>
      </div>

      <div className={styles['setup-wizard__content']}>
        {step === 'profile' && (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            loading={isCreatingProfile}
          />
        )}

        {step === 'template' && (
          <TemplateForm
            onSubmit={handleTemplateSubmit}
            onCancel={() => setStep('profile')}
            loading={isCreatingTemplate}
          />
        )}

        {step === 'device' && (
          <DeviceForm
            profileId={profileId}
            templateId={templateId}
            onSubmit={handleDeviceSubmit}
            onBack={() => setStep('template')}
            loading={isCreatingDevice}
          />
        )}

        {step === 'success' && (
          <div className={styles['setup-wizard__success']}>
            <div className={styles['setup-wizard__success-icon']}>✓</div>
            <h2 className={styles['setup-wizard__success-title']}>Успешно!</h2>
            <p className={styles['setup-wizard__success-text']}>
              Устройство <strong>{deviceName}</strong> успешно создано и готово к работе.
            </p>
            <div className={styles['setup-wizard__success-details']}>
              <p>✓ Профиль подключения создан</p>
              <p>✓ Шаблон регистров создан</p>
              <p>✓ Устройство настроено и активно</p>
            </div>
            <button 
              className={styles['setup-wizard__success-button']}
              onClick={handleReset}
            >
              Создать еще одно устройство
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

