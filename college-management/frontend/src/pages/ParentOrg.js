import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./About.css";
import "./ParentOrg.css";

const activities = [
  {
    icon: "🎓",
    title: "Quality Education",
    desc: "Providing accessible, affordable education from primary to higher levels across rural Maharashtra, ensuring no child is left behind due to financial constraints.",
  },
  {
    icon: "👩",
    title: "Women Empowerment",
    desc: "Running skill development programs, scholarships, and awareness drives for girls and women to help them become independent and confident contributors to society.",
  },
  {
    icon: "🤝",
    title: "Social Welfare",
    desc: "Organizing health camps, blood donation drives, clean village campaigns, and community upliftment programs benefiting thousands of families annually.",
  },
  {
    icon: "🌱",
    title: "Student Development",
    desc: "Fostering holistic growth through sports, cultural activities, leadership programs, and personality development workshops for well-rounded individuals.",
  },
  {
    icon: "📚",
    title: "Academic Excellence",
    desc: "Encouraging research, innovation, and academic distinction through merit-based rewards, scholarships, and recognition of outstanding student achievements.",
  },
  {
    icon: "🏘️",
    title: "Rural Outreach",
    desc: "Extending educational and welfare services to underserved villages across the region through mobile camps, awareness programs, and field visits.",
  },
  {
    icon: "🩺",
    title: "Health & Wellness",
    desc: "Conducting free medical check-up camps, eye donation drives, and mental health awareness programs in collaboration with local health authorities.",
  },
  {
    icon: "🌿",
    title: "Environmental Awareness",
    desc: "Promoting tree plantation drives, eco-friendly campus initiatives, and environmental education programs to build a greener, sustainable future.",
  },
  {
    icon: "🏛️",
    title: "Institutional Development",
    desc: "Continuously upgrading infrastructure, laboratories, libraries, and facilities across all affiliated institutions to provide world-class learning environments.",
  },
];

