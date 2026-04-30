import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SectionHeader from "../components/common/SectionHeader";

const rotatingWords = ["fresh", "trusted", "homemade", "nearby"];

const featuredMeals = [
  {
    id: 1,
    name: "Chicken Biryani",
    chef: "Chef Areeba",
    price: "Rs. 850",
    tag: "Top Rated",
    rating: "4.9",
    area: "Talamba",
    chefImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Homemade Pasta",
    chef: "Chef Hammad",
    price: "Rs. 700",
    tag: "Fresh Today",
    rating: "4.8",
    area: "Khanewal",
    chefImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Grilled Chicken Bowl",
    chef: "Chef Sana",
    price: "Rs. 780",
    tag: "Healthy Choice",
    rating: "4.7",
    area: "Multan Road",
    chefImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=900&q=80",
  },
];

const stats = [
  { label: "Orders delivered", value: 500, suffix: "+" },
  { label: "Home chefs", value: 120, suffix: "+" },
  { label: "Satisfaction", value: 98, suffix: "%" },
];

const features = [
  {
    title: "Fresh Homemade Meals",
    description:
      "Discover carefully prepared dishes made by trusted home chefs near you.",
    icon: "meal",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Simple Ordering Flow",
    description:
      "Browse meals, place your order, and track clear order updates with ease.",
    icon: "order",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Chef-Managed Delivery",
    description:
      "A focused local delivery model that keeps the experience simple and reliable.",
    icon: "delivery",
    image:
      "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore approved meal cards with clean photos, PKR pricing, and chef info.",
    icon: "search",
  },
  {
    number: "02",
    title: "Order",
    description:
      "Select your favorite meal, add it to cart, and confirm your local order.",
    icon: "cart",
  },
  {
    number: "03",
    title: "Chef Prepares",
    description:
      "Your chosen home chef prepares the food fresh in their local kitchen.",
    icon: "meal",
  },
  {
    number: "04",
    title: "Delivered Fresh",
    description:
      "The chef manages nearby delivery with clear order status updates.",
    icon: "delivery",
  },
];

const trustCards = [
  {
    title: "Verified Chefs",
    description: "Chef accounts are reviewed before they can sell meals.",
    icon: "shield",
  },
  {
    title: "Real Meal Photos",
    description: "Meal listings use prepared-food photos with clean ratios.",
    icon: "image",
  },
  {
    title: "Local Delivery",
    description: "Chefs serve nearby customers only, keeping delivery realistic.",
    icon: "location",
  },
  {
    title: "Clear Updates",
    description:
      "Orders move through simple status stages from placed to delivered.",
    icon: "bell",
  },
];

