import React from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsmobile from "./aws-exports";
import { Amplify } from "aws-amplify";
import Dashboard from "./page/dashboard";
import '@aws-amplify/ui-react/styles.css';


Amplify.configure(awsmobile);

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default withAuthenticator(App);
