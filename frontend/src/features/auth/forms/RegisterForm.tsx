import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/hooks';
import { register, clearError } from '../store/authSlice';
import { Input } from '../../../shared/ui/Input/Input';
import { Button } from '../../../shared/ui/Button/Button';
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas';
import styles from './AuthForms.module.scss';

export const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Очищаем ошибку при монтировании компонента
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
    dispatch(clearError());
    await dispatch(register(data));
  };

  return (
    <form className={styles['authForm']} onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className={styles['authForm__error']}>
          {error}
        </div>
      )}

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
        variant="contained"
        size="large"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};