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

              {/* Logo + Reg + Contact */}
              <div className="po-about-logo-box">
                <img src="/Sanshta_logo.jpeg" alt="VNSS" className="po-about-logo" />

                <div className="po-about-contact">
                  <div className="po-contact-item">
                    <span className="po-contact-icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>Dongargaon Gangakhed, Marathwada<br />Maharashtra — 431514</p>
                    </div>
                  </div>
                  <div className="po-contact-item">
                    <span className="po-contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>+91 9307162914</p>
                    </div>
                  </div>
                  <div className="po-contact-item">
                    <span className="po-contact-icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p>vidyaniketanngo01@gmail.com</p>
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

        {/* VISIONARY LEADER */}
        <section className="po-section po-founders">
          <div className="po-section-inner">
            <div className="po-section-label">In Loving Memory</div>
            <h2 className="po-section-title">Our Visionary Leader</h2>
            <p className="po-section-sub">
              We honour the extraordinary life and enduring legacy of the visionary
              founder who built VNSS from the ground up and devoted his life to
              education, social welfare, and community empowerment.
            </p>

            <div className="po-founder-card">

              <div className="po-founder-left">
                <div className="po-founder-photo-large">
                  <img src="/photo.png" alt="Late Shri Sopan Sambhaji Sodgir" />
                </div>
                <div className="po-founder-years">
                  <span>07 July 1984 – 08 July 2025</span>
                  <small>Born – Passed Away</small>
                </div>
              </div>

              <div className="po-founder-info">
                <h3>Late Shri Sopan Sambhaji Sodgir</h3>
                <span className="po-founder-badge">Founder & Secretary, Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</span>

                <p>
                  Late Shri Sopan Sambhaji Sodgir was a visionary educationist, social
                  reformer, entrepreneur, and dedicated community leader whose life was
                  devoted to the service of society and the empowerment of rural
                  communities through education. Born on <strong>7th July 1984</strong>,
                  he completed his Higher Secondary Education from <em>Dayanand Junior
                  College, Latur</em> and later graduated from <em>Dayanand Arts College,
                  Latur</em>. From an early age, he demonstrated exceptional leadership
                  qualities, social awareness, and a strong desire to contribute to
                  the development of society.
                </p>

                <p>
                  With a vision to make quality education accessible to rural and
                  underprivileged students, he established{" "}
                  <strong>Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</strong> in
                  the year <strong>2005</strong>. Under his dynamic leadership, the
                  institution expanded its educational and social activities, becoming
                  a beacon of hope for many aspiring students.
                </p>

                {/* Key Achievements */}
                <div className="po-founder-achievements">
                  <div className="po-achievement-item">
                    <div className="po-achievement-icon">🏛️</div>
                    <div>
                      <strong>Late Kalpana Chawla Women's Senior College (2008)</strong>
                      <p>
                        One of his most significant achievements — founded with the noble
                        objective of providing higher education to women and promoting
                        women's empowerment through knowledge and skill development.
                        Today, the college stands as a living testament to his commitment
                        to education and social progress.
                      </p>
                    </div>
                  </div>
                  <div className="po-achievement-item">
                    <div className="po-achievement-icon">🎖️</div>
                    <div>
                      <strong>District-Level General Knowledge Competitions</strong>
                      <p>
                        Organised to encourage intellectual growth among students, gaining
                        considerable recognition. The prize distribution ceremony was
                        graced by renowned film actress Alka Kubal,
                        inspiring thousands of young participants.
                      </p>
                    </div>
                  </div>
                  <div className="po-achievement-item">
                    <div className="po-achievement-icon">🤝</div>
                    <div>
                      <strong>Samuhik Vivah Sohala (Mass Marriage Ceremonies)</strong>
                      <p>
                        Successfully organised in Gangakhed to support economically
                        disadvantaged families and promote social harmony across the
                        community.
                      </p>
                    </div>
                  </div>
                  <div className="po-achievement-item">
                    <div className="po-achievement-icon">🏗️</div>
                    <div>
                      <strong>Unique Horizon Engineers &amp; Infra Pvt. Ltd.</strong>
                      <p>
                        Founded to demonstrate that business success and social
                        responsibility can go hand in hand — creating employment
                        opportunities and contributing to regional development.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  Coming from a humble background, Shri Sopan Sodgir transformed
                  challenges into opportunities through hard work, determination, and
                  vision. He broke the cycle of poverty within his family and became
                  an inspiration for countless young people who aspired to create
                  meaningful change in society. Known for his simplicity, dedication,
                  and progressive thinking, he firmly believed that education was the
                  most powerful tool for social transformation.
                </p>

                <div className="po-founder-quote">
                  <span>"</span>A visionary may depart, but his vision continues
                  to illuminate the path for generations to come.<span>"</span>
                </div>

                <div className="po-founder-rip">
                  🕊️ &nbsp;
                  <span>
                    On <strong>8th July 2025</strong> — the day after his 41st birthday —
                    Shri Sopan Sambhaji Sodgir left for his heavenly abode. Though his
                    untimely demise created an irreplaceable void, his ideals, institutions,
                    and contributions continue to inspire future generations.
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
