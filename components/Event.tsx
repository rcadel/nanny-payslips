import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  formatISO,
  getHours,
  getMonth,
  isEqual,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useCalendar } from "./Calendar";
import { useClient } from "./ClientProvider";

const afterNoonMealHour = 16;
const lunchHour = 12;

interface GDate {
  dateTime: string;
  timeZone?: string;
}

interface RawEvent {
  id: string;
  summary?: string;
  start?: GDate;
  end?: GDate;
  recurrence: unknown[];
  day?: Date;
}

interface Event {
  id: string;
  summary?: string;
  start?: Date;
  end?: Date;
  recurrence: unknown[];
}

interface EventListResponse {
  items: RawEvent[];
}

const parseGDate = (eventDate?: GDate) => {
  let result: Date | null = null;
  if (eventDate) {
    result = parseISO(eventDate.dateTime);
    if (eventDate.timeZone) {
      result = utcToZonedTime(parseISO(eventDate.dateTime), eventDate.timeZone);
    }
  }
  return result && isValid(result) ? result : undefined;
};

const formatDate = ({
  date,
  formatPattern,
}: {
  date?: Date;
  formatPattern: string;
}) => {
  return date ? format(date, formatPattern) : "";
};

const formatEvent = (event: Event) => {
  let result;
  const formattedStartDate = formatDate({
    date: event.start,
    formatPattern: "dd MMMM y HH:mm",
  });
  const formattedEndDate = formatDate({
    formatPattern: "HH:mm",
    date: event.end,
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

type ChildDeposit = {
  arrival?: Date;
  departure?: Date;
};

type NannysDay = {
  morning: ChildDeposit;
  noon: ChildDeposit;
  afternoon: ChildDeposit;
  totalHour: number;
  expense: {
    generalFees: boolean;
    lunch: boolean;
    afterNoonMeal: boolean;
  };
};

type EventCSV = {
  scheduled: NannysDay;
  done: NannysDay;
};

const timeSpend = (arrival?: Date, departure?: Date) => {
  if (!arrival && !departure) {
    return 0;
  } else {
    const startOfThisDay = arrival
      ? startOfDay(arrival)
      : startOfDay(departure as Date);
    return (
      (departure || startOfThisDay).getTime() -
      (arrival || startOfThisDay).getTime()
    );
  }
};

const eventToNannysDay = (event?: Event): NannysDay => {
  const morningArrival =
    event?.start && getHours(event.start) <= 12 ? event.start : undefined;
  const morningDeparture =
    event?.end && getHours(event.end) <= 12 ? event.end : undefined;
  const noonArrival =
    event?.start && getHours(event.start) > 12 && getHours(event.start) < 14
      ? event.start
      : undefined;
  const noonDeparture =
    event?.end && getHours(event.end) > 12 && getHours(event.end) < 14
      ? event.end
      : undefined;
  const afterNoonArrival = morningArrival && morningDeparture;
  event?.start && getHours(event.start) >= 14 ? event.start : undefined;
  const afterNoonDeparture =
    event?.end && getHours(event.end) >= 14 ? event.end : undefined;
  const totalHour =
    timeSpend(morningArrival, morningDeparture) +
    timeSpend(noonArrival, noonDeparture) +
    timeSpend(afterNoonArrival, afterNoonDeparture);
  return {
    morning: { arrival: morningArrival, departure: morningDeparture },
    noon: { arrival: noonArrival, departure: noonDeparture },
    afternoon: { arrival: afterNoonArrival, departure: afterNoonDeparture },
    totalHour,
    expense: {
      generalFees: !!(
        (morningArrival || noonArrival || afterNoonArrival) &&
        (morningDeparture || noonDeparture || afterNoonDeparture)
      ),
      afterNoonMeal: !!(
        afterNoonDeparture && getHours(afterNoonDeparture) > afterNoonMealHour
      ),
      lunch: !!(morningArrival && getHours(morningArrival) < lunchHour),
    },
  };
};

const EventCSVToDisplay: React.FC<{
  events: Event[];
  daysOfSelectedMonth: Date[];
}> = ({ events, daysOfSelectedMonth }) => {
  const [downloadClicked, setDownloadClicked] = React.useState(false);
  React.useEffect(() => {
    if (downloadClicked) {
      const filename = `${formatDate({
        date: daysOfSelectedMonth[0],
        formatPattern: "MMMM y",
      })}`;
      const csv = daysOfSelectedMonth
        .map((day) => {
          const dayEvents = events.filter((event) =>
            isEqual(day, startOfDay(event.start || new Date(0)))
          );
          if (dayEvents && dayEvents.length > 1) {
            throw new Error("not implemented");
          }
          let row: [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ] = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ];
          if (dayEvents && dayEvents.length === 1) {
            const formatPattern = "HH:mm";
            const nannysDay = eventToNannysDay(dayEvents[0]);
            row = [
              formatDate({ date: nannysDay.morning.arrival, formatPattern }),
              "",
              formatDate({ date: nannysDay.morning.departure, formatPattern }),
              "",
              formatDate({ date: nannysDay.noon.arrival, formatPattern }),
              "",
              formatDate({ date: nannysDay.noon.departure, formatPattern }),
              "",
              formatDate({ date: nannysDay.afternoon.arrival, formatPattern }),
              "",
              formatDate({
                date: nannysDay.afternoon.departure,
                formatPattern,
              }),
              "",
              formatDate({
                date: new Date(startOfDay(day).getTime() + nannysDay.totalHour),
                formatPattern: "HH:mm",
              }),
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              nannysDay.expense.generalFees ? "1" : "",
              nannysDay.expense.lunch ? "1" : "",
              nannysDay.expense.afterNoonMeal ? "1" : "",
            ];
          }
          return row.join(";");
        })
        .join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      var link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadClicked(false);
      }
    }
  }, [downloadClicked]);
  return (
    <button
      onClick={() => {
        setDownloadClicked(true);
      }}
    >
      Download csv
    </button>
  );
};

export const EventList: React.FC = () => {
  const { calendar } = useCalendar();
  const { client } = useClient();
  const [events, setEvents] = React.useState<Event[]>();
  const [calendarLimits, setCalendarLimits] =
    React.useState<{ start: Date; end: Date; name: string }>();
  React.useEffect(() => {
    if (calendar && client && calendarLimits) {
      const fetchEventList = async () => {
        console.log("inside fetchEventList", calendarLimits);
        const response: {
          result: EventListResponse | undefined;
        } = await client.client.calendar.events.list({
          calendarId: calendar.id,
          alwaysIncludeEmail: false,
          showDeleted: false,
          showHiddenInvitations: false,
          singleEvents: false,
          timeMin: formatISO(calendarLimits.start),
          timeMax: formatISO(calendarLimits.end),
          q: calendarLimits.name,
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
                    timeMin: formatISO(calendarLimits.start),
                    timeMax: formatISO(calendarLimits.end),
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
              acc.push({
                ...evt,
                start: parseGDate(evt.start),
                end: parseGDate(evt.end),
              });
            }
            return acc;
          },
          [] as Event[]
        );
        setEvents(
          allEvents.sort((a, b) =>
            a.start && b.start ? a.start.getTime() - b.start.getTime() : 0
          )
        );
      };
      fetchEventList();
    }
  }, [calendar, calendarLimits, client]);
  const months = eachMonthOfInterval({
    start: new Date(2020, 12, 30),
    end: new Date(2021, 11, 10),
  }).map((month) => ({ label: format(month, "MMMM"), value: getMonth(month) }));
  const { register, handleSubmit } = useForm();
  const daysOfSelectedMonth = calendarLimits
    ? eachDayOfInterval({ ...calendarLimits })
    : [];
  return events ? (
    <>
      {events.map((event) => (
        <EventToDisplay key={event.id} event={event} />
      ))}
      <EventCSVToDisplay
        events={events}
        daysOfSelectedMonth={daysOfSelectedMonth}
      />
    </>
  ) : calendar ? (
    <form
      onSubmit={handleSubmit((form) => {
        const start = startOfDay(new Date(form.year, form.month, 1));
        const end = endOfMonth(start);
        setCalendarLimits({ start, end, name: form.name as string });
      })}
    >
      <label>
        month
        <select {...register("month")}>
          {months.map((m) => (
            <option value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
      <label>
        year
        <input id="year" {...register("year")} />
      </label>
      <label>
        name
        <input id="name" {...register("name")} />
      </label>
      <input type="submit" value="Valider" />
    </form>
  ) : null;
};
