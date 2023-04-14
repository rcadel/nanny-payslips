import { addMonths, eachMonthOfInterval, endOfMonth, getMonth } from "date-fns";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCalendar } from "../../../components/Calendar";
import { useClient } from "../../../components/ClientProvider";

const Calendar = () => {
  const { setCalendar } = useCalendar();
  const { isSignedIn, client } = useClient();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
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

  const months = eachMonthOfInterval({
    start: new Date(2020, 12, 30),
    end: new Date(2021, 11, 10),
  }).map((month) => ({ label: format(month, "MMMM"), value: getMonth(month) }));
  const now = new Date();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      year: now.getFullYear(),
      month: addMonths(now, -1).getMonth(),
      name: "",
      forfait: null as string | null,
      isComplementaryHours: false,
      id: id,
    },
  });
  return (
    <div>
      <h2>Paramétrer le bulletin de salaire</h2>
      <form
        onSubmit={handleSubmit((form) => {
          const start =
            startOfDay(new Date(form.year, form.month, 1)).getTime() + 5000;
          const end = endOfMonth(start).getTime();
          router.push({
            pathname: "/calendars/[id]/results",
            query: {
              id,
              start,
              end,
              name: form.name,
              forfait:
                form.forfait === null
                  ? undefined
                  : parseFloat(form.forfait.replace(",", ".")),
              isComplementaryHours: form.isComplementaryHours as boolean,
            },
          });
        })}
      >
        <label>
          month
          <select {...register("month")}>
            {months.map((m) => (
              <option value={m.value} key={m.value}>
                {m.label}
              </option>
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
        <label>
          forfait
          <input id="forfait" {...register("forfait")} />
        </label>
        <label>
          heure complémentaire
          <input
            id="forfait"
            type="checkbox"
            {...register("isComplementaryHours")}
          />
        </label>
        <input type="submit" value="Valider" />
      </form>
    </div>
  );
};

export default Calendar;
