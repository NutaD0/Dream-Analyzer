import React from "react";
import AuthForm from "./AuthForm";
import "./styles/Authpage.css";

const AuthPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-neutral-800">
      <AuthForm />
    </div>
  );
};

export default AuthPage;
