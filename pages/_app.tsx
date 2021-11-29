import * as React from "react";
import { CalendarProvider } from "../components/Calendar";
import { ClientProvider } from "../components/ClientProvider";
import "../styles/globals.css";

// @ts-ignore
function MyApp({ Component, pageProps }) {
  return (
    <ClientProvider>
      <CalendarProvider>
        <Component {...pageProps} />
      </CalendarProvider>
    </ClientProvider>
  );
}

export default MyApp;
