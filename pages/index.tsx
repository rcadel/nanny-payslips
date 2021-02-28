import Head from "next/head";
import { useClient } from "../components/ClientProvider";
import styles from "../styles/Home.module.css";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Home() {
  const client = useClient();
  const handleOnLoad = () => {
    client.setClient((document as any).gapi);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Nanny payslips</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Add access to google calendar</h1>
        <GoogleAuthButton />
      </main>
      <script
        async
        defer
        src="https://apis.google.com/js/api.js"
        onLoad={handleOnLoad}
      ></script>
    </div>
  );
}
