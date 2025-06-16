import EventCreator from '../../components/EventCreator/EventCreator';
import { EventContextProvider } from '../../contexts/EventContext';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

export default function CreatePage() {
  return (
    <main>
      <ProtectedRoute redirectTo="/create">
        <EventContextProvider>
          <EventCreator />
        </EventContextProvider>
      </ProtectedRoute>
    </main>
  );
}