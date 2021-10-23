import { format, isValid, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import * as React from "react";
import { useCalendar } from "./Calendar";
import { useClient } from "./ClientProvider";

interface GDate {
  dateTime: string;
  timeZone?: string;
}

interface Event {
  id: string;
  summary?: string;
  start?: GDate;
  end?: GDate;
  recurrence: unknown[];
}

interface EventListResponse {
  items: Event[];
}

const formatEventDate = ({
  formatPattern,
  eventDate,
}: {
  eventDate?: GDate;
  formatPattern: string;
}) => {
  let result: Date | null = null;
  if (eventDate) {
    result = parseISO(eventDate.dateTime);
    if (eventDate.timeZone) {
      result = utcToZonedTime(parseISO(eventDate.dateTime), eventDate.timeZone);
    }
  }
  return result && isValid(result) ? format(result, formatPattern) : "";
};

const formatEvent = (event: Event) => {
  let result;
  const formattedStartDate = formatEventDate({
    eventDate: event.start,
    formatPattern: "dd MMMM y HH:mm",
  });
  const formattedEndDate = formatEventDate({
    formatPattern: "HH:mm",
    eventDate: event.end,
  });
  if (formattedStartDate) {
    result = formattedStartDate;
  }
  if (formattedStartDate && formattedEndDate) {
    result = `${formattedStartDate} - ${formattedEndDate}`;
  }
  if (result) {
    result += ` ${event.summary}`;
  } else if (event.summary) {
    result = event.summary;
  }
  return result || "";
};

const EventToDisplay: React.FC<{ event: Event }> = ({ event }) => {
  return (
    <div>
      <span>{`${formatEvent(event)}`}</span>
    </div>
  );
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
        singleEvents: false,
      });
      const recurringEvtIds = response.result?.items
        ?.filter((evt) => evt.recurrence)
        .map((evt) => evt.id);
      const recurringEvtResponse: {
        result: EventListResponse | undefined;
      }[] = recurringEvtIds
        ? await Promise.all(
            recurringEvtIds?.map(
              async (id) =>
                await client.client.calendar.events.instances({
                  calendarId: calendar.id,
                  eventId: id,
                })
            )
          )
        : [];
      const recurringEvtInstances = recurringEvtResponse.flatMap(
        (recurringEvt) => recurringEvt.result?.items
      );
      const singleEvts = response.result?.items || [];
      const allEvents = [...singleEvts, ...recurringEvtInstances].reduce(
        (acc, evt) => {
          if (
            evt !== undefined &&
            evt.start?.dateTime !== undefined &&
            !evt.recurrence &&
            acc.find((evtToTest) => evtToTest.id === evt.id) === undefined
          ) {
            acc.push(evt);
          }
          return acc;
        },
        [] as Event[]
      );
      setEvents(
        allEvents.sort((a, b) =>
          a.start?.dateTime && b.start?.dateTime
            ? parseISO(a.start.dateTime).getTime() -
              parseISO(b.start.dateTime).getTime()
            : 0
        )
      );
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
