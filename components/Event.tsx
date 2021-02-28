import * as React from "react";
import { useCalendar } from "./Calendar";
import { useClient } from "./ClientProvider";

interface Event {
  id: string;
  summary: string;
}

interface EventListResponse {
  items: Event[];
}

const EventToDisplay: React.FC<{ event: Event }> = ({ event }) => {
  return <div>{event.summary}</div>;
};

export const EventList: React.FC = () => {
  const { calendar } = useCalendar();
  const { client } = useClient();
  const [events, setEvents] = React.useState<Event[]>();
  React.useEffect(() => {
    const fetchEventList = async () => {
      const response: {
        result: EventListResponse | undefined;
      } = await client.client.calendar.events.list({
        calendarId: calendar.id,
        alwaysIncludeEmail: false,
        showDeleted: false,
        showHiddenInvitations: false,
      });
      setEvents(response.result?.items);
    };

    if (calendar && client) {
      fetchEventList();
    }
  }, [calendar]);
  return events ? (
    <>
      {events.map((event) => (
        <EventToDisplay key={event.id} event={event} />
      ))}
    </>
  ) : null;
};
