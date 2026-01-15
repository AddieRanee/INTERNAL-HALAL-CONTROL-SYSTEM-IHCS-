import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VanillaTilt from "vanilla-tilt";

export default function AddInfoDashboard() {
  const [activeModal, setActiveModal] = useState(null);

  const glowColor = "37, 99, 235"; // blue glow

  // ⭐ Correct paths to match App.jsx routes ⭐
  const cardData = [
    {
      title: "About",
      description: "Add or update About section content",
      type: "page",
      path: "/add-about",  // ✅ FIXED
    },
    {
      title: "Our Service",
      description: "Insert services your company provides",
      type: "page",
      path: "/add-our-service",
    },
    {
      title: "Halal Course",
      description: "Upload halal training/course details",
      type: "page",
      path: "/add-halal-course",
    },
    {
      title: "We Provide",
      description: "Add information about what your company offers",
      type: "page",
      path: "/add-we-provide",
    },
    {
      title: "Staff Background",
      description: "Insert or update staff information",
      type: "page",
      path: "/add-staff-background",
    },
    {
      title: "News / Updates",
      description: "Post latest news and announcements",
      type: "page",
      path: "/add-news-updates",
    },
  ];

  // Tilt Effect
  useEffect(() => {
    const cards = document.querySelectorAll(".tilt-card");
    VanillaTilt.init(cards, {
      max: 20,
      speed: 500,
      glare: true,
      "max-glare": 0.3,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-16 bg-gray-100">
      
      <h1 className="text-5xl font-extrabold mb-16 text-center text-blue-800">
        Add Information
      </h1>

      {/* Bento Grid */}
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
            <p className="text-gray-600 relative z-10">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
