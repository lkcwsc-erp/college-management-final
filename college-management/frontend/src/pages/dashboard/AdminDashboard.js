import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';
import AdminReports from '../../components/AdminReports';
import StudentViewFull from './StudentViewFull';

// ─── Admin Delete Requests Tab ───────────────────────────────────────────────
const AdminDeleteRequestsTab = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  const fetch = () => {
    setLoading(true);
    API.get('/admissions/pending-deletes')
      .then(res => setPending(res.data.pending || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/admissions/admin-delete/${id}`);
      setMsg(`✅ ${name} deleted.`);
      fetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/admissions/update-documents/${id}`, { deleteRequested: false, deleteReason: '', deleteRequestedBy: '', deleteRequestedAt: null });
      setMsg('✅ Delete request rejected.');
      fetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('❌ Failed'); }
  };

  return (
    <div>
      <h2 style={{ color: '#C62828', marginBottom: 4 }}>🗑️ Delete Requests</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Student Section staff has requested deletion of these records. Review and approve/reject.</p>
      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14, background: msg.startsWith('✅')?'#e8f5e9':'#ffebee', color: msg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight: 500 }}>{msg}</div>}
      {loading ? <div style={{textAlign:'center',padding:20,fontSize:'2rem'}}>⏳</div>
      : pending.length === 0 ? (
        <div style={{ background:'#f8faff', borderRadius:12, padding:30, textAlign:'center', color:'#888' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>✅</div>
          <p>No pending delete requests.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {pending.map((p,i) => (
            <div key={p._id||i} style={{ background:'#fff', borderRadius:12, border:'2px solid #ef9a9a', padding:18, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:10 }}>
                <div>
                  <h4 style={{ color:'#C62828', fontSize:15, margin:'0 0 4px' }}>{p.applicantName}</h4>
                  <p style={{ fontSize:12, color:'#555', margin:'0 0 2px' }}>{p.email} · ID: {p.studentId||'—'}</p>
                  <p style={{ fontSize:12, color:'#777', margin:'0 0 2px' }}><b>Reason:</b> {p.deleteReason||'Not specified'}</p>
                  <p style={{ fontSize:11, color:'#aaa', margin:0 }}>
                    Requested by: {p.deleteRequestedBy} · {p.deleteRequestedAt ? new Date(p.deleteRequestedAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleApprove(p._id, p.applicantName)}
                    style={{ background:'#C62828', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    ✅ Approve Delete
                  </button>
                  <button onClick={() => handleReject(p._id)}
                    style={{ background:'#e8f5e9', color:'#2E7D32', border:'1px solid #a5d6a7', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


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
  const [message, setMessage] = useState('');
  const [staff, setStaff] = useState([]);
  const [editStaff, setEditStaff] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [staffForm, setStaffForm] = useState({
    name: '', username: '', email: '', password: '', phone: '', role: 'staff_student'
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

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (staffForm.password.length < 6) { showMessage('Password must be at least 6 characters'); return; }
    try {
      await API.post('/auth/create-staff', staffForm);
      showMessage('✅ Staff created successfully!');
      setShowCredentials({ name: staffForm.name, username: staffForm.username, email: staffForm.email, password: staffForm.password, role: staffForm.role });
      setStaffForm({ name: '', username: '', email: '', password: '', phone: '', role: 'staff_student' });
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const deleteStaff = async (id) => {
    if (window.confirm('Delete this staff? They will not be able to login anymore.')) {
      try {
        await API.delete(`/auth/staff/${id}`);
        showMessage('Staff deleted successfully!');
        API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
      } catch (err) { showMessage('Failed to delete staff'); }
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/auth/staff/${editStaff._id}`, { name: editStaff.name, username: editStaff.username, email: editStaff.email, phone: editStaff.phone });
      showMessage('✅ Staff updated!');
      setEditStaff(null);
      API.get('/auth/staff').then(res => setStaff(res.data.staff || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setGalleryForm({ ...galleryForm, image: file }); setGalleryPreview(URL.createObjectURL(file)); }
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
        await API.put(`/gallery/${editGalleryId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('Image updated successfully!');
      } else {
        await API.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMessage('Image uploaded successfully!');
      }
      setGalleryForm({ title: '', description: '', category: 'campus', image: null });
      setEditGalleryId(null); setGalleryPreview(null);
      API.get('/gallery').then(res => setGallery(res.data.gallery || []));
    } catch (err) { showMessage('Failed: ' + (err.response?.data?.message || 'Error')); }
  };

  const handleEditGallery = (item) => {
    setEditGalleryId(item._id);
    setGalleryForm({ title: item.title, description: item.description || '', category: item.category, image: null });
    setGalleryPreview(`http://localhost:5000/uploads/${item.image}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setEditGalleryId(null); setGalleryForm({ title: '', description: '', category: 'campus', image: null }); setGalleryPreview(null); };

  const deleteCourse  = async (id) => { if (window.confirm('Delete this course?'))  { await API.delete(`/courses/${id}`);  API.get('/courses').then(res => setCourses(res.data.courses || [])); } };
  const deleteFaculty = async (id) => { if (window.confirm('Delete this faculty?')) { await API.delete(`/faculty/${id}`);  API.get('/faculty').then(res => setFaculty(res.data.faculty || [])); } };
  const deleteNotice  = async (id) => { if (window.confirm('Delete this notice?'))  { await API.delete(`/notices/${id}`);  API.get('/notices').then(res => setNotices(res.data.notices || [])); } };
  const deleteGallery = async (id) => { if (window.confirm('Delete this image?'))   { await API.delete(`/gallery/${id}`);  showMessage('Image deleted!'); API.get('/gallery').then(res => setGallery(res.data.gallery || [])); } };

  const tabs = [
    { id: 'home',     label: '🏠 Dashboard' },
    { id: 'students', label: '👩‍🎓 Students' },
    { id: 'courses',  label: '📚 Courses' },
    { id: 'faculty',  label: '👩‍🏫 Faculty' },
    { id: 'staff',    label: '👨‍💼 Staff Login' },
    { id: 'gallery',  label: '🖼️ Gallery' },
    { id: 'notices',  label: '📢 Notices' },
    { id: 'events',   label: '🗓️ Events' },
    { id: 'contacts',  label: '📬 Messages' },
    { id: 'messaging',      label: '✉️ Send Message' },
    { id: 'delete_requests', label: '🗑️ Delete Requests' },
    { id: 'reports',   label: '📊 Reports' },
    { id: 'receipts',  label: '🧾 Payment Receipts' },
  ];

  const roleLabel = (role) => ({
    staff_principal:  '👨‍🏫 Principal',
    staff_student:    '👩‍🎓 Student Section',
    staff_accounts:   '💰 Accounts',
    staff_exam:       '📝 Examination',
    staff_scholarship:'🎓 Scholarship',
  }[role] || role);

  const roleColors = {
    staff_principal:   { bg: '#fee2e2', color: '#991b1b' },
    staff_student:     { bg: '#dbeafe', color: '#1e40af' },
    staff_accounts:    { bg: '#dcfce7', color: '#15803d' },
    staff_exam:        { bg: '#fef3c7', color: '#92400e' },
    staff_scholarship: { bg: '#f3e8ff', color: '#7e22ce' },
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

          {/* ══ HOME ══ */}
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

          {/* ══ STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <h2 style={{ color: '#1565C0', marginBottom: 4 }}>👩‍🎓 All Students</h2>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Admin has read-only access. Edit and Delete is restricted to Student Section Staff and Principal.</p>
              <StudentViewFull canEdit={false} themeColor="#1565C0" role="readonly" />
            </div>
          )}

          {/* ══ COURSES ══ */}
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
                        <option value="BA">BA</option><option value="BSc">BSc</option>
                        <option value="BCom">BCom</option><option value="Other">Other</option>
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

          {/* ══ FACULTY ══ */}
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

          {/* ══ STAFF LOGIN ══ */}
          {activeTab === 'staff' && (
            <div>
              {showCredentials && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,padding:'20px'}} onClick={() => setShowCredentials(null)}>
                  <div style={{background:'white',borderRadius:'12px',padding:'30px',maxWidth:'500px',width:'100%'}} onClick={e => e.stopPropagation()}>
                    <div style={{textAlign:'center',marginBottom:'20px'}}>
                      <div style={{fontSize:'48px'}}>✅</div>
                      <h2 style={{color:'#28a745',margin:'10px 0'}}>Staff Created!</h2>
                      <p style={{color:'#666'}}>Share these credentials with the staff member</p>
                    </div>
                    <div style={{background:'#f0f9ff',padding:'20px',borderRadius:'8px',border:'2px solid #bae6fd',marginBottom:'20px'}}>
                      <p style={{margin:'8px 0'}}><strong>👤 Name:</strong> {showCredentials.name}</p>
                      <p style={{margin:'8px 0'}}><strong>🪪 Username:</strong> {showCredentials.username}</p>
                      <p style={{margin:'8px 0'}}><strong>📧 Email:</strong> {showCredentials.email}</p>
                      <p style={{margin:'8px 0'}}><strong>🔑 Password:</strong> <code style={{background:'white',padding:'4px 10px',borderRadius:'4px',fontFamily:'monospace'}}>{showCredentials.password}</code></p>
                      <p style={{margin:'8px 0'}}><strong>👔 Role:</strong> {roleLabel(showCredentials.role)}</p>
                    </div>
                    <div style={{background:'#fff3cd',padding:'12px',borderRadius:'8px',fontSize:'13px',color:'#856404',marginBottom:'16px'}}>
                      ⚠️ Save these credentials! Password cannot be viewed again after closing.
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCredentials(null)} style={{width:'100%'}}>Got It! Close</button>
                  </div>
                </div>
              )}

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
                        <input type="text" value={editStaff.name} onChange={e => setEditStaff({...editStaff, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={editStaff.username || ''} onChange={e => setEditStaff({...editStaff, username: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={editStaff.email} onChange={e => setEditStaff({...editStaff, email: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={editStaff.phone || ''} maxLength="10"
                          onChange={e => { const v = e.target.value; if (/^\d{0,10}$/.test(v)) setEditStaff({...editStaff, phone: v}); }} />
                      </div>
                      <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                        <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditStaff(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="form-card">
                <h3>👥 Create Staff Login</h3>
                <p style={{color:'#666',fontSize:'14px',marginBottom:'20px'}}>Create login credentials for staff members. Choose their section role.</p>
                <form onSubmit={handleStaffSubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" placeholder="e.g. Rahul Sharma" value={staffForm.name}
                        onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Username *</label>
                      <input type="text" placeholder="e.g. rahul_sharma" value={staffForm.username}
                        onChange={e => setStaffForm({...staffForm, username: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" placeholder="staff@lkcwsc.edu.in" value={staffForm.email}
                        onChange={e => setStaffForm({...staffForm, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Password * (min 6 characters)</label>
                      <input type="text" placeholder="e.g. Staff@1234" value={staffForm.password}
                        onChange={e => setStaffForm({...staffForm, password: e.target.value})} minLength="6" required />
                    </div>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" placeholder="9876543210" value={staffForm.phone} maxLength="10"
                        onChange={e => { const v = e.target.value; if (/^\d{0,10}$/.test(v)) setStaffForm({...staffForm, phone: v}); }} />
                    </div>
                    <div className="form-group">
                      <label>Staff Section Role *</label>
                      <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} required>
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
                      <tr><th>Name</th><th>Username</th><th>Email & Password</th><th>Phone</th><th>Role</th><th>Created</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td><code style={{background:'#f1f5f9',padding:'2px 8px',borderRadius:'4px',fontSize:'13px'}}>{s.username || '-'}</code></td>
                          <td>
                            <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>📧 {s.email}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                              <code style={{background:'#f1f5f9',padding:'2px 10px',borderRadius:'4px',fontFamily:'monospace',fontSize:'13px',minWidth:'100px',letterSpacing: visiblePasswords[s._id] ? 'normal' : '3px'}}>
                                {visiblePasswords[s._id] ? (s.plainPassword || s.password || '(not stored)') : '••••••••'}
                              </code>
                              <button onClick={() => setVisiblePasswords(prev => ({...prev, [s._id]: !prev[s._id]}))}
                                style={{background:'none',border:'1px solid #ddd',borderRadius:'6px',cursor:'pointer',padding:'3px 7px',fontSize:'15px',lineHeight:1}}>
                                {visiblePasswords[s._id] ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </td>
                          <td>{s.phone || '-'}</td>
                          <td>
                            <span className="notice-tag" style={{ background: (roleColors[s.role] || {bg:'#e5e7eb'}).bg, color: (roleColors[s.role] || {color:'#374151'}).color }}>
                              {roleLabel(s.role)}
                            </span>
                          </td>
                          <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{display:'flex',gap:'6px'}}>
                              <button className="btn btn-primary" style={{padding:'5px 12px',fontSize:'13px',background:'#1565C0'}} onClick={() => setEditStaff({...s})}>✏️ Edit</button>
                              <button className="btn-delete" onClick={() => deleteStaff(s._id)}>🗑️ Delete</button>
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

          {/* ══ GALLERY ══ */}
          {activeTab === 'gallery' && (
            <div>
              <div className="form-card">
                <h3>{editGalleryId ? '✏️ Edit Image' : '➕ Add New Image'}</h3>
                <form onSubmit={handleGallerySubmit}>
                  <div className="form-row-dash">
                    <div className="form-group">
                      <label>Image Title *</label>
                      <input type="text" placeholder="Enter image title" value={galleryForm.title}
                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                        <option value="campus">Campus</option><option value="events">Events</option>
                        <option value="sports">Sports</option><option value="cultural">Cultural</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Tell us about this photo..." value={galleryForm.description}
                      onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}></textarea>
                  </div>
                  <div className="form-group">
                    <label>{editGalleryId ? 'Replace Image (optional)' : 'Upload Image *'}</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} required={!editGalleryId} />
                    {galleryPreview && (
                      <img src={galleryPreview} alt="Preview"
                        style={{width:'200px',height:'150px',objectFit:'cover',marginTop:'10px',borderRadius:'8px',border:'2px solid #ddd'}} />
                    )}
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button type="submit" className="btn btn-primary">{editGalleryId ? 'Update Image' : 'Upload Image'}</button>
                    {editGalleryId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
                  </div>
                </form>
              </div>
              <h3 style={{margin:'30px 0 16px'}}>All Gallery Images ({gallery.length})</h3>
              {gallery.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🖼️</div><h3>No Images Yet</h3><p>Upload your first image to get started.</p></div>
              ) : (
                <div className="events-grid">
                  {gallery.map(item => (
                    <div className="event-card" key={item._id}>
                      <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.title}
                        style={{width:'100%',height:'180px',objectFit:'cover',borderRadius:'8px',marginBottom:'12px'}} />
                      <span className="notice-tag">{item.category}</span>
                      <h4>{item.title}</h4>
                      <p style={{color:'#666',fontSize:'13px'}}>{item.description}</p>
                      <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                        <button className="btn btn-primary" style={{padding:'6px 14px',fontSize:'13px'}} onClick={() => handleEditGallery(item)}>✏️ Edit</button>
                        <button className="btn-delete" onClick={() => deleteGallery(item._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ NOTICES ══ */}
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
                        <option value="general">General</option><option value="exam">Exam</option>
                        <option value="admission">Admission</option><option value="event">Event</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Target</label>
                      <select value={noticeForm.targetAudience} onChange={e => setNoticeForm({...noticeForm, targetAudience: e.target.value})}>
                        <option value="all">All</option><option value="student">Students</option><option value="staff">Staff</option>
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
              <h3 style={{margin:'30px 0 16px'}}>All Notices ({notices.length})</h3>
              {notices.map(n => (
                <div className="notice-full-card" key={n._id}>
                  <div className="notice-full-header">
                    <h4>{n.title}</h4>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
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

          {/* ══ EVENTS ══ */}
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
                        <option value="academic">Academic</option><option value="cultural">Cultural</option>
                        <option value="sports">Sports</option><option value="other">Other</option>
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
              <h3 style={{margin:'30px 0 16px'}}>All Events ({events.length})</h3>
              <div className="events-grid">
                {events.map(ev => (
                  <div className="event-card" key={ev._id}>
                    <span className="notice-tag">{ev.category}</span>
                    <h4>{ev.title}</h4>
                    <p>📅 {new Date(ev.date).toLocaleDateString()}</p>
                    <p>📍 {ev.venue}</p>
                    <p style={{color:'#666',fontSize:'14px',marginTop:'8px'}}>{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CONTACTS ══ */}
          {activeTab === 'contacts' && (
            <div>
              <h3 style={{marginBottom:'20px'}}>Contact Messages ({contacts.length})</h3>
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
                      <span className={c.isRead ? 'notice-tag' : 'notice-tag unread'}>{c.isRead ? 'Read' : 'New'}</span>
                    </div>
                    <p>{c.message}</p>
                    <small>📧 {c.email} | 📞 {c.phone} | {new Date(c.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ MESSAGING ══ */}
          {activeTab === 'reports'   && <AdminReports themeColor="#1565C0" />}
          {activeTab === 'receipts'  && <PaymentReceiptsTab themeColor="#1565C0" />}
          {activeTab === 'messaging' && <AdminMessagingTab user={user} showMessage={showMessage} />}

          {/* Delete Requests */}
          {activeTab === 'delete_requests' && <AdminDeleteRequestsTab />}

        </div>
      </main>
    </div>
  );
};


// ─── Shared Payment Receipts Tab ─────────────────────────────────────────────
const PaymentReceiptsTab = ({ themeColor = "#1565C0" }) => {
  const [receipts, setReceipts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [errMsg, setErrMsg]         = useState("");

  const fetchReceipts = async () => {
    setLoading(true); setErrMsg("");
    try {
      const res = await API.get("/admissions/receipts/all");
      setReceipts(res.data.receipts || []);
    } catch (e) { setErrMsg("Failed to load: " + (e.response?.data?.message || "Error")); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const filtered = receipts.filter(r => {
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q) || r.studentId?.toLowerCase().includes(q) || r.receiptNo?.toLowerCase().includes(q);
    const mt = typeFilter === "all" || r.feeType === typeFilter;
    const now = new Date(); let md = true;
    if (dateFilter === "today") { const d = new Date(r.paidAt); md = d.toDateString() === now.toDateString(); }
    else if (dateFilter === "week") { const d = new Date(r.paidAt); md = (now - d) <= 7*24*60*60*1000; }
    else if (dateFilter === "month") { const d = new Date(r.paidAt); md = d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }
    return mq && mt && md;
  });

  const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const feeTypes = [...new Set(receipts.map(r => r.feeType).filter(Boolean))];

  return (
    <div>
      <h2 style={{ color: themeColor, marginBottom: 4 }}>🧾 Payment Receipts</h2>
      <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>All fee receipts collected by Accounts Section.</p>
      {errMsg && <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 14, background: "#ffebee", color: "#C62828" }}>{errMsg}</div>}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ background: "#e8f5e9", color: "#2E7D32", borderRadius: 14, padding: "14px 20px", fontWeight: 700, fontSize: 15 }}>💰 Total: ₹{totalAmount.toLocaleString("en-IN")}</div>
        <div style={{ background: "#e3f2fd", color: themeColor, borderRadius: 14, padding: "14px 20px", fontWeight: 700, fontSize: 15 }}>🧾 Count: {filtered.length}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 Name, ID, receipt no..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 9, border: "1px solid #ddd", fontSize: 14 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #ddd", fontSize: 13 }}>
          <option value="all">All Fee Types</option>
          {feeTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #ddd", fontSize: 13 }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button onClick={fetchReceipts} style={{ padding: "9px 14px", background: "#f0f4ff", color: themeColor, border: "1px solid #ddd", borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🔄</button>
      </div>
      {loading ? <div className="empty-state"><p style={{fontSize:"2rem"}}>⏳</p><h3>Loading...</h3></div>
      : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🧾</div><h3>No receipts found</h3></div>
      : (
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e0e7ef", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr", background: themeColor, padding: "12px 16px", gap: 8 }}>
            {["Receipt No","Student","Email","Fee Type","Amount","Mode","Date"].map(h => <span key={h} style={{color:"#fff",fontWeight:700,fontSize:12}}>{h}</span>)}
          </div>
          {filtered.map((r, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1.2fr 1fr 1fr 1fr", padding: "11px 16px", gap: 8, alignItems: "center", borderBottom: "1px solid #f0f4f8", background: idx%2===0?"#fafbff":"#fff" }}>
              <span style={{fontSize:11,fontFamily:"monospace",color:themeColor,fontWeight:700}}>{r.receiptNo||"—"}</span>
              <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{r.studentName}</p><p style={{fontSize:10,color:"#888",margin:0}}>{r.studentId||""} · {r.admissionYear||""}</p></div>
              <span style={{fontSize:11,color:"#555"}}>{r.studentEmail}</span>
              <span style={{fontSize:12}}>{r.feeTypeLabel||r.feeType||"—"}</span>
              <span style={{fontSize:13,fontWeight:700,color:"#2E7D32"}}>₹{(r.amount||0).toLocaleString("en-IN")}</span>
              <span style={{fontSize:11,background:r.paymentMode==="online"?"#e3f2fd":"#e8f5e9",color:r.paymentMode==="online"?"#1565C0":"#2E7D32",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{r.paymentMode==="online"?"🌐 Online":"💵 Cash"}</span>
              <span style={{fontSize:11,color:"#888"}}>{r.paidAt?new Date(r.paidAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"}):"—"}</span>
            </div>
          ))}
          <div style={{padding:"12px 16px",background:"#f8faff",borderTop:"2px solid #e0e7ef",display:"flex",justifyContent:"flex-end",gap:20}}>
            <span style={{fontSize:13,fontWeight:700,color:"#2E7D32"}}>Total: ₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Admin Messaging Component ─────────────────────────────────────────────────
const AdminMessagingTab = ({ user, showMessage }) => {
  const [admissions, setAdmissions] = React.useState([]);
  const [staff, setStaff]           = React.useState([]);
  const [loading, setLoading]       = React.useState(false);
  const [subject, setSubject]       = React.useState('');
  const [message, setMessage]       = React.useState('');
  const [target, setTarget]         = React.useState('all_students'); // all_students | all_staff | specific
  const [selected, setSelected]     = React.useState([]); // specific emails
  const [sending, setSending]       = React.useState(false);
  const [msg, setMsg]               = React.useState('');
  const [search, setSearch]         = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/admissions/staff-view/all').catch(() => ({ data: { admissions: [] } })),
      API.get('/auth/staff').catch(() => ({ data: { staff: [] } })),
    ]).then(([admRes, staffRes]) => {
      setAdmissions(admRes.data.admissions || []);
      setStaff(staffRes.data.staff || []);
    }).finally(() => setLoading(false));
  }, []);

  const getRecipients = () => {
    if (target === 'all_students') return admissions.map(a => ({ email: a.email, name: a.applicantName }));
    if (target === 'all_staff')    return staff.map(s => ({ email: s.email, name: s.name }));
    return selected.map(email => {
      const adm = admissions.find(a => a.email === email);
      const st  = staff.find(s => s.email === email);
      return { email, name: adm?.applicantName || st?.name || email };
    });
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) { setMsg('❌ Subject and message are required.'); return; }
    const recipients = getRecipients();
    if (recipients.length === 0) { setMsg('❌ No recipients selected.'); return; }
    if (!window.confirm(`Send message to ${recipients.length} recipient(s)?`)) return;

    setSending(true);
    try {
      const res = await API.post('/auth/send-message', { recipients, subject, message });
      setMsg(`✅ Sent to ${res.data.sent} recipient(s).${res.data.failed > 0 ? ` ${res.data.failed} failed.` : ''}`);
      setSubject(''); setMessage(''); setSelected([]);
      setTimeout(() => setMsg(''), 5000);
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to send')); }
    finally { setSending(false); }
  };

  const allPeople = [
    ...admissions.map(a => ({ email: a.email, name: a.applicantName, type: 'student', course: a.courseType, year: a.admissionYear })),
    ...staff.map(s => ({ email: s.email, name: s.name, type: 'staff', role: s.role })),
  ].filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()));

  const recipients = getRecipients();

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>✉️ Send Message</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Send email messages to students and staff directly from the portal.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left — compose */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 24 }}>
          <h4 style={{ color: '#1565C0', marginBottom: 16 }}>📝 Compose Message</h4>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Send To</label>
            <select value={target} onChange={e => { setTarget(e.target.value); setSelected([]); }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="all_students">👩‍🎓 All Students ({admissions.length})</option>
              <option value="all_staff">👨‍💼 All Staff ({staff.length})</option>
              <option value="specific">🎯 Specific People</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Subject *</label>
            <input type="text" placeholder="e.g. Exam Schedule Notice" value={subject} onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>Message *</label>
            <textarea rows="6" placeholder="Type your message here..." value={message} onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#1565C0' }}>
            📨 Will be sent to: <strong>{recipients.length} recipient(s)</strong>
            {target === 'all_students' && ` — All ${admissions.length} students`}
            {target === 'all_staff' && ` — All ${staff.length} staff members`}
          </div>

          <button onClick={handleSend} disabled={sending || !subject || !message || recipients.length === 0}
            style={{ width: '100%', background: sending ? '#aaa' : '#1565C0', color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: (!subject || !message || recipients.length === 0) ? 0.6 : 1 }}>
            {sending ? '⏳ Sending...' : `✉️ Send to ${recipients.length} Recipient(s)`}
          </button>
        </div>

        {/* Right — select specific */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 24 }}>
          <h4 style={{ color: '#1565C0', marginBottom: 14 }}>
            {target === 'specific' ? '🎯 Select Recipients' : '👥 Preview Recipients'}
          </h4>

          <input type="text" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          {loading ? <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>⏳ Loading...</div> : (
            <div style={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #f0f4f8', borderRadius: 8 }}>
              {allPeople.slice(0, 50).map((p, i) => {
                const isSelected = target === 'specific' ? selected.includes(p.email) :
                  (target === 'all_students' ? p.type === 'student' : p.type === 'staff');
                return (
                  <div key={i} onClick={() => {
                    if (target !== 'specific') return;
                    setSelected(prev => prev.includes(p.email) ? prev.filter(e => e !== p.email) : [...prev, p.email]);
                  }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid #f0f4f8', cursor: target === 'specific' ? 'pointer' : 'default', background: isSelected ? '#e8f5e9' : '#fff' }}>
                    <span style={{ fontSize: 14 }}>{isSelected ? '✅' : (target === 'specific' ? '⬜' : '•')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: '#1a1a2e' }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{p.email} · {p.type === 'student' ? `${p.course} ${p.year}` : p.role}</p>
                    </div>
                    <span style={{ fontSize: 10, background: p.type === 'student' ? '#e3f2fd' : '#e8f5e9', color: p.type === 'student' ? '#1565C0' : '#2E7D32', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
                      {p.type}
                    </span>
                  </div>
                );
              })}
              {allPeople.length > 50 && <div style={{ padding: '8px 12px', fontSize: 12, color: '#888', textAlign: 'center' }}>Showing 50 of {allPeople.length}. Search to filter.</div>}
            </div>
          )}

          {target === 'specific' && selected.length > 0 && (
            <div style={{ marginTop: 10, background: '#e8f5e9', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>
              ✅ {selected.length} recipient(s) selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
