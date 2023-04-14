import { useRouter } from "next/router";
import { EventList } from "../../../components/Event";
import { CalendarLimits } from "../../../type";

const Results: React.FC = () => {
  const { query } = useRouter();
  const parsedQuery = query as unknown as CalendarLimits;
  return (
    <>
      <div>
        <h1>Résultats</h1>
        <EventList calendarLimits={parsedQuery} />
      </div>
      <script async defer src="https://apis.google.com/js/api.js"></script>
    </>
  );
};
export default Results;
