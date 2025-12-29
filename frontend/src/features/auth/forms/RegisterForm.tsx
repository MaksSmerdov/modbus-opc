import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterMutation } from '@/features/auth/api/authApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/authSchemas';
import styles from './AuthForms.module.scss';

export const RegisterForm = () => {
  const [register, { isLoading, error: registerError, reset }] = useRegisterMutation();
  const { showError, showSuccess } = useSnackbar();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    reset();
    try {
      await register(data).unwrap();
      showSuccess('Регистрация выполнена успешно');
    } catch (error) {
      const errorMessage = registerError && 'data' in registerError
        ? (registerError.data as { error?: string })?.error || 'Произошла ошибка'
        : registerError && 'error' in registerError
          ? String(registerError.error)
          : 'Не удалось зарегистрироваться';
      showError(errorMessage);
    }
  };

  return (
    <form className={styles['authForm']} onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...registerField('name')}
        label="Имя"
        type="text"
        placeholder="Введите имя"
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <Input
        {...registerField('email')}
        label="Email"
        type="email"
        placeholder="Введите email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <Input
        {...registerField('password')}
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="success"
        size="large"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};
