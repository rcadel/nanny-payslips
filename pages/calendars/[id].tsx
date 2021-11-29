import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCalendar } from "../../components/Calendar";
import { useClient } from "../../components/ClientProvider";
import { EventList } from "../../components/Event";

const Calendar = () => {
  const { setCalendar } = useCalendar();
  const { isSignedIn, client } = useClient();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    console.log(isSignedIn, client, id);
    const fetchCalendar = async () => {
      const response: {
        result: any | undefined;
      } = await client.client.calendar.calendars.get({ calendarId: id });
      setCalendar(response.result);
    };
    if (isSignedIn && client) {
      fetchCalendar();
    }
  }, [isSignedIn, client, setCalendar]);
  return (
    <div>
      <h2>Paramétrer le bulletin de salaire</h2>
      <EventList />
    </div>
  );
};

export default Calendar;
