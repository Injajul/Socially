import { SignUp } from "@clerk/clerk-react";
import React from "react";

function Signup() {
  return <SignUp afterSignUpUrl="/create-user" />;
}

export default Signup;