const ParentOrg = () => {
  return (
    <>
      <Navbar />

      <div className="po-page">

        {/* HERO BANNER */}
        <section className="po-hero">
          <div className="po-hero-bg" />
          <div className="po-hero-content">
            <img src="/Sanshta_logo.jpeg" alt="VNSS Logo" className="po-hero-logo" />
            <div className="po-hero-text">
              <p className="po-hero-tag">Our Parent Organisation</p>
              <h1 className="po-hero-title">Vidyaniketan Sevabhavi Sanstha</h1>
              <p className="po-hero-abbr">VNSS — Dongargaon, Maharashtra</p>
              <p className="po-hero-motto">॥ विद्या विनयेन शोभते ॥</p>
            </div>
          </div>
        </section>

        {/* ABOUT VNSS */}
        <section className="po-section po-about">
          <div className="po-section-inner">
            <div className="po-section-label">Who We Are</div>
            <h2 className="po-section-title">About VNSS</h2>
            <div className="po-about-grid">
              <div className="po-about-text">
                <p>
                  <strong>Vidyaniketan Sevabhavi Sanstha (VNSS)</strong> is a
                  registered non-profit educational and social welfare
                  organisation established in Maharashtra, India. Founded with
                  the noble vision of making quality education accessible to
                  every child — regardless of background or financial status —
                  VNSS has grown into one of the most trusted educational trusts
                  in the Dongargaon region.
                </p>
                <p>
                  The organisation operates under the guiding philosophy{" "}
                  <em>॥ विद्या विनयेन शोभते ॥</em> — "Knowledge shines through
                  humility" — and strives to build not just educated individuals,
                  but responsible, compassionate citizens.
                </p>
                <p>
                  Over the decades, VNSS has expanded its footprint by
                  establishing multiple educational institutions, launching
                  community welfare drives, and partnering with government
                  bodies to bridge the urban-rural educational divide.
                </p>
              </div>

              {/* Logo + Contact + Address */}
              <div className="po-about-logo-box">
                <img src="/Sanshta_logo.jpeg" alt="VNSS" className="po-about-logo" />
                <div className="po-about-reg">
                  <span>📌 Registered under Maharashtra Societies Act</span>
                  <span>📍 Headquartered in Dongargaon, Maharashtra</span>
                  <span>🏛️ Recognised by State Government of Maharashtra</span>
                </div>
                <div className="po-about-contact">
                  <div className="po-contact-item">
                    <span className="po-contact-icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>Vidyaniketan Sevabhavi Sanstha,<br />Dongargaon, Dist. Chandrapur,<br />Maharashtra — 441207</p>
                    </div>
                  </div>
                  <div className="po-contact-item">
                    <span className="po-contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>+91 XXXXX XXXXX</p>
                    </div>
                  </div>
                  <div className="po-contact-item">
                    <span className="po-contact-icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p>info@vnss.org</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION VISION VALUES */}
        <section className="po-section po-mv">
          <div className="po-section-inner">
            <div className="po-mv-grid">
              <div className="po-mv-card po-mission">
                <div className="po-mv-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To provide affordable, quality education and empower
                  communities through inclusive social welfare programs,
                  fostering a generation of skilled, ethical, and compassionate
                  individuals rooted in Indian values.
                </p>
              </div>
              <div className="po-mv-card po-vision">
                <div className="po-mv-icon">🔭</div>
                <h3>Our Vision</h3>
                <p>
                  To be a leading educational and social institution that
                  transforms rural Maharashtra by bridging the gap between
                  aspiration and opportunity for every student and community
                  member we serve.
                </p>
              </div>
              <div className="po-mv-card po-values">
                <div className="po-mv-icon">⚖️</div>
                <h3>Our Values</h3>
                <p>
                  Integrity, Inclusivity, Excellence, Service, and Humility
                  guide every initiative we undertake — from classrooms to
                  community welfare camps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVITIES */}
        <section className="po-section po-activities">
          <div className="po-section-inner">
            <div className="po-section-label">What We Do</div>
            <h2 className="po-section-title">Key Activities & Initiatives</h2>
            <div className="po-activities-grid">
              {activities.map((a, i) => (
                <div className="po-activity-card" key={i}>
                  <div className="po-activity-icon">{a.icon}</div>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VISIONARY LEADER — renamed from Our Founder */}
        <section className="po-section po-founders">
          <div className="po-section-inner">
            <div className="po-section-label">In Loving Memory</div>
            <h2 className="po-section-title">Our Visionary Leader</h2>
            <p className="po-section-sub">
              We honour the life and legacy of the visionary who built VNSS
              from the ground up and devoted his life to education and community service.
            </p>

            <div className="po-founder-card">

              {/* LEFT — Photo + Years */}
              <div className="po-founder-left">
                <div className="po-founder-photo-large">
                  {/* To add photo later:
                      1. Save photo as public/sopan_sodgir.jpg
                      2. Replace the div below with:
                         <img src="/sopan_sodgir.jpg" alt="Late Shri Sopan Sodgir" /> */}
                  <div className="po-photo-placeholder-large">
                    <span>S</span>
                    <p className="po-photo-hint">
                      📷 Add photo as<br />
                      <code>public/sopan_sodgir.jpg</code>
                    </p>
                  </div>
                </div>
                <div className="po-founder-years">
                  <span>1940 – 2025</span>
                  <small>Born – Passed Away</small>
                </div>
              </div>

              {/* RIGHT — Info */}
              <div className="po-founder-info">
                <h3>Late Shri Sopan Sodgir</h3>
                <span className="po-founder-badge">Founder & President, VNSS</span>

                <p>
                  Late Shri Sopan Sodgir was a visionary educationist, dedicated social
                  worker, and the founding force behind Vidyaniketan Sevabhavi Sanstha.
                  With an unwavering belief that education is the most powerful tool for
                  social transformation, he established VNSS with the mission of bringing
                  quality education to the doorstep of every child in rural Maharashtra.
                </p>
                <p>
                  Throughout his life, he championed the causes of women empowerment,
                  student welfare, and community development — tirelessly working to
                  build institutions that would outlast him and continue serving
                  generations to come. His leadership, humility, and compassion
                  inspired all who had the privilege of working alongside him.
                </p>

                <div className="po-founder-quote">
                  <span>"</span> Education is not just about knowledge — it is about
                  building character, nurturing compassion, and empowering every individual
                  to contribute meaningfully to society. <span>"</span>
                </div>

                <div className="po-founder-rip">
                  🕊️ &nbsp;
                  <span>
                    <strong>Late Shri Sopan Sodgir</strong> — Forever in our hearts.
                    His vision lives on through every student we serve.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default ParentOrg;
