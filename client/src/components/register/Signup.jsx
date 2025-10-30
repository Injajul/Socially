import { SignUp, useSignUp } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const { isSignedIn } = useSignUp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/create-user");
    }
  }, [isSignedIn, navigate]);

  return <SignUp />;
}

export default Signup;
