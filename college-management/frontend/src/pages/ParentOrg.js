import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./About.css";

const ParentOrg = () => {
  return (
    <>
      <Navbar />

      <section className="parent-org-page">

        <h1>About Our Parent Organisation</h1>

        <h2>Vidyaniketan Sevabhavi Sanstha (VNSS)</h2>

        <p>
          Vidyaniketan Sevabhavi Sanstha (VNSS) is a non-profit educational
          and social welfare organization established in Maharashtra, India.
        </p>

        <p>
          The organization works for education, student development,
          women empowerment and social welfare activities.
        </p>

        <p>
          VNSS aims to provide quality education and create opportunities
          for students through various academic and social initiatives.
        </p>

      </section>

      <Footer />
    </>
  );
};

export default ParentOrg;
