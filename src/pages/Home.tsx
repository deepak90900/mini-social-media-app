import React from "react";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Mini Social Media</h1>
      {user ? (
        <p className="text-lg">Welcome, {user.displayName || user.email}!</p>
      ) : (
        <p className="text-lg">
          Please{" "}
          <a href="/login" className="text-blue-500">
            log in
          </a>{" "}
          or{" "}
          <a href="/register" className="text-blue-500">
            register
          </a>{" "}
          to continue.
        </p>
      )}
    </div>
  );
};

export default Home;
