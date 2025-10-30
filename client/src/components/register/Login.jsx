import React from "react";
import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

function Login() {
  const { isSignedIn } = useUser();

  // If already signed in, redirect or show message
  if (isSignedIn) {
    return <Navigate to="/" />; // or any page you want
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <SignIn
        afterSignInUrl="/" 
        
      />
    </div>
  );
}

export default Login;
