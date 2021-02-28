import * as React from "react";
import "../styles/globals.css";
import { ClientProvider } from "./ClientProvider";

function MyApp({ Component, pageProps }) {
  return (
    <ClientProvider>
      <Component {...pageProps} />
    </ClientProvider>
  );
}

export default MyApp;
