import React from "react";
import { Link } from "react-router-dom";

function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_35%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-sm">
                SM
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  SmartMeal
                </h1>
                <p className="text-sm text-white/60">
                  Homemade food marketplace
                </p>
              </div>
            </Link>

            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                Clean. Minimal. Modern.
              </span>

              <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                A simple and beautiful way to order homemade meals.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
                SmartMeal connects customers with trusted home chefs through a
                clean, modern, and easy-to-use ordering experience.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h3 className="text-2xl font-semibold text-white">500+</h3>
                  <p className="mt-2 text-sm text-white/60">Orders delivered</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h3 className="text-2xl font-semibold text-white">120+</h3>
                  <p className="mt-2 text-sm text-white/60">Home chefs</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h3 className="text-2xl font-semibold text-white">98%</h3>
                  <p className="mt-2 text-sm text-white/60">Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/90">
                Chef-managed delivery flow
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Placed → Accepted → Preparing → Ready → Delivered
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                  SM
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                    SmartMeal
                  </h1>
                  <p className="text-xs text-slate-500">
                    Homemade food marketplace
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="text-center">
                <span className="badge-soft">Welcome</span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>
              </div>

              <div className="mt-8">{children}</div>

              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                {footerText}{" "}
                <Link
                  to={footerLinkTo}
                  className="font-medium text-slate-900 transition hover:text-slate-700"
                >
                  {footerLinkText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;