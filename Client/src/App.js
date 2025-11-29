import React, { useState, useEffect, useRef } from "react";

// Dynamic experience function
function getWorkExperience() {
  const startDate = new Date("2024-01-01");
  const today = new Date();
  const diff = today - startDate;
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);
  return years.toFixed(1);
}

export default function FigmaDraft({
  title = "Yashasvi's Portfolio",
  subtitle = "The White Wolf 🐺",
  cards = [],
}) {
  const [openHmModal, setOpenHmModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // -------------------- ADMIN LOGIN STATES --------------------
  const [showAdmin, setShowAdmin] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", ""]);
  const [loadingOtp, setLoadingOtp] = useState(false); // shows "Sending..."
  const [timer, setTimer] = useState(0); // countdown for resend (seconds)

  // start/stop countdown when otpSent changes or timer resets
useEffect(() => {
  let interval = null;
  if (otpSent && timer > 0) {
    interval = setInterval(() => setTimer((t) => t - 1), 1000);
  }
  return () => clearInterval(interval);
}, [otpSent, timer]);

// -------------------- Send OTP (API) --------------------
const handleSendOtp = async () => {
  setError("");
  // basic client-side check
  if (phone.length !== 10) {
    setError("Please enter a valid 10 digit phone number");
    return;
  }

  setLoadingOtp(true);

  try {
    // check user is yashasvi or not 
        if (phone !== "6367162245") {
      setError("❌ You are not Yashasvi");
      setLoading(false);
      return;
    }
    // CALL YOUR API — replace URL with your real endpoint
    const res = await fetch("https://portfolio-l4fm.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      // backend should return { message: "..." } on error
      throw new Error(data.message || "Failed to send OTP");
    }

    // If backend returns otp (for dev/testing) use it; otherwise backend may not return OTP for security
    if (data.otp) setGeneratedOtp(data.otp);

    setOtpSent(true);
    setTimer(60); // start 60s countdown
  } catch (err) {
    console.error("send-otp error:", err);
    setError(err.message || "Network error while sending OTP");
  } finally {
    setLoadingOtp(false);
  }
};

// -------------------- Resend OTP --------------------
const resendOtp = async () => {
  // reset inputs and errors if needed
  setOtpInputs(["", "", "", ""]);
  setError("");
  // Reset timer immediately, then call send
  setTimer(60);
  await handleSendOtp();
};


  // Send OTP
//   const handleSendOtp = async () => {
//   setError("");
//   setLoading(true);

//   try {
//     if (phone !== "6367162245") {
//       setError("❌ You are not Yashasvi");
//       setLoading(false);
//       return;
//     }

//     // --- API CALL TO SEND OTP ---
//     const response = await fetch("http://localhost:5000/send-otp", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ phone }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to send OTP");
//     }

//     // Assuming API returns: { otp: "1234" }
//     setGeneratedOtp(data.otp);
//     setOtpSent(true);

//     console.log("Generated OTP from API:", data.otp);
//   } catch (err) {
//     console.error(err);
//     setError("❌ " + err.message);
//   }

//   setLoading(false);
// };


  // Handle OTP typing
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);

    if (value && index < 3) {
      const next = document.querySelectorAll(".otp-box")[index + 1];
      next?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    const enteredOtp = otpInputs.join("");
    if (enteredOtp === generatedOtp) {
      window.location.href = "/admin";
    } else {
      setError("❌ Incorrect OTP");
    }
  };

  // -------------------- ANIMATIONS --------------------
  const [highlightAbout, setHighlightAbout] = useState(false);
  const [highlightProjects, setHighlightProjects] = useState(false);

  // -------------------- PROJECT CARDS --------------------
  const defaultCards = [
    { id: 1, title: "Paragon", caption: "Apperal Industry", tag: "MRR: ~5.65 Lac", logo: "/logos/Paragon.png" },
    { id: 2, title: "Jockey", caption: "Apperal Industry", tag: "MRR: ~12.50 Lac", logo: "/logos/Jockey.png" },
    { id: 3, title: "ITC Classmate", caption: "FMCG Industry", tag: "MRR: ~7 Lac", logo: "/logos/Itc.png" },
    { id: 4, title: "Dabur", caption: "FMCG Industry", tag: "MRR: ~65 Lac", logo: "/logos/Dabur.png" },
    { id: 5, title: "Colgate", caption: "FMCG Industry", tag: "MRR: ~1 Cr", logo: "/logos/Colgate.png" },
  ];
  const projectCards = cards.length ? cards : defaultCards;

  // -------------------- SLIDER --------------------
  const sliderRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCards(1);
      else if (width < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev + 0.002;
        return newOffset >= projectCards.length ? 0 : newOffset;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [projectCards.length]);

  // -------------------- CONTACT FORM --------------------
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [errors, setErrors] = useState({});
  const [buttonState, setButtonState] = useState({ text: "Submit", color: "bg-indigo-600" });
  const [loading, setLoading] = useState(false);
  const [thankYouData, setThankYouData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: false }));
    setButtonState({ text: "Submit", color: "bg-indigo-600" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    Object.keys(form).forEach((field) => {
      if (!form[field]) newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setButtonState({ text: "Please fill all required fields", color: "bg-red-600" });

      setTimeout(() => setButtonState({ text: "Submit", color: "bg-indigo-600" }), 600);
      setTimeout(() => setErrors({}), 1500);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://portfolio-l4fm.onrender.com/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Email sending failed");

      setThankYouData(form);
      setForm({ name: "", email: "", phone: "", company: "" });
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // -------------------- UI RENDER --------------------
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ---------------------- NAVBAR ---------------------- */}
<header className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">

  {/* Left Section */}
  <div className="flex items-center gap-3 min-w-[200px]">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
      🐺
    </div>
    <div className="leading-tight">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </div>

  {/* Right Section: NAV */}
  <nav
    className="
      flex items-center gap-6 text-sm font-medium 
      flex-wrap
      justify-center
      sm:justify-end
      w-full sm:w-auto
    "
  >
    <button
      onClick={() => {
        setHighlightAbout(true);
        setTimeout(() => setHighlightAbout(false), 1200);
      }}
      className="hover:text-indigo-600 transition"
    >
      About
    </button>

    <button
      onClick={() => {
        setHighlightProjects(true);
        setTimeout(() => setHighlightProjects(false), 1200);
      }}
      className="hover:text-indigo-600 transition"
    >
      Projects
    </button>

    <button
      onClick={() =>
        document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })
      }
      className="hover:text-indigo-600 transition"
    >
      Skills
    </button>

    <button
      onClick={() =>
        window.open("https://www.linkedin.com/in/yashasvi-66y1", "_blank")
      }
      className="hover:text-indigo-600 transition flex items-center"
    >
      <svg width="26" height="26" fill="#0A66C2" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 
        2.761 2.239 5 5 5h14c2.761 0 5-2.239 
        5-5v-14c0-2.761-2.239-5-5-5zM8 19H5V8h3v11zm-1.5-12.268c-.966 
        0-1.75-.79-1.75-1.764s.784-1.764 
        1.75-1.764 1.75.79 1.75 1.764-.784 
        1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 
        0V19h-3V8h3v1.765c1.396-2.586 
        7-2.777 7 2.476V19z"/>
      </svg>
    </button>
  </nav>
</header>


      {/* ---------------------- HERO + PROJECTS ---------------------- */}
      <section className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

        {/* ABOUT SECTION */}
        <div className="md:w-1/2">
          <h2
            className={`text-3xl sm:text-4xl font-extrabold transition-all duration-500 
            ${highlightAbout ? "scale-110 text-indigo-600" : ""}`}
          >
            Yashasvi Sharma
          </h2>

          <p
            className={`mt-4 text-gray-600 leading-relaxed transition-all duration-500 
            ${highlightAbout ? "bg-yellow-100 p-2 rounded-xl shadow-md" : ""}`}
          >
            I’m a <span className="font-semibold">Project Coordinator</span> in the
            <span className="font-semibold"> Product Management Team</span> with
            <span className="font-semibold"> {getWorkExperience()} years</span> experience.
            <br /><br />
            I execute across three pillars:
            <span className="font-semibold"> Scope, Resources, & Impact</span>.
          </p>

          <div className="mt-6">
            <button 
              onClick={() => { setOpenModal(true); setThankYouData(null); }} 
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow">
              Hire Me
            </button>
          </div>
        </div>

        {/* PROJECT SLIDER */}
        <div className="md:w-1/2 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[260px] h-[260px] rounded-full opacity-70 animate-[rotateRing_7s_linear_infinite]"
              style={{
                background: "linear-gradient(135deg, #8a5cf6, #b35df3, #d06ff0)",
                border: "8px solid rgba(255,255,255,0.45)",
              }}
            ></div>
          </div>

          <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6 border border-gray-200">
            <h3
              className={`text-2xl font-bold mb-4 text-center transition-all duration-500
              ${highlightProjects ? "scale-110 text-purple-600 drop-shadow-md" : ""}`}
            >
              My Projects - Enterprise Clients
            </h3>

            <div className="overflow-hidden rounded-xl">
              <div
                className="flex gap-4 whitespace-nowrap"
                ref={sliderRef}
                style={{
                  transform: `translateX(-${(offset * 100) / visibleCards}%)`,
                  transition: "transform 0.03s linear",
                }}
              >
                {projectCards.concat(projectCards).map((c, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 inline-block" 
                    style={{ width: `${100 / visibleCards}%` }}
                  >
                    <article className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col items-center text-center hover:shadow-lg transition">
                      <img src={c.logo} alt={c.title} className="w-12 h-12 object-contain mb-3 opacity-90" />
                      <h4 className="text-lg font-semibold">{c.title}</h4>
                      <p className="mt-2 text-sm text-gray-500">{c.caption}</p>
                      <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 mt-3 inline-block">{c.tag}</div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------- SKILLS ---------------------- */}
      <section id="skills" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Skills I Bring to Your Table</h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center">

          {/* Project Skills */}
          <div className="relative w-full md:w-1/2 flex items-center justify-center">
            <div
              className="absolute w-[260px] h-[260px] rounded-full opacity-70 animate-[spin_8s_linear_infinite]"
              style={{
                background: "linear-gradient(135deg, #8A5CF6, #B35DF3, #D06FF0)",
                border: "8px solid rgba(255,255,255,0.45)",
              }}
            ></div>

            <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6 border-gray-200 w-full max-w-xs">
              <h3 className="text-xl font-semibold text-center mb-4">Project Management Skills</h3>

              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "Project Planning & Scheduling",
                  "Cross-Functional Collaboration",
                  "Sprint / Task Management",
                  "Requirement Gathering & Scoping",
                  "Risk Management & Mitigation",
                  "Stakeholder Communication",
                ].map((skill, i) => (
                  <div key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm shadow-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="relative w-full md:w-1/2 flex items-center justify-center">
            <div
              className="absolute w-[260px] h-[260px] rounded-full opacity-70 animate-[spin_8s_linear_infinite]"
              style={{
                background: "linear-gradient(135deg, #FF7A5C, #FF5DC3, #FF70F0)",
                border: "8px solid rgba(255,255,255,0.45)",
              }}
            ></div>

            <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6 border-gray-200 w-full max-w-xs">
              <h3 className="text-xl font-semibold text-center mb-4">Technical / Product Skills</h3>

              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "API Testing & Postman",
                  "Basic SQL & Data Debugging",
                  "Dashboard & KPI Reporting",
                  "Product Requirement Documents",
                  "Release & Deployment Coordination",
                  "Wireframing (Figma)",
                ].map((skill, i) => (
                  <div key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm shadow-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------------- CONTACT FOOTER TILE ---------------------- */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Let’s Work Together 🚀</h3>
            <p className="text-white/90">Feel free to reach out anytime.</p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5">
            <p><strong>Email:</strong> yashasvisharma67@gmail.com</p>
            <p className="mt-1"><strong>Phone:</strong> +91-6367162245</p>
            <p className="mt-1"><strong>WhatsApp:</strong> +91-7891158797</p>
          </div>
        </div>
      </section>

      {/* ---------------------- FOOTER ---------------------- */}
      <footer className="mt-12 border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-2 text-sm text-gray-500">
              © {new Date().getFullYear()} Yashasvi. All rights reserved.
            </div>
          </div>

          {/* ADMIN LOGIN BUTTON */}
          <button
            onClick={() => setShowAdmin(true)}
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
          >
            Admin Login
          </button>
        </div>
      </footer>


      {/* Contact Form Modal */}
{openModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 relative">

      {/* Close Button */}
      <button
        onClick={() => setOpenModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
      >
        ✖
      </button>

      {/* Thank You Section */}
      {thankYouData ? (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold mb-4 text-green-600">
            Thank you for getting in touch!
          </h3>

          <p className="text-gray-700">Here is what you submitted:</p>

          <div className="mt-6 text-left space-y-2 bg-gray-100 rounded-xl p-4">
            <p><strong>Name:</strong> {thankYouData.name}</p>
            <p><strong>Email:</strong> {thankYouData.email}</p>
            <p><strong>Phone:</strong> {thankYouData.phone}</p>
            <p><strong>Company:</strong> {thankYouData.company}</p>
          </div>

          <button
            onClick={() => setOpenModal(false)}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        /* Contact Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="text-2xl font-bold mb-6 text-center">📩 Hire Me</h3>

          {["name", "email", "phone", "company"].map((field) => (
            <div key={field}>
              <label className="font-semibold capitalize">
                {field === "phone"
                  ? "Phone Number *"
                  : field.charAt(0).toUpperCase() + field.slice(1) + " *"}
              </label>

              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                type={field === "email" ? "email" : "text"}
                className={`w-full mt-1 p-3 border rounded-xl ${
                  errors[field] ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`${buttonState.color} text-white py-3 rounded-2xl font-semibold w-full transition-all`}
          >
            {loading ? "Sending..." : buttonState.text}
          </button>
        </form>
      )}
    </div>
  </div>
)}


      {/* ---------------------- ADMIN LOGIN POPUP ---------------------- */}
     {showAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-2xl w-80 shadow-xl relative">

      {/* X Close Button */}
      <button
        onClick={() => setShowAdmin(false)}
        className="absolute top-2 right-3 text-2xl font-bold leading-none cursor-pointer"
      >
        ×
      </button>

      {!otpSent ? (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">Admin Login</h2>

          <label className="text-sm font-medium">Phone Number</label>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-2 bg-gray-100 rounded-lg">+91</span>
            <input
              className="border p-2 rounded-lg w-full outline-none"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) setPhone(value);
                setError("");
              }}
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          {phone.length === 10 ? (
            <button
              onClick={handleSendOtp}
              disabled={loadingOtp}
              className={`mt-4 w-full text-white py-2 rounded-lg transition ${
                loadingOtp
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loadingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <button
              disabled
              className="mt-4 w-full bg-gray-300 text-white py-2 rounded-lg cursor-not-allowed"
            >
              Send OTP
            </button>
          )}
        </>
      ) : (
        <>
          {/* OTP VERIFY CLOSE BUTTON */}
          <button
            onClick={() => setShowAdmin(false)}
            className="absolute top-2 right-3 text-2xl font-bold leading-none cursor-pointer"
          >
            ×
          </button>

          <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>

          <div className="flex justify-between gap-2">
            {otpInputs.map((val, index) => (
              <input
                key={index}
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(e, index)}
                className="otp-box w-12 h-12 border rounded-lg text-center text-xl outline-indigo-600"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-3 text-center">{error}</p>
          )}

          {/* Verify & Timer */}
          {timer > 0 ? (
            <p className="text-center text-sm text-gray-600 mt-3">
              Resend OTP in <b>{timer}s</b>
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="mt-3 w-full text-blue-600 underline text-sm"
            >
              Resend OTP
            </button>
          )}

          <button
            onClick={handleVerifyOtp}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Verify OTP
          </button>
        </>
      )}

    </div>
  </div>
)}



    </div>
  );
}
