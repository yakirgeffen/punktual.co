import EventCreator from '../../components/EventCreator/EventCreator';
import { EventContextProvider } from '../../contexts/EventContext';

export default function CreatePage() {
  return (
    <main>
      <EventContextProvider>
        <EventCreator />
      </EventContextProvider>
    </main>
  );
}