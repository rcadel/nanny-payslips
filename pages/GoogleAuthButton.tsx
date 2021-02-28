import * as React from "react";
import { useClient } from "../components/ClientProvider";

const AuthorizeButton = () => {
  const client = useClient();
  const handleClick = () => {
    client.client.auth2.getAuthInstance().signIn();
  };
  return !client.isSignedIn && client.client ? (
    <button id="authorize_button" onClick={handleClick}>
      Authorize
    </button>
  ) : null;
};
const SignoutButton = () => {
  const client = useClient();
  const handleClick = () => {
    client.client.auth2.getAuthInstance().signOut();
  };
  return client.isSignedIn && client ? (
    <button id="signout_button" onClick={handleClick}>
      Sign Out
    </button>
  ) : null;
};

const GoogleAuthButton = () => {
  return (
    <>
      <AuthorizeButton />
      <SignoutButton />
    </>
  );
};

export default GoogleAuthButton;
