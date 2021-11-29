import Head from "next/head";
import { useEffect, useRef } from "react";
import { CalendarList } from "../components/Calendar";
import { useClient } from "../components/ClientProvider";
import styles from "../styles/Home.module.css";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Home() {
  const client = useClient();
  const handleOnLoad = () => {
    client.setClient((window as any).gapi);
  };
  const ref = useRef<HTMLScriptElement>(null);
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
        <CalendarList />
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
