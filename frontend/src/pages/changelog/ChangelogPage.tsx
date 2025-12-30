import { useGetVersionInfoQuery } from '@/features/info/api/infoApi';
import { Skeleton } from '@mui/material';
import styles from './ChangelogPage.module.scss';

export const ChangelogPage = () => {
  const { data, isLoading, error } = useGetVersionInfoQuery();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={`${styles['changelogPage']} page`}>
        <div className={styles['changelogPage__header']}>
          <Skeleton variant="text" width="200px" height={40} />
        </div>
        <div className={styles['changelogPage__content']}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles['changelogPage']}>
        <div className={styles['changelogPage__error']}>Ошибка загрузки информации о версии</div>
      </div>
    );
  }

  return (
    <div className={styles['changelogPage']}>
      <div className={styles['changelogPage__header']}>
        <h1 className={styles['changelogPage__title']}>История изменений</h1>
        <div className={styles['changelogPage__version']}>
          <span className={styles['changelogPage__versionLabel']}>Версия:</span>
          <span className={styles['changelogPage__versionValue']}>{data.version || 'Неизвестно'}</span>
        </div>
      </div>

      <div className={styles['changelogPage__content']}>
        {data.tags && data.tags.length > 0 && (
          <div className={styles['changelogPage__tags']}>
            <h2 className={styles['changelogPage__sectionTitle']}>Версии (теги)</h2>
            <div className={styles['changelogPage__tagsList']}>
              {data.tags.map((tag) => (
                <span key={tag} className={styles['changelogPage__tag']}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles['changelogPage__commits']}>
          <h2 className={styles['changelogPage__sectionTitle']}>Последние изменения</h2>
          <div className={styles['changelogPage__commitsList']}>
            {data.commits && data.commits.length > 0 ? (
              data.commits.map((commit) => (
                <div key={commit.fullHash || commit.hash} className={styles['changelogPage__commit']}>
                  <div className={styles['changelogPage__commitHeader']}>
                    <span className={styles['changelogPage__commitHash']}>{commit.hash}</span>
                    <span className={styles['changelogPage__commitSubject']}>{commit.subject}</span>
                    <span className={styles['changelogPage__commitDate']}>{formatDate(commit.date)}</span>
                  </div>
                  {commit.body && <div className={styles['changelogPage__commitBody']}>{commit.body}</div>}
                </div>
              ))
            ) : (
              <div className={styles['changelogPage__empty']}>Нет информации о коммитах</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
