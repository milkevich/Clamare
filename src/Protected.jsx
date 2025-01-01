// src/Protected.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "./shared/UI/Loader";
import { AuthContext } from "./contexts/AuthContext"; 

const Protected = () => {
  const { customer, loading } = useContext(AuthContext); 

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 170px)",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!customer) {
    return <Navigate to={"/account/login"} />;
  }

  return <Outlet />;
};

export default Protected;
