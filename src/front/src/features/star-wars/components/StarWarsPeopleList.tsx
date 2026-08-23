import { useTranslation } from 'react-i18next';
import { useStarWarsPeople } from '../api/useStarWarsPeople';

export function StarWarsPeopleList() {
  const { t } = useTranslation('app', { keyPrefix: 'star-wars-people-list' });
  const { data, isPending, isError } = useStarWarsPeople();

  return (
    <section id="star-wars-people">
      <h2>{t('title')}</h2>
      {isPending && <p>{t('loading')}</p>}
      {isError && <p>{t('error')}</p>}
      {data && (
        <ul>
          {data.map((person) => (
            <li key={person.uid}>{person.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
