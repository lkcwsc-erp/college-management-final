import React from "react";

const ParentOrg = () => {
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1000px",
        margin: "auto",
        lineHeight: "1.8",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#1e3a8a",
          marginBottom: "20px",
        }}
      >
        About Our Parent Organization
      </h1>

      <p>
        Our parent organization is dedicated to providing quality education,
        innovation, research opportunities, and overall student development.
        The organization continuously works toward academic excellence and
        modern learning practices.
      </p>

      <p>
        The institution focuses on creating skilled professionals with strong
        technical knowledge, leadership qualities, and ethical values. Various
        programs, workshops, seminars, and activities are conducted regularly
        for students.
      </p>

      <h2 style={{ color: "#2563eb", marginTop: "30px" }}>
        Vision
      </h2>

      <p>
        To become a center of excellence in education, research, and innovation
        by empowering students with knowledge and skills for global success.
      </p>

      <h2 style={{ color: "#2563eb", marginTop: "30px" }}>
        Mission
      </h2>

      <ul>
        <li>Provide high-quality education and training.</li>
        <li>Encourage innovation and research activities.</li>
        <li>Develop leadership and professional ethics.</li>
        <li>Create industry-ready graduates.</li>
      </ul>

      <h2 style={{ color: "#2563eb", marginTop: "30px" }}>
        Key Features
      </h2>

      <ul>
        <li>Experienced faculty members</li>
        <li>Modern infrastructure and laboratories</li>
        <li>Industry-oriented curriculum</li>
        <li>Placement and internship support</li>
        <li>Student development programs</li>
      </ul>
    </div>
  );
};

export default ParentOrg;
