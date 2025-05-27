import EventCreator from '../../components/EventCreator/EventCreator'
import { EventContextProvider } from '../../contexts/EventContext.jsx'

export default function CreatePage() {
  return (
    <EventContextProvider>
      <EventCreator />
    </EventContextProvider>
  )
}

export const metadata = {
  title: 'Create Calendar Button - EasyCal',
  description: 'Generate "Add to Calendar" buttons for your events in seconds',
}
