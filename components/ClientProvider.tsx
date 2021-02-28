import * as React from "react";

// Client ID and API key from the Developer Console
var CLIENT_ID =
  "941034406341-pncbag2cavgf9p6dr3nh44vhn98a3v3l.apps.googleusercontent.com";
var API_KEY = "2283iq7IOTL6cgKVLpT3luMV";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

const ClientContext = React.createContext<
  | { client: any; setClient: React.Dispatch<any>; isSignedIn: boolean }
  | undefined
>(undefined);

export const useClient = () => {
  const context = React.useContext(ClientContext);
  if (context === undefined) {
    throw Error("client should be defined");
  }
  return context;
};

async function initClient(gapi: any, setIsSignedIn: React.Dispatch<boolean>) {
  try {
    const gapiInit = await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);

    // Handle the initial sign-in state.
    setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

export const ClientProvider: React.FC = ({ children }) => {
  const [client, setClientInState] = React.useState(undefined);
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const setClient: React.Dispatch<any> = (gapi: any) => {
    gapi.load("client:auth2", () => initClient(gapi, setIsSignedIn));
  };
  return (
    <ClientContext.Provider value={{ client, setClient, isSignedIn }}>
      {children}
    </ClientContext.Provider>
  );
};
