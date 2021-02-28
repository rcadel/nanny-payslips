import * as React from "react";
import { useClient } from "./ClientProvider";

const AuthorizeButton = () => {
  const client = useClient();
  return !client.isSignedIn ? (
    <button id="authorize_button">Authorize</button>
  ) : null;
};
const SignoutButton = () => {
  const client = useClient();
  return client.isSignedIn ? (
    <button id="signout_button">Sign Out</button>
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