const testimonials = [
  {
    name: "Hina Malik",
    role: "Customer",
    quote:
      "SmartMeal feels simple and trustworthy. I can see chef details, prices, and local delivery clearly.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Chef Sara",
    role: "Home Chef",
    quote:
      "The chef dashboard and approval flow make the platform feel organized and professional.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Usman Ali",
    role: "Customer",
    quote:
      "Saving favorites and following chefs makes it easier to order again from people I trust.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

const reviews = [
  {
    title: "Customer Review",
    text: "The flow is simple: browse, save favorites, order, and track status.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=300&q=80",
  },
  {
    title: "Chef Review",
    text: "The dashboard helps chefs manage meals, orders, and approval status clearly.",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=300&q=80",
  },
  {
    title: "Trust Review",
    text: "Meal moderation and verified chef badges make the platform feel safer.",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=300&q=80",
  },
];

const cuisinePills = [
  {
    label: "Chicken Biryani",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Karahi",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Daal Chawal",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Homemade Pasta",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "BBQ Bowl",
    image:
      "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Fresh Lunch",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Tea Snacks",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80",
  },
];

const faqs = [
  {
    question: "Does SmartMeal support riders?",
    answer:
      "No. SmartMeal uses chef-managed delivery only. Chefs serve customers in nearby local areas.",
  },
  {
    question: "Can chefs sell immediately?",
    answer:
      "No. Chef accounts require admin approval before they can access full chef features.",
  },
  {
    question: "Are meal photos required?",
    answer:
      "Yes. Chefs provide real prepared meal photos, and admins can review meal listings.",
  },
  {
    question: "What payment model is used?",
    answer:
      "Cash on Delivery is supported, with optional simulated payment for project demo use.",
  },
];

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId;
    let startTime;
    const duration = 1300;

    const animate = (time) => {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14 }
    );

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-8 opacity-0 blur-[2px]"
      }`}
    >
      {children}
    </div>
  );
}

function Icon({ type }) {
  const common = "h-6 w-6";

  const icons = {
    meal: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 11h16M6 11a6 6 0 0 1 12 0M7 16h10M9 20h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    order: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M7 7h14l-2 8H8L6 3H3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delivery: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 17V7h10v10M14 10h3l3 4v3h-6M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M6 6h15l-2 9H8L6 2H3M9 21h.01M18 21h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 6h16v12H4V6ZM8 10h.01M4 16l5-5 4 4 2-2 5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    location: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 21s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M18 9a6 6 0 0 0-12 0v4l-2 3h16l-2-3V9ZM10 20h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.meal;
}

function PremiumBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
      {children}
    </span>
  );
}

function SectionIdentity({ eyebrow, title, subtitle, align = "center" }) {
  const center = align === "center";

  return (
    <div
      className={`mx-auto ${
        center ? "max-w-3xl text-center" : "max-w-2xl text-left"
      }`}
    >
      <div
        className={`mb-5 flex ${center ? "justify-center" : "justify-start"}`}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          {eyebrow}
        </span>
      </div>

      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-8 text-slate-600">{subtitle}</p>
    </div>
  );
}

function FloatingFood({ image, className = "", delay = "0s" }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`pointer-events-none absolute hidden overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-2 shadow-xl backdrop-blur-xl lg:block motion-safe:animate-[smartFloat_7s_ease-in-out_infinite] ${className}`}
    >
      <img src={image} alt="" className="h-full w-full rounded-2xl object-cover" />
    </div>
  );
}

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((previous) => (previous + 1) % rotatingWords.length);
    }, 2300);

    return () => clearInterval(interval);
  }, []);

  const activeWord = useMemo(() => rotatingWords[wordIndex], [wordIndex]);

  const scrollToMeals = () => {
    const section = document.getElementById("meals");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="home"
      className="hero-grid-bg relative overflow-hidden border-b border-slate-200"
    >
      <div className="gradient-orb pulse-soft absolute -left-20 top-0 h-72 w-72 rounded-full" />
      <div className="gradient-orb pulse-soft absolute right-0 top-20 h-80 w-80 rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(251,146,60,0.14),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(15,23,42,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(248,250,252,0.9))]" />

      <FloatingFood
        image="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=200&q=80"
        className="left-[5%] top-24 h-20 w-20"
      />
      <FloatingFood
        image="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=200&q=80"
        className="right-[6%] top-28 h-20 w-20"
        delay="0.5s"
      />
      <FloatingFood
        image="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80"
        className="bottom-32 right-[42%] h-20 w-20"
        delay="1s"
      />

      <div className="container-custom relative grid min-h-[calc(100vh-80px)] items-center gap-16 py-20 lg:grid-cols-2">
        <Reveal>
          <PremiumBadge>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fresh meals. Simple experience. Modern design.
          </PremiumBadge>

          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Homemade food delivery made{" "}
            <span className="relative inline-flex min-w-[190px] overflow-hidden align-bottom text-orange-600">
              <span
                key={activeWord}
                className="motion-safe:animate-[wordReveal_0.65s_ease_both]"
              >
                {activeWord}
              </span>
            </span>
            , simple, and beautiful.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            SmartMeal helps customers order homemade meals, empowers home chefs
            to manage their dishes, and gives admins a clear system overview —
            all inside one modern local marketplace.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button onClick={scrollToMeals} className="btn-primary">
              Browse Meals
            </button>

            <Link to="/signup" className="btn-secondary">
              Become a Chef
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <PremiumBadge>✓ Verified chef profiles</PremiumBadge>
            <PremiumBadge>✓ Real meal photos</PremiumBadge>
            <PremiumBadge>✓ Chef-managed delivery</PremiumBadge>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <h3 className="text-2xl font-semibold text-slate-900">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-orange-400 transition-all duration-700 group-hover:w-full" />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="absolute -left-6 top-8 hidden rounded-3xl border border-white/70 bg-white/80 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl lg:block motion-safe:animate-[smartFloat_6s_ease-in-out_infinite]">
              Fresh today
            </div>

            <div className="absolute -right-4 bottom-20 hidden rounded-3xl border border-emerald-100 bg-emerald-50/90 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-xl lg:block motion-safe:animate-[smartFloat_7s_ease-in-out_infinite]">
              Verified chefs
            </div>

            <div className="float-soft mx-auto max-w-xl overflow-hidden rounded-[34px] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Today’s Highlights
                  </p>
                  <p className="text-xs text-slate-500">
                    Fresh homemade picks for you
                  </p>
                </div>
                <span className="badge-soft">Available Now</span>
              </div>

              <div className="mb-5 overflow-hidden rounded-[28px]">
                <img
                  src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80"
                  alt="Homemade meal showcase"
                  className="h-56 w-full object-cover"
                />
              </div>

              <div className="space-y-4">
                {featuredMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="group flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md"
                  >
                    <div className="overflow-hidden rounded-2xl">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="h-20 w-20 object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {meal.name}
                        </h3>
                        <span className="text-sm font-semibold text-slate-900">
                          {meal.price}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {meal.chef}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          ★ {meal.rating}
                        </span>
                        <Link
                          to="/meals"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Order
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-slate-900 p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      Smooth order updates
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      Placed → Accepted → Preparing → Ready → Delivered
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Live Flow
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>
        {`
          @keyframes smartFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }

          @keyframes wordReveal {
            0% { opacity: 0; transform: translateY(18px) scale(0.96); filter: blur(8px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }

          @keyframes premiumMarquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
    </section>
  );
}

