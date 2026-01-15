import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VanillaTilt from "vanilla-tilt";

export default function AboutDashboard() {
  const [activeModal, setActiveModal] = useState(null);

  const glowColor = "37, 99, 235"; // blue glow

  /* ✅ FIXED ROUTES */
  const cardData = [
    {
      title: "About",
      description: "Learn who we are",
      type: "page",
      path: "/about",
    },
    {
      title: "Our Service",
      description: "Discover our solutions",
      type: "page",
      path: "/about/services",
    },
    {
      title: "Halal Course",
      description: "Training & certification",
      type: "page",
      path: "/about/halal-course",
    },
    {
      title: "We Provide",
      description: "Explore resources",
      type: "page",
      path: "/about/we-provide",
    },
    {
      title: "Staff Background",
      description: "Meet our team",
      type: "page",
      path: "/about/staff-background",
    },
    {
      title: "News / Updates",
      description: "Latest events & announcements",
      type: "page",
      path: "/about/news-updates",
    },
  ];

  /* 🎯 Tilt effect */
  useEffect(() => {
    const cards = document.querySelectorAll(".tilt-card");
    VanillaTilt.init(cards, {
      max: 20,
      speed: 500,
      glare: true,
      "max-glare": 0.3,
    });

    return () => {
      cards.forEach((card) => card.vanillaTilt?.destroy());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-16 bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-16 text-center text-blue-800">
        About Dashboard
      </h1>

      {/* 🧩 Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl">
        {cardData.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="tilt-card relative rounded-2xl p-8 flex flex-col justify-between h-60 border-2 border-blue-500 bg-white hover:scale-105 transition-transform shadow-[0_0_25px_rgba(37,99,235,0.25)]"
            style={{
              boxShadow: `0 0 25px rgba(${glowColor},0.25), inset 0 0 15px rgba(${glowColor},0.1)`,
            }}
          >
            <h2 className="text-2xl font-bold text-blue-700 relative z-10">
              {card.title}
            </h2>
            <p className="text-gray-600 relative z-10">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      {/* 🪟 Modal (kept for future use) */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white text-[#16192c] p-10 rounded-3xl shadow-2xl relative max-w-2xl w-[90%]">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-3 right-3 text-gray-700 text-2xl font-bold hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-3xl font-bold mb-4 text-blue-700">
              {activeModal.title}
            </h2>
            <p className="text-lg">{activeModal.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
