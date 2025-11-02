import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/hooks';
import { login, clearError } from '../store/authSlice';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import styles from './AuthForms.module.scss';

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Очищаем ошибку при монтировании компонента
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
    dispatch(clearError());
    await dispatch(login(data));
  };

  return (
    <form className={styles['authForm']} onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className={styles['authForm__error']}>
          {error}
        </div>
      )}

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