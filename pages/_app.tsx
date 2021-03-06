import * as React from "react";
import { ClientProvider } from "../components/ClientProvider";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ClientProvider>
      <Component {...pageProps} />
    </ClientProvider>
  );
}

export default MyApp;
