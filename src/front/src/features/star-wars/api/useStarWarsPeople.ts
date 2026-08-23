import { useQuery } from '@tanstack/react-query';
import { starWarsPeopleResponseSchema } from '../schemas';

const SWAPI_PEOPLE_URL = 'https://www.swapi.tech/api/people?page=1&limit=10';

async function fetchStarWarsPeople() {
  const response = await fetch(SWAPI_PEOPLE_URL);
  if (!response.ok) {
    throw new Error(`SWAPI request failed with status ${String(response.status)}`);
  }

  const json: unknown = await response.json();
  return starWarsPeopleResponseSchema.parse(json).results;
}

export function useStarWarsPeople() {
  return useQuery({
    queryKey: ['star-wars', 'people'],
    queryFn: fetchStarWarsPeople,
  });
}
