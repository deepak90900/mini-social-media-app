import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, provider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State to track loading

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Failed to log in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully with Google!");
      navigate("/");
    } catch (error) {
      console.error("Error with Google Sign-In:", error);
      toast.error("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
          className="w-full p-2 mt-2 border rounded"
        />
        {errors.email?.message && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          className="w-full p-2 mt-2 border rounded"
        />
        {errors.password?.message && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}

        <button
          type="submit"
          disabled={loading} // Disable when loading
          className={`w-full p-2 mt-4 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <button
          type="button"
          disabled={loading} // Disable when loading
          onClick={handleGoogleSignIn}
          className={`w-full p-2 mt-2 text-white rounded ${
            loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loading ? "Signing In..." : "Sign In with Google"}
        </button>
      </form>
      <p className="mt-4">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-500">
          Register
        </a>
      </p>
    </div>
  );
};

export default Login;
