import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [feesAmount, setFeesAmount] = useState('');
  const [message, setMessage] = useState('');
  const [staff, setStaff] = useState([]);
  const [editStaff, setEditStaff] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff_student'
  });
  const [showCredentials, setShowCredentials] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: '', code: '', type: 'BA', duration: '3 Years', fees: '', eligibility: '', description: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', designation: '', department: '', qualification: '', experience: '', email: '', phone: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', targetAudience: 'all' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', venue: '', category: 'academic' });
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'campus', image: null });
  const [editGalleryId, setEditGalleryId] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState(null);

  useEffect(() => {
    API.get('/notices').then(res => setNotices(res.data.notices || []));
    API.get('/courses').then(res => setCourses(res.data.courses || []));
    API.get('/faculty').then(res => setFaculty(res.data.faculty || []));
    API.get('/events').then(res => setEvents(res.data.events || []));
    API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    API.get('/admissions').then(res => setAdmissions(res.data.admissions || [])).catch(() => {});
    API.get('/students').then(res => setStudents(res.data.students || [])).catch(() => {});
    API.get('/contact').then(res => setContacts(res.data.contacts || [])).catch(() => {});
    API.get('/auth/staff').then(res => setStaff(res.data.staff || [])).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/courses', courseForm);
      showMessage('Course added successfully!');
      setCourseForm({ name: '', code: '', type: 'BA', duration: '3 Years', fees: '', eligibility: '', description: '' });
      API.get('/courses').then(res => setCourses(res.data.courses || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/faculty', facultyForm);
      showMessage('Faculty added successfully!');
      setFacultyForm({ name: '', designation: '', department: '', qualification: '', experience: '', email: '', phone: '' });
      API.get('/faculty').then(res => setFaculty(res.data.faculty || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/notices', noticeForm);
      showMessage('Notice posted successfully!');
      setNoticeForm({ title: '', content: '', category: 'general', targetAudience: 'all' });
      API.get('/notices').then(res => setNotices(res.data.notices || []));
    } catch (err) { showMessage('Failed to post notice.'); }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', eventForm);
      showMessage('Event added successfully!');
      setEventForm({ title: '', description: '', date: '', venue: '', category: 'academic' });
      API.get('/events').then(res => setEvents(res.data.events || []));
    } catch (err) { showMessage('Failed to add event.'); }
  };

  // ====== STAFF FUNCTIONS ======
  const handleStaffSubmit = async (e) => {
    e.preventDefault();

    if (staffForm.password.length < 6) {
      showMessage('Password must be at least 6 characters');
      return;
    }

    try {
      await API.post('/auth/create-staff', staffForm);
      showMessage('✅ Staff created successfully!');
      setShowCredentials({
        name: staffForm.name,
        username: staffForm.username,
        email: staffForm.email,
        password: staffForm.password,
        role: staffForm.role
      });
      setStaffForm({
        name: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff_student'
      });
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) {
      showMessage('Failed: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm('Delete this staff? They will not be able to login anymore.')) {
      try {
        await API.delete(`/auth/staff/${id}`);
        showMessage('Staff deleted successfully!');
        API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
      } catch (err) {
        showMessage('Failed to delete staff');
      }
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/auth/staff/${editStaff._id}`, {
        name: editStaff.name,
        username: editStaff.username,
        email: editStaff.email,
        phone: editStaff.phone,
      });
      showMessage('✅ Staff updated!');
      setEditStaff(null);
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) {
      showMessage('Failed: ' + (err.response?.data?.message || 'Error'));
    }
  };

  // ====== GALLERY FUNCTIONS ======
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGalleryForm({ ...galleryForm, image: file });
      setGalleryPreview(URL.createObjectURL(file));
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', galleryForm.title);
      data.append('description', galleryForm.description);
      data.append('category', galleryForm.category);
      if (galleryForm.image) data.append('image', galleryForm.image);

      if (editGalleryId) {
        await API.put(`/gallery/${editGalleryId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMessage('Image updated successfully!');
      } else {
        await API.post('/gallery', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMessage('Image uploaded successfully!');
      }

      setGalleryForm({ title: '', description: '', category: 'campus', image: null });
      setEditGalleryId(null);
      setGalleryPreview(null);
      API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    } catch (err) {
      showMessage('Failed: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleEditGallery = (item) => {
    setEditGalleryId(item._id);
    setGalleryForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      image: null
    });
    setGalleryPreview(`http://localhost:5000/uploads/${item.image}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditGalleryId(null);
    setGalleryForm({ title: '', description: '', category: 'campus', image: null });
    setGalleryPreview(null);
  };

  const deleteGallery = async (id) => {
    if (window.confirm('Delete this image?')) {
      await API.delete(`/gallery/${id}`);
      showMessage('Image deleted successfully!');
      API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm('Delete this course?')) {
      await API.delete(`/courses/${id}`);
      API.get('/courses').then(res => setCourses(res.data.courses || []));
    }
  };

  const deleteFaculty = async (id) => {
    if (window.confirm('Delete this faculty?')) {
      await API.delete(`/faculty/${id}`);
      API.get('/faculty').then(res => setFaculty(res.data.faculty || []));
    }
  };

  const deleteNotice = async (id) => {
    if (window.confirm('Delete this notice?')) {
      await API.delete(`/notices/${id}`);
      API.get('/notices').then(res => setNotices(res.data.notices || []));
    }
  };

  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'admissions', label: '📝 Admissions' },
    { id: 'students', label: '👩‍🎓 Students' },
    { id: 'courses', label: '📚 Courses' },
    { id: 'faculty', label: '👩‍🏫 Faculty' },
    { id: 'staff', label: '👨‍💼 Staff Login' },
    { id: 'gallery', label: '🖼️ Gallery' },
    { id: 'notices', label: '📢 Notices' },
    { id: 'events', label: '🗓️ Events' },
    { id: 'contacts', label: '📬 Messages' },
  ];

  const updateAdmissionStatus = async (id, newStatus, extraData = {}) => {
    try {
      await API.put(`/admissions/${id}`, { status: newStatus, ...extraData });
      showMessage(`Application ${newStatus} successfully!`);
      API.get('/admissions').then(res => setAdmissions(res.data.admissions || []));
      setSelectedAdmission(null);
      setShowApproveForm(false);
      setFeesAmount('');
    } catch (err) {
      showMessage('Failed to update status');
    }
  };

  const handleApproveClick = () => {
    if (selectedAdmission?.course?.fees) {
      setFeesAmount(selectedAdmission.course.fees);
    } else if (selectedAdmission?.fees) {
      setFeesAmount(selectedAdmission.fees);
    }
    setShowApproveForm(true);
  };

  const submitApproval = (e) => {
    e.preventDefault();
    if (!feesAmount || feesAmount <= 0) {
      showMessage('Please enter a valid fees amount');
      return;
    }
    updateAdmissionStatus(selectedAdmission._id, 'approved', { fees: Number(feesAmount) });
  };

  const deleteAdmission = async (id) => {
    if (window.confirm('Delete this application permanently?')) {
      try {
        await API.delete(`/admissions/${id}`);
        showMessage('Application deleted!');
        API.get('/admissions').then(res => setAdmissions(res.data.admissions || []));
        setSelectedAdmission(null);
      } catch (err) {
        showMessage('Failed to delete');
      }
    }
  };

  const toggleFeesPaid = async (admission) => {
    try {
      await API.put(`/admissions/${admission._id}`, {
        feesPaid: !admission.feesPaid
      });
      showMessage(admission.feesPaid ? 'Marked as Unpaid' : 'Marked as Paid!');
      API.get('/admissions').then(res => {
        setAdmissions(res.data.admissions || []);
        const updated = (res.data.admissions || []).find(a => a._id === admission._id);
        if (updated) setSelectedAdmission(updated);
      });
    } catch (err) {
      showMessage('Failed to update fees status');
    }
  };
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          <div>
            <p className="sidebar-college">LKCWSC</p>
            <p className="sidebar-role">Admin Portal</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info"><span>👋 {user?.name} (Admin)</span></div>
        </div>

        {message && <div className="dash-message">{message}</div>}

        <div className="dashboard-content">

          {activeTab === 'home' && (
            <div>
              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">👩‍🎓</div>
                  <div><h3>{students.length}</h3><p>Total Students</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">👩‍🏫</div>
                  <div><h3>{faculty.length}</h3><p>Faculty Members</p></div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">📚</div>
                  <div><h3>{courses.length}</h3><p>Courses</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">📬</div>
                  <div><h3>{contacts.length}</h3><p>Messages</p></div>
                </div>
              </div>
              <div className="recent-section">
                <h3>Recent Notices</h3>
                {notices.slice(0, 5).map(notice => (
                  <div className="notice-row" key={notice._id}>
                    <span className="notice-dot"></span>
                    <div>
                      <p className="notice-title">{notice.title}</p>
                      <p className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              {students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👩‍🎓</div>
                  <h3>No Students Yet</h3>
                  <p>Students will appear here after registration.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Roll No</th><th>Course</th><th>Year</th></tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s._id}>
                          <td>{s.user?.name}</td>
                          <td>{s.user?.email}</td>
                          <td>{s.rollNumber}</td>
                          <td>{s.course?.name}</td>
                          <td>Year {s.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <div className="form-card">
                <h3>Add New Course</h3>
                <form onSubmit={handleCourseSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Course Name</label>
                      <input type="text" placeholder="e.g. Bachelor of Arts" value={courseForm.name}
                        onChange={e => setCourseForm({...courseForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Course Code</label>
                      <input type="text" placeholder="e.g. BA001" value={courseForm.code}
                        onChange={e => setCourseForm({...courseForm, code: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Type</label>
                      <select value={courseForm.type} onChange={e => setCourseForm({...courseForm, type: e.target.value})}>
                        <option value="BA">BA</option>
                        <option value="BSc">BSc</option>
                        <option value="BCom">BCom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fees (₹/year)</label>
                      <input type="number" placeholder="Annual fees" value={courseForm.fees}
                        onChange={e => setCourseForm({...courseForm, fees: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Eligibility</label>
                    <input type="text" placeholder="e.g. 10+2 pass" value={courseForm.eligibility}
                      onChange={e => setCourseForm({...courseForm, eligibility: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Course description" value={courseForm.description}
                      onChange={e => setCourseForm({...courseForm, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Course</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Courses ({courses.length})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Code</th><th>Type</th><th>Fees</th><th>Duration</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td><td>{c.code}</td><td>{c.type}</td>
                        <td>₹{c.fees}</td><td>{c.duration}</td>
                        <td><button className="btn-delete" onClick={() => deleteCourse(c._id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'faculty' && (
            <div>
              <div className="form-card">
                <h3>Add New Faculty</h3>
                <form onSubmit={handleFacultySubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" placeholder="Faculty name" value={facultyForm.name}
                        onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input type="text" placeholder="e.g. Professor" value={facultyForm.designation}
                        onChange={e => setFacultyForm({...facultyForm, designation: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" placeholder="e.g. Science" value={facultyForm.department}
                        onChange={e => setFacultyForm({...facultyForm, department: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Qualification</label>
                      <input type="text" placeholder="e.g. M.Sc, Ph.D" value={facultyForm.qualification}
                        onChange={e => setFacultyForm({...facultyForm, qualification: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" placeholder="Faculty email" value={facultyForm.email}
                        onChange={e => setFacultyForm({...facultyForm, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" placeholder="Phone number" value={facultyForm.phone}
                        onChange={e => setFacultyForm({...facultyForm, phone: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Faculty</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Faculty ({faculty.length})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Designation</th><th>Department</th><th>Email</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {faculty.map(f => (
                      <tr key={f._id}>
                        <td>{f.name}</td><td>{f.designation}</td>
                        <td>{f.department}</td><td>{f.email}</td>
                        <td><button className="btn-delete" onClick={() => deleteFaculty(f._id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ STAFF LOGIN TAB ============ */}
          {activeTab === 'staff' && (
            <div>
              {/* SUCCESS MODAL */}
              {showCredentials && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,padding:'20px'}} onClick={() => setShowCredentials(null)}>
                  <div style={{background:'white',borderRadius:'12px',padding:'30px',maxWidth:'500px',width:'100%'}} onClick={e => e.stopPropagation()}>
                    <div style={{textAlign:'center',marginBottom:'20px'}}>
                      <div style={{fontSize:'48px'}}>✅</div>
                      <h2 style={{color:'#28a745',margin:'10px 0'}}>Staff Created!</h2>
                      <p style={{color:'#666'}}>Share these credentials with staff member</p>
                    </div>
                    <div style={{background:'#f0f9ff',padding:'20px',borderRadius:'8px',border:'2px solid #bae6fd',marginBottom:'20px'}}>
                      <p style={{margin:'8px 0'}}><strong>👤 Name:</strong> {showCredentials.name}</p>
                      <p style={{margin:'8px 0'}}><strong>🪪 Username:</strong> {showCredentials.username}</p>
                      <p style={{margin:'8px 0'}}><strong>📧 Email:</strong> {showCredentials.email}</p>
                      <p style={{margin:'8px 0'}}><strong>🔑 Password:</strong> <code style={{background:'white',padding:'4px 10px',borderRadius:'4px',fontFamily:'monospace'}}>{showCredentials.password}</code></p>
                      <p style={{margin:'8px 0'}}><strong>👔 Role:</strong> {
                        showCredentials.role === 'staff_principal' ? '👨‍🏫 Principal' :
                        showCredentials.role === 'staff_student' ? '👩‍🎓 Student Section' :
                        showCredentials.role === 'staff_accounts' ? '💰 Accounts Section' :
                        showCredentials.role === 'staff_exam' ? '📝 Examination Section' :
                        showCredentials.role === 'staff_scholarship' ? '🎓 Scholarship Section' :
                        showCredentials.role
                      }</p>
                    </div>
                    <div style={{background:'#fff3cd',padding:'12px',borderRadius:'8px',fontSize:'13px',color:'#856404',marginBottom:'16px'}}>
                      ⚠️ Save these credentials! Password cannot be viewed again.
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCredentials(null)} style={{width:'100%'}}>Got It! Close</button>
                  </div>
                </div>
              )}

              {/* EDIT STAFF MODAL */}
              {editStaff && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,padding:'20px'}} onClick={() => setEditStaff(null)}>
                  <div style={{background:'white',borderRadius:'12px',padding:'30px',maxWidth:'480px',width:'100%'}} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                      <h2 style={{color:'#1565C0'}}>✏️ Edit Staff</h2>
                      <button onClick={() => setEditStaff(null)} style={{background:'#eee',border:'none',borderRadius:'50%',width:'36px',height:'36px',cursor:'pointer',fontSize:'18px'}}>✕</button>
                    </div>
                    <form onSubmit={handleEditStaffSubmit}>
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" value={editStaff.name}
                          onChange={e => setEditStaff({...editStaff, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={editStaff.username || ''}
                          onChange={e => setEditStaff({...editStaff, username: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={editStaff.email}
                          onChange={e => setEditStaff({...editStaff, email: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={editStaff.phone || ''} maxLength="10"
                          onChange={e => {
                            const val = e.target.value;
                            if (/^\d{0,10}$/.test(val)) setEditStaff({...editStaff, phone: val});
                          }} />
                      </div>
                      <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                        <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditStaff(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* CREATE FORM */}
              <div className="form-card">
                <h3>👥 Create Staff Login</h3>
                <p style={{color:'#666',fontSize:'14px',marginBottom:'20px'}}>Create login credentials for staff members. Choose their section role.</p>
                <form onSubmit={handleStaffSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" placeholder="e.g. Rahul Sharma"
                        value={staffForm.name}
                        onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Username *</label>
                      <input type="text" placeholder="e.g. rahul_sharma"
                        value={staffForm.username}
                        onChange={e => setStaffForm({...staffForm, username: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" placeholder="staff@lkcwsc.edu.in"
                        value={staffForm.email}
                        onChange={e => setStaffForm({...staffForm, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Password * (min 6 characters)</label>
                      <input type="text" placeholder="e.g. Staff@1234"
                        value={staffForm.password}
                        onChange={e => setStaffForm({...staffForm, password: e.target.value})}
                        minLength="6" required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" placeholder="9876543210"
                        value={staffForm.phone} maxLength="10"
                        onChange={e => {
                          const val = e.target.value;
                          if (/^\d{0,10}$/.test(val)) setStaffForm({...staffForm, phone: val});
                        }} />
                    </div>
                    <div className="form-group">
                      <label>Staff Section Role *</label>
                      <select value={staffForm.role}
                        onChange={e => setStaffForm({...staffForm, role: e.target.value})} required>
                        <option value="staff_principal">👨‍🏫 Principal</option>
                        <option value="staff_student">👩‍🎓 Student Section</option>
                        <option value="staff_accounts">💰 Accounts Section</option>
                        <option value="staff_exam">📝 Examination Section</option>
                        <option value="staff_scholarship">🎓 Scholarship Section</option>
                      </select>
                      <small style={{color:'#666',marginTop:'6px',display:'block'}}>💡 Staff will be redirected to their section dashboard after login</small>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{padding:'12px 32px'}}>➕ Create Staff Login</button>
                </form>
              </div>

              {/* STAFF TABLE */}
              <h3 style={{margin:'30px 0 16px'}}>👥 All Staff Members ({staff.length})</h3>

              {staff.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👨‍💼</div>
                  <h3>No Staff Yet</h3>
                  <p>Create staff members to manage ERP sections.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email & Password</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>
                            <code style={{background:'#f1f5f9',padding:'2px 8px',borderRadius:'4px',fontSize:'13px'}}>
                              {s.username || '-'}
                            </code>
                          </td>
                          <td>
                            <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>📧 {s.email}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                              <code style={{background:'#f1f5f9',padding:'2px 10px',borderRadius:'4px',fontFamily:'monospace',fontSize:'13px',minWidth:'100px',letterSpacing: visiblePasswords[s._id] ? 'normal' : '3px'}}>
                                {visiblePasswords[s._id]
                                  ? (s.plainPassword || s.password || '(not stored)')
                                  : '••••••••'}
                              </code>
                              <button
                                onClick={() => setVisiblePasswords(prev => ({...prev, [s._id]: !prev[s._id]}))}
                                title={visiblePasswords[s._id] ? 'Hide' : 'Show password'}
                                style={{background:'none',border:'1px solid #ddd',borderRadius:'6px',cursor:'pointer',padding:'3px 7px',fontSize:'15px',lineHeight:1}}>
                                {visiblePasswords[s._id] ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </td>
                          <td>{s.phone || '-'}</td>
                          <td>
                            <span className="notice-tag" style={{
                              background: s.role === 'staff_principal' ? '#fee2e2' :
                                         s.role === 'staff_student' ? '#dbeafe' :
                                         s.role === 'staff_accounts' ? '#dcfce7' :
                                         s.role === 'staff_exam' ? '#fef3c7' :
                                         s.role === 'staff_scholarship' ? '#f3e8ff' : '#e5e7eb',
                              color: s.role === 'staff_principal' ? '#991b1b' :
                                    s.role === 'staff_student' ? '#1e40af' :
                                    s.role === 'staff_accounts' ? '#15803d' :
                                    s.role === 'staff_exam' ? '#92400e' :
                                    s.role === 'staff_scholarship' ? '#7e22ce' : '#374151'
                            }}>
                              {s.role === 'staff_principal' ? '👨‍🏫 Principal' :
                               s.role === 'staff_student' ? '👩‍🎓 Student Section' :
                               s.role === 'staff_accounts' ? '💰 Accounts' :
                               s.role === 'staff_exam' ? '📝 Examination' :
                               s.role === 'staff_scholarship' ? '🎓 Scholarship' : s.role}
                            </span>
                          </td>
                          <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{display:'flex',gap:'6px'}}>
                              <button
                                className="btn btn-primary"
                                style={{padding:'5px 12px',fontSize:'13px',background:'#1565C0'}}
                                onClick={() => setEditStaff({...s})}>
                                ✏️ Edit
                              </button>
                              <button className="btn-delete" onClick={() => deleteStaff(s._id)}>
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* ============ END STAFF LOGIN TAB ============ */}

          {activeTab === 'gallery' && (
            <div>
              <div className="form-card">
                <h3>{editGalleryId ? '✏️ Edit Image' : '➕ Add New Image'}</h3>
                <form onSubmit={handleGallerySubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Image Title *</label>
                      <input type="text" placeholder="Enter image title"
                        value={galleryForm.title}
                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={galleryForm.category}
                        onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                        <option value="campus">Campus</option>
                        <option value="events">Events</option>
                        <option value="sports">Sports</option>
                        <option value="cultural">Cultural</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Tell us about this photo..."
                      value={galleryForm.description}
                      onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}></textarea>
                  </div>

                  <div className="form-group">
                    <label>{editGalleryId ? 'Replace Image (optional)' : 'Upload Image *'}</label>
                    <input type="file" accept="image/*"
                      onChange={handleImageChange}
                      required={!editGalleryId} />
                    {galleryPreview && (
                      <img src={galleryPreview} alt="Preview"
                        style={{
                          width: '200px', height: '150px', objectFit: 'cover',
                          marginTop: '10px', borderRadius: '8px', border: '2px solid #ddd'
                        }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      {editGalleryId ? 'Update Image' : 'Upload Image'}
                    </button>
                    {editGalleryId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <h3 style={{ margin: '30px 0 16px' }}>All Gallery Images ({gallery.length})</h3>

              {gallery.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🖼️</div>
                  <h3>No Images Yet</h3>
                  <p>Upload your first image to get started.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {gallery.map(item => (
                    <div className="event-card" key={item._id}>
                      <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.title}
                        style={{
                          width: '100%', height: '180px', objectFit: 'cover',
                          borderRadius: '8px', marginBottom: '12px'
                        }} />
                      <span className="notice-tag">{item.category}</span>
                      <h4>{item.title}</h4>
                      <p style={{ color: '#666', fontSize: '13px' }}>{item.description}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => handleEditGallery(item)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteGallery(item._id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notices' && (
            <div>
              <div className="form-card">
                <h3>Post New Notice</h3>
                <form onSubmit={handleNoticeSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" placeholder="Notice title" value={noticeForm.title}
                      onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} required />
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Category</label>
                      <select value={noticeForm.category} onChange={e => setNoticeForm({...noticeForm, category: e.target.value})}>
                        <option value="general">General</option>
                        <option value="exam">Exam</option>
                        <option value="admission">Admission</option>
                        <option value="event">Event</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Target</label>
                      <select value={noticeForm.targetAudience} onChange={e => setNoticeForm({...noticeForm, targetAudience: e.target.value})}>
                        <option value="all">All</option>
                        <option value="student">Students</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea rows="4" placeholder="Notice content..." value={noticeForm.content}
                      onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Post Notice</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Notices ({notices.length})</h3>
              {notices.map(n => (
                <div className="notice-full-card" key={n._id}>
                  <div className="notice-full-header">
                    <h4>{n.title}</h4>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                      <span className="notice-tag">{n.category}</span>
                      <button className="btn-delete" onClick={() => deleteNotice(n._id)}>Delete</button>
                    </div>
                  </div>
                  <p>{n.content}</p>
                  <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="form-card">
                <h3>Add New Event</h3>
                <form onSubmit={handleEventSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Event Title</label>
                      <input type="text" placeholder="Event name" value={eventForm.title}
                        onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" value={eventForm.date}
                        onChange={e => setEventForm({...eventForm, date: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Venue</label>
                      <input type="text" placeholder="Event venue" value={eventForm.venue}
                        onChange={e => setEventForm({...eventForm, venue: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})}>
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Event description" value={eventForm.description}
                      onChange={e => setEventForm({...eventForm, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Event</button>
                </form>
              </div>
              <h3 style={{margin: '30px 0 16px'}}>All Events ({events.length})</h3>
              <div className="events-grid">
                {events.map(ev => (
                  <div className="event-card" key={ev._id}>
                    <span className="notice-tag">{ev.category}</span>
                    <h4>{ev.title}</h4>
                    <p>📅 {new Date(ev.date).toLocaleDateString()}</p>
                    <p>📍 {ev.venue}</p>
                    <p style={{color:'#666', fontSize:'14px', marginTop:'8px'}}>{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <h3 style={{marginBottom: '20px'}}>Contact Messages ({contacts.length})</h3>
              {contacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📬</div>
                  <h3>No Messages Yet</h3>
                  <p>Contact form submissions will appear here.</p>
                </div>
              ) : (
                contacts.map(c => (
                  <div className="notice-full-card" key={c._id}>
                    <div className="notice-full-header">
                      <h4>{c.name} — {c.subject}</h4>
                      <span className={c.isRead ? 'notice-tag' : 'notice-tag unread'}>
                        {c.isRead ? 'Read' : 'New'}
                      </span>
                    </div>
                    <p>{c.message}</p>
                    <small>📧 {c.email} | 📞 {c.phone} | {new Date(c.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'admissions' && (
            <div>
              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">📝</div>
                  <div><h3>{admissions.length}</h3><p>Total Applications</p></div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">⏳</div>
                  <div><h3>{admissions.filter(a => a.status === 'pending').length}</h3><p>Pending</p></div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">✅</div>
                  <div><h3>{admissions.filter(a => a.status === 'approved').length}</h3><p>Approved</p></div>
                </div>
                <div className="dash-card red">
                  <div className="dash-card-icon">❌</div>
                  <div><h3>{admissions.filter(a => a.status === 'rejected').length}</h3><p>Rejected</p></div>
                </div>
              </div>

              <h3 style={{marginBottom: '16px'}}>All Applications</h3>

              {admissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Applications Yet</h3>
                  <p>Admission applications from students will appear here.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map(a => (
                        <tr key={a._id}>
                          <td>{a.applicantName}</td>
                          <td>{a.email}</td>
                          <td>{a.phone}</td>
                          <td>{a.course?.name || '-'}</td>
                          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className="notice-tag" style={{
                              background: a.status === 'approved' ? '#d4edda' :
                                         a.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                              color: a.status === 'approved' ? '#155724' :
                                     a.status === 'rejected' ? '#721c24' : '#856404'
                            }}>{a.status}</span>
                          </td>
                          <td>
                            <button
                              className="btn-edit"
                              onClick={() => setSelectedAdmission(a)}
                              style={{marginRight: '6px'}}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedAdmission && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.6)', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                  padding: '20px'
                }} onClick={() => { setSelectedAdmission(null); setShowApproveForm(false); setFeesAmount(''); }}>
                  <div style={{
                    background: 'white', borderRadius: '12px', padding: '30px',
                    maxWidth: '800px', width: '100%', maxHeight: '90vh',
                    overflowY: 'auto'
                  }} onClick={e => e.stopPropagation()}>

                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                      <h2 style={{color:'#8B1A1A'}}>📝 Application Details</h2>
                      <button onClick={() => { setSelectedAdmission(null); setShowApproveForm(false); setFeesAmount(''); }} style={{
                        background:'#eee', border:'none', borderRadius:'50%',
                        width:'36px', height:'36px', cursor:'pointer', fontSize:'18px'
                      }}>✕</button>
                    </div>

                    <h3 style={{color:'#1565C0', marginBottom:'12px'}}>👤 Personal Information</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>Name:</strong> {selectedAdmission.applicantName}</p>
                      <p><strong>Email:</strong> {selectedAdmission.email}</p>
                      <p><strong>Phone:</strong> {selectedAdmission.phone}</p>
                      <p><strong>DOB:</strong> {selectedAdmission.dateOfBirth ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString() : '-'}</p>
                    </div>

                    {showApproveForm && (
                      <div style={{
                        background: '#fef3c7', padding: '20px', borderRadius: '10px',
                        marginBottom: '20px', border: '2px solid #fbbf24'
                      }}>
                        <h3 style={{color:'#92400e', marginBottom:'14px'}}>💰 Set Fees Amount</h3>
                        <form onSubmit={submitApproval}>
                          <div className="form-group">
                            <label>Course Fees (₹) *</label>
                            <input
                              type="number"
                              placeholder="Enter fees"
                              value={feesAmount}
                              onChange={e => setFeesAmount(e.target.value)}
                              min="1"
                              required
                            />
                          </div>
                          <div style={{display:'flex', gap:'10px', marginTop:'14px'}}>
                            <button type="submit" className="btn btn-primary" style={{background:'#28a745'}}>
                              ✅ Confirm Approval
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => { setShowApproveForm(false); setFeesAmount(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div style={{display:'flex', gap:'10px', flexWrap:'wrap', borderTop:'2px solid #eee', paddingTop:'20px'}}>
                      {!showApproveForm && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{background:'#28a745'}}
                            onClick={handleApproveClick}
                          >✅ Approve & Set Fees</button>
                          <button
                            className="btn btn-primary"
                            style={{background:'#dc3545'}}
                            onClick={() => updateAdmissionStatus(selectedAdmission._id, 'rejected')}
                          >❌ Reject</button>
                          <button
                            className="btn btn-primary"
                            style={{ background: selectedAdmission?.feesPaid ? '#dc3545' : '#28a745' }}
                            onClick={() => toggleFeesPaid(selectedAdmission)}
                          >
                            {selectedAdmission?.feesPaid ? '💸 Mark Unpaid' : '💰 Mark Fees Paid'}
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deleteAdmission(selectedAdmission._id)}
                          >🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
