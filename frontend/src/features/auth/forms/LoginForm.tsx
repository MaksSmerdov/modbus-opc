import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/features/auth/api/authApi';
import { useSnackbar } from '@/shared/providers/SnackbarProvider';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchemas';
import styles from './AuthForms.module.scss';

export const LoginForm = () => {
  const [login, { isLoading, error: loginError, reset }] = useLoginMutation();
  const { showError, showSuccess } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    reset();
    try {
      await login(data).unwrap();
      showSuccess('Вход выполнен успешно');
    } catch (error) {
      const errorMessage = loginError && 'data' in loginError
        ? (loginError.data as { error?: string })?.error || 'Произошла ошибка'
        : loginError && 'error' in loginError
          ? String(loginError.error)
          : 'Не удалось войти';
      showError(errorMessage);
    }
  };

  return (
    <form className={styles['authForm']} onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="Введите email"
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
      />

      <Input
        {...register('password')}
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
};