function CuisineMarquee() {
  return (
    <section className="border-y border-slate-200 bg-white/90 py-5">
      <div className="container-custom overflow-hidden">
        <div className="flex w-max gap-4 motion-safe:animate-[premiumMarquee_28s_linear_infinite]">
          {[...cuisinePills, ...cuisinePills].map((item, index) => (
            <span
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <img
                src={item.image}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="section-shell bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,146,60,0.08),transparent_30%)]" />
      <FloatingFood
        image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
        className="-right-8 top-20 h-24 w-24"
      />

      <div className="container-custom relative">
        <Reveal>
          <SectionIdentity
            eyebrow="Product experience"
            title="Built for clarity, speed, and trust"
            subtitle="The interface stays minimal and consistent so every user role — customer, chef, and admin — gets a simple experience."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 90}>
              <div className="group h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <Icon type={feature.icon} />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MealsSection() {
  return (
    <section id="meals" className="section-shell border-y border-slate-200 bg-white">
      <FloatingFood
        image="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=200&q=80"
        className="left-8 top-24 h-24 w-24"
      />

      <div className="container-custom">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionIdentity
              eyebrow="Meal showcase"
              title="Popular meals this week"
              subtitle="A clean premium card layout gives the app a polished marketplace feel from the very first screen."
              align="left"
            />

            <Link to="/meals" className="btn-secondary w-fit lg:mb-2">
              View All Meals
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredMeals.map((meal, index) => (
            <Reveal key={meal.id} delay={index * 100}>
              <div className="group h-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/80">
                <div className="relative overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    {meal.tag}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                    ★ {meal.rating}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {meal.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Local area: {meal.area}
                      </p>
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      {meal.price}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={meal.chefImage}
                      alt={meal.chef}
                      className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {meal.chef}
                      </p>
                      <p className="text-xs text-emerald-700">
                        ✓ Verified local chef
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/meals"
                      className="btn-primary flex-1 text-center"
                    >
                      Order Now
                    </Link>
                    <Link
                      to="/meals"
                      className="btn-secondary flex-1 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-shell bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:64px_64px] opacity-25" />
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="container-custom relative">
        <Reveal>
          <SectionIdentity
            eyebrow="Ordering journey"
            title="How SmartMeal works"
            subtitle="A simple ordering journey keeps the product intuitive and attractive for first-time users."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90}>
              <div className="group relative h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-50 transition duration-300 group-hover:scale-125" />

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition duration-300 group-hover:scale-105">
                  <Icon type={step.icon} />
                </div>
                <span className="relative mt-6 block text-sm font-semibold tracking-wide text-slate-400">
                  {step.number}
                </span>
                <h3 className="relative mt-4 text-2xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="section-shell bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_30%)]" />
      <FloatingFood
        image="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=200&q=80"
        className="right-8 bottom-24 h-24 w-24"
      />

      <div className="container-custom relative">
        <Reveal>
          <SectionIdentity
            eyebrow="Safety layer"
            title="Trust designed into every step"
            subtitle="SmartMeal feels practical because approval, moderation, and local delivery rules are built into the marketplace."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {trustCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 90}>
              <div className="group h-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-105">
                  <Icon type={card.icon} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalMarketplaceSection() {
  return (
    <section className="section-shell border-y border-slate-200 bg-slate-50">
      <div className="container-custom grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionIdentity
            eyebrow="Local logic"
            title="Built for nearby homemade food, not long-distance delivery."
            subtitle="SmartMeal is designed around real local practicality. Chefs serve nearby customers, orders follow a clear status flow, and customers can choose meals from trusted kitchens in their local area."
            align="left"
          />

          <Link to="/meals" className="btn-primary mt-8 inline-flex">
            Find Local Meals
          </Link>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Nearby service areas",
            "Chef-managed delivery",
            "No rider complexity",
            "Local customer trust",
          ].map((item, index) => (
            <Reveal key={item} delay={index * 90}>
              <div className="h-full rounded-[26px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                <p className="text-lg font-semibold text-slate-900">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Practical marketplace logic for a real local food system.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section-shell bg-white">
      <div className="container-custom">
        <Reveal>
          <SectionIdentity
            eyebrow="User voices"
            title="What users say"
            subtitle="Premium marketplace trust shown through customer and chef stories."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 100}>
              <div className="h-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                  />
                  <span className="text-sm text-amber-500">★★★★★</span>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-600">
                  “{item.quote}”
                </p>

                <p className="mt-6 text-sm font-semibold text-slate-900">
                  {item.name}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  {item.role}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="section-shell border-y border-slate-200 bg-slate-50">
      <div className="container-custom">
        <Reveal>
          <SectionIdentity
            eyebrow="Review signals"
            title="Marketplace reviews"
            subtitle="Separate trust signals from customers, chefs, and the overall product experience."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.title} delay={index * 100}>
              <div className="h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={review.image}
                  alt={review.title}
                  className="h-40 w-full object-cover"
                />

                <div className="p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {review.title}
                    </span>
                    <span className="text-sm font-semibold text-amber-500">
                      ★ {review.rating}
                    </span>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-slate-600">
                    {review.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-shell bg-white">
      <div className="container-custom">
        <Reveal>
          <SectionIdentity
            eyebrow="Questions"
            title="Frequently asked questions"
            subtitle="Simple answers about SmartMeal’s local marketplace model."
          />
        </Reveal>

        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;

            return (
              <Reveal key={faq.question} delay={index * 70}>
                <div className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-slate-900">
                      {faq.question}
                    </span>
                    <span className="text-xl text-slate-400">
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-7 text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-shell bg-slate-50">
      <div className="container-custom">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-slate-900 px-6 py-14 text-white shadow-2xl md:px-12 md:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.24),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.12),transparent_24%)]" />
            <img
              src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=500&q=80"
              alt=""
              className="absolute -right-10 bottom-0 hidden h-72 w-72 rounded-[40px] object-cover opacity-70 shadow-2xl lg:block motion-safe:animate-[smartFloat_7s_ease-in-out_infinite]"
            />

            <div className="relative max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
                Start with SmartMeal
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Explore homemade meals from trusted local chefs.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                Minimal, consistent, rounded, soft, professional, and practical
                for local homemade food ordering.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/meals"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition duration-300 hover:-translate-y-0.5"
                >
                  Explore Meals
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Join as Chef
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PremiumFooterBlock() {
  return (
    <section className="border-t border-slate-200 bg-white py-12">
      <div className="container-custom grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              SM
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                SmartMeal
              </p>
              <p className="text-sm text-slate-500">
                Homemade food marketplace
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
            A premium local marketplace experience for customers, verified home
            chefs, and simple chef-managed delivery.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Explore</p>
          <div className="mt-4 space-y-3">
            <Link
              to="/meals"
              className="block text-sm text-slate-500 transition hover:text-slate-900"
            >
              Browse Meals
            </Link>
            <Link
              to="/signup"
              className="block text-sm text-slate-500 transition hover:text-slate-900"
            >
              Become a Chef
            </Link>
            <Link
              to="/login"
              className="block text-sm text-slate-500 transition hover:text-slate-900"
            >
              Login
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Trust cues</p>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500">Verified chefs</p>
            <p className="text-sm text-slate-500">Admin-reviewed meals</p>
            <p className="text-sm text-slate-500">Nearby delivery only</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <HeroSection />
      <CuisineMarquee />
      <FeaturesSection />
      <MealsSection />
      <HowItWorksSection />
      <TrustSection />
      <LocalMarketplaceSection />
      <TestimonialsSection />
      <ReviewsSection />
      <FAQSection />
      <CTASection />
      <PremiumFooterBlock />
      <Footer />
    </div>
  );
}

export default LandingPage;