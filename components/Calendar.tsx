import * as React from "react";
import { useEffect, useState } from "react";
import { useClient } from "./ClientProvider";

interface Calendar {
  summary: string;
  id: string;
}

interface CalendarListResponse {
  items: Calendar[];
  nextSyncToken: string;
}

const Calendar: React.FC<{ calendar: Calendar }> = ({ calendar }) => {
  const { setCalendar } = useCalendar();
  return (
    <div
      onClick={() => {
        setCalendar(calendar);
      }}
      style={{ textDecoration: "underlined" }}
    >
      {calendar.summary}
    </div>
  );
};

export const CalendarList: React.FC = () => {
  const { isSignedIn, client } = useClient();
  const [calendars, setCalendars] = useState<{ summary: string }[]>();
  useEffect(() => {
    const fetchCalendars = async () => {
      const response: {
        result: CalendarListResponse | undefined;
      } = await client.client.calendar.calendarList.list({
        maxResults: 10,
        showDeleted: false,
        showHidden: false,
      });
      console.log(response.result);
      setCalendars(response.result?.items);
    };
    if (isSignedIn && client) {
      fetchCalendars();
    }
  }, [isSignedIn, client, setCalendars]);
  return calendars ? (
    <>
      {calendars.map((calendar: Calendar) => (
        <Calendar key={calendar.id} calendar={calendar} />
      ))}
    </>
  ) : null;
};

const CalendarContext = React.createContext<
  { calendar: Calendar; setCalendar: React.Dispatch<Calendar> } | undefined
>(undefined);

export const useCalendar = () => {
  const context = React.useContext(CalendarContext);
  if (context === undefined) {
    throw Error("calendar should be defined");
  }
  return context;
};

export const CalendarProvider: React.FC = ({ children }) => {
  const [calendar, setCalendar] = React.useState<Calendar>(undefined);
  return (
    <CalendarContext.Provider value={{ calendar, setCalendar }}>
      {children}
    </CalendarContext.Provider>
  );
};
