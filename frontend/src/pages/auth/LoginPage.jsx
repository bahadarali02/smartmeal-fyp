import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { loginUser } from "../../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData((previousState) => ({
      ...previousState,
      [id]: value,
    }));
  };

  const redirectByRole = (role) => {
    if (role === "customer") {
      navigate("/customer/dashboard");
      return;
    }

    if (role === "chef") {
      navigate("/chef/dashboard");
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(formData);

      localStorage.setItem("smartmealToken", data.token);
      localStorage.setItem("smartmealUser", JSON.stringify(data.user));

      setSuccessMessage("Login successful. Redirecting...");

      setTimeout(() => {
        redirectByRole(data.user.role);
      }, 800);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue browsing meals, placing orders, and managing your SmartMeal experience."
      footerText="Don’t have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Forgot password?
            </button>
          </div>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="remember" className="text-sm text-slate-600">
            Keep me logged in
          </label>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Live backend connected
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This form now sends login data to your SmartMeal backend API and
            stores the returned token and user information locally.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;