import { createFileRoute } from '@tanstack/react-router';
import { StarWarsPeopleList } from '@/features/star-wars/components/StarWarsPeopleList';

export const Route = createFileRoute('/app/star-wars')({
  component: StarWarsPage,
});

function StarWarsPage() {
  return <StarWarsPeopleList />;
}
