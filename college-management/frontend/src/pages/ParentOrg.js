import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./About.css";
import "./ParentOrg.css";
import VNSSLogo from "../assets/Sanshta_logo.jpeg"; // place logo in src/assets/

const founders = [
  {
    name: "Founder Name 1",
    title: "President & Founder",
    photo: null,
    description:
      "A visionary educationist and social reformer who established VNSS with the mission of bringing quality education to rural Maharashtra. Dedicated over 30 years to community development and student welfare.",
  }
 ];

const stats = [
  { number: "30+", label: "Years of Service" },
  { number: "5000+", label: "Students Benefited" },
  { number: "10+", label: "Institutions" },
  { number: "50+", label: "Social Initiatives" },
];

const activities = [
  {
    icon: "🎓",
    title: "Quality Education",
    desc: "Providing accessible, affordable education from primary to higher levels across rural Maharashtra.",
  },
  {
    icon: "👩",
    title: "Women Empowerment",
    desc: "Running skill development programs, scholarships, and awareness drives for girls and women.",
  },
  {
    icon: "🤝",
    title: "Social Welfare",
    desc: "Organizing health camps, blood donation drives, and community upliftment programs.",
  },
  {
    icon: "🌱",
    title: "Student Development",
    desc: "Fostering holistic growth through sports, cultural activities, and leadership programs.",
  },
  {
    icon: "📚",
    title: "Academic Excellence",
    desc: "Encouraging research, innovation, and academic distinction through merit-based rewards.",
  },
  {
    icon: "🏘️",
    title: "Rural Outreach",
    desc: "Extending educational and welfare services to underserved villages across the region.",
  },
];

const ParentOrg = () => {
  const [activeFounder, setActiveFounder] = useState(0);

  return (
    <>
      <Navbar />

      <div className="po-page">

        {/* HERO BANNER */}
        <section className="po-hero">
          <div className="po-hero-bg" />
          <div className="po-hero-content">
            <img src={VNSSLogo} alt="VNSS Logo" className="po-hero-logo" />
            <div className="po-hero-text">
              <p className="po-hero-tag">Our Parent Organisation</p>
              <h1 className="po-hero-title">Vidyaniketan Sevabhavi Sanstha</h1>
              <p className="po-hero-abbr">VNSS — Dongargaon, Maharashtra</p>
              <p className="po-hero-motto">॥ विद्या विनयेन शोभते ॥</p>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="po-stats">
          {stats.map((s, i) => (
            <div className="po-stat-item" key={i}>
              <span className="po-stat-number">{s.number}</span>
              <span className="po-stat-label">{s.label}</span>
            </div>
          ))}
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
              <div className="po-about-logo-box">
                <img src={VNSSLogo} alt="VNSS" className="po-about-logo" />
                <div className="po-about-reg">
                  <span>📌 Registered under Maharashtra Societies Act</span>
                  <span>📍 Headquartered in Dongargaon, Maharashtra</span>
                  <span>🏛️ Recognised by State Government of Maharashtra</span>
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

        {/* FOUNDERS */}
        <section className="po-section po-founders">
          <div className="po-section-inner">
            <div className="po-section-label">Leadership</div>
            <h2 className="po-section-title">Our Founders</h2>
            <p className="po-section-sub">
              Meet the visionaries who laid the foundation of VNSS and dedicated
              their lives to education and social service.
            </p>

            <div className="po-founders-layout">
              <div className="po-founders-tabs">
                {founders.map((f, i) => (
                  <button
                    key={i}
                    className={`po-founder-tab ${activeFounder === i ? "active" : ""}`}
                    onClick={() => setActiveFounder(i)}
                  >
                    <div className="po-tab-photo">
                      {f.photo ? (
                        <img src={f.photo} alt={f.name} />
                      ) : (
                        <div className="po-tab-placeholder">
                          {f.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="po-tab-name">{f.name}</div>
                      <div className="po-tab-title">{f.title}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="po-founder-detail">
                <div className="po-founder-photo-large">
                  {founders[activeFounder].photo ? (
                    <img
                      src={founders[activeFounder].photo}
                      alt={founders[activeFounder].name}
                    />
                  ) : (
                    <div className="po-photo-placeholder-large">
                      <span>{founders[activeFounder].name.charAt(0)}</span>
                      <p className="po-photo-hint">
                        📷 Add photo in <code>src/assets/</code> and update founders array
                      </p>
                    </div>
                  )}
                </div>
                <div className="po-founder-info">
                  <h3>{founders[activeFounder].name}</h3>
                  <span className="po-founder-badge">
                    {founders[activeFounder].title}
                  </span>
                  <p>{founders[activeFounder].description}</p>
                  <div className="po-founder-quote">
                    <span>"</span> Dedicated to the vision of educated,
                    empowered communities across Maharashtra. <span>"</span>
                  </div>
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
