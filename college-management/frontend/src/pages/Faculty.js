import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Faculty.css';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    API.get('/faculty')
      .then(res => {
        setFaculty(res.data.faculty || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const defaultFaculty = [
    {
      _id: '1',
      name: 'Dr. Sunita Patil',
      designation: 'Principal',
      department: 'Administration',
      qualification: 'Ph.D',
      experience: '20 years',
      email: 'principal@lkcwsc.edu.in',
      phone: ''
    },
    {
      _id: '2',
      name: 'Prof. Rekha Deshmukh',
      designation: 'HOD - Science',
      department: 'Science',
      qualification: 'M.Sc, B.Ed',
      experience: '15 years',
      email: 'science@lkcwsc.edu.in',
      phone: ''
    },
    {
      _id: '3',
      name: 'Prof. Anita Shinde',
      designation: 'HOD - Arts',
      department: 'Arts',
      qualification: 'M.A, B.Ed',
      experience: '12 years',
      email: 'arts@lkcwsc.edu.in',
      phone: ''
    },
    {
      _id: '4',
      name: 'Prof. Priya Kulkarni',
      designation: 'Assistant Professor',
      department: 'Science',
      qualification: 'M.Sc',
      experience: '8 years',
      email: '',
      phone: ''
    },
    {
      _id: '5',
      name: 'Prof. Meena Jadhav',
      designation: 'Assistant Professor',
      department: 'Arts',
      qualification: 'M.A',
      experience: '6 years',
      email: '',
      phone: ''
    },
    {
      _id: '6',
      name: 'Prof. Sujata More',
      designation: 'Assistant Professor',
      department: 'Science',
      qualification: 'M.Sc, NET',
      experience: '5 years',
      email: '',
      phone: ''
    },
  ];

  const displayFaculty = faculty.length > 0 ? faculty : defaultFaculty;
  const departments = ['All', ...new Set(displayFaculty.map(f => f.department))];
  const filtered = selectedDept === 'All'
    ? displayFaculty
    : displayFaculty.filter(f => f.department === selectedDept);

  return (
    <div>
      <Navbar />

      <div className="page-header">
        <h1>Our Faculty</h1>
        <p>Meet our experienced and dedicated teaching staff</p>
      </div>

      <section className="faculty-section container">

        <div className="dept-filters">
          {departments.map(dept => (
            <button
              key={dept}
              className={`dept-btn ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}>
              {dept}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading faculty...</div>
        ) : (
          <div className="faculty-grid">
            {filtered.map(member => (
              <div className="faculty-card" key={member._id}>
                <div className="faculty-avatar">
                  {member.photo ? (
                    <img
                        src={member.photo
                        ? (member.photo.startsWith('http')
                          ? member.photo
                        : `${process.env.REACT_APP_API_URL}/uploads/${member.photo}`)
                        : '/college-logo.png'}
                      alt={member.name}
                  onError={(e) => { e.target.src = '/new college logo.png'; }}
                  />
                  ) : (
                    <img src="/new college logo.png" alt="College Logo" style={{width:'80px', height:'80px', objectFit:'contain', borderRadius:'50%'}} />
                  )}
                </div>
                <div className="faculty-info">
                  <h3>{member.name}</h3>
                  <p className="faculty-designation">{member.designation}</p>
                  <span className="faculty-dept-badge">{member.department}</span>
                  <div className="faculty-details">
                    {member.qualification && (
                      <p>🎓 {member.qualification}</p>
                    )}
                    {member.experience && (
                      <p>⏱ {member.experience} experience</p>
                    )}
                    {member.email && (
                      <p>✉️ {member.email}</p>
                    )}
                    {member.phone && (
                      <p>📞 {member.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <p style={{ fontSize: '4rem' }}>👩‍🏫</p>
            <h3>No faculty found for this department</h3>
          </div>
        )}

      </section>

      <Footer />
    </div>
  );
};

export default Faculty;
