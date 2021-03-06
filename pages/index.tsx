import Head from "next/head";
import { useEffect, useRef } from "react";
import { CalendarList, CalendarProvider } from "../components/Calendar";
import { useClient } from "../components/ClientProvider";
import { EventList } from "../components/Event";
import styles from "../styles/Home.module.css";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Home() {
  const client = useClient();
  const handleOnLoad = () => {
    client.setClient((window as any).gapi);
  };
  const ref = useRef<HTMLScriptElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.onload = handleOnLoad;
      // if already defined
      if ((window as any).gapi) {
        handleOnLoad();
      }
    }
  }, [ref.current, handleOnLoad]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Nanny payslips</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Add access to google calendar</h1>
        <GoogleAuthButton />
        <CalendarProvider>
          <CalendarList />
          <EventList />
        </CalendarProvider>
      </main>
      <script
        ref={ref}
        async
        defer
        src="https://apis.google.com/js/api.js"
        onLoad={handleOnLoad}
      ></script>
    </div>
  );
}
