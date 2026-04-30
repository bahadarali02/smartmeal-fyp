import React from "react";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-custom flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">SmartMeal</h3>
          <p className="mt-1 text-sm text-slate-500">
            Clean homemade food delivery marketplace UI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href="#home"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Features
          </a>
          <a
            href="#meals"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Meals
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;