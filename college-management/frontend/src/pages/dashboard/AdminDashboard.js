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

const [staffForm, setStaffForm] = useState({
  employeeId: '',
  department: '',
  designation: '',
  role: 'student-section'
});

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
    API.get('/staff')
  .then(res => setStaff(res.data.staff || []))
  .catch(() => {});
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

  try {
    await API.post('/staff', staffForm);

    showMessage('Staff created successfully!');

    setStaffForm({
      employeeId: '',
      department: '',
      designation: '',
      role: 'student-section'
    });

    API.get('/staff')
      .then(res => setStaff(res.data.staff || []));

  } catch (err) {
    showMessage(
      'Failed: ' +
      (err.response?.data?.message || 'Error')
    );
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
  // ====== END GALLERY FUNCTIONS ======

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
    { id: 'staff', label: '👨‍💼 Staff' },
    { id: 'gallery', label: '🖼️ Gallery' },
    { id: 'notices', label: '📢 Notices' },
    { id: 'events', label: '🗓️ Events' },
    { id: 'contacts', label: '📬 Messages' },
  ];

  // ===== ADMISSION HANDLERS =====
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
    // Pre-fill with course fees if available
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
        // refresh selected admission
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

          {/* ============ GALLERY TAB ============ */}
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

          {/* ============ END GALLERY TAB ============ */}
          {activeTab === 'staff' && (
  <div>

    <div className="form-card">
      <h3>Create Staff</h3>

      <form onSubmit={handleStaffSubmit}>

        <div className="form-row-dash">

          <div className="form-group">
            <label>Employee ID</label>

            <input
              type="text"
              placeholder="EMP101"
              value={staffForm.employeeId}
              onChange={(e) =>
                setStaffForm({
                  ...staffForm,
                  employeeId: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>

            <input
              type="text"
              placeholder="Administration"
              value={staffForm.department}
              onChange={(e) =>
                setStaffForm({
                  ...staffForm,
                  department: e.target.value
                })
              }
              required
            />
          </div>

        </div>

        <div className="form-row-dash">

          <div className="form-group">
            <label>Designation</label>

            <input
              type="text"
              placeholder="Officer"
              value={staffForm.designation}
              onChange={(e) =>
                setStaffForm({
                  ...staffForm,
                  designation: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              value={staffForm.role}
              onChange={(e) =>
                setStaffForm({
                  ...staffForm,
                  role: e.target.value
                })
              }
            >
              <option value="student-section">
                Student Section
              </option>

              <option value="accounts">
                Accounts
              </option>

              <option value="exam">
                Examination
              </option>

              <option value="scholarship">
                Scholarship
              </option>

              <option value="principal">
                Principal
              </option>
            </select>
          </div>

        </div>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Create Staff
        </button>

      </form>
    </div>

    <h3 style={{ margin: '30px 0 16px' }}>
      Staff Members ({staff.length})
    </h3>

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
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((s) => (
              <tr key={s._id}>
                <td>{s.employeeId}</td>
                <td>{s.department}</td>
                <td>{s.designation}</td>
                <td>{s.role}</td>
              </tr>
            ))}
          </tbody>

        </table>
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

          {/* ============ ADMISSIONS TAB ============ */}
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

              {/* MODAL — Application Details */}
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

                    {selectedAdmission.studentPhoto && (
                      <div style={{textAlign:'center', marginBottom:'20px'}}>
                        <img
                          src={`http://localhost:5000/uploads/${selectedAdmission.studentPhoto}`}
                          alt="Student"
                          style={{width:'120px', height:'120px', borderRadius:'50%', objectFit:'cover', border:'4px solid #8B1A1A'}}
                        />
                      </div>
                    )}

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>👤 Personal Information</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>Name:</strong> {selectedAdmission.applicantName}</p>
                      <p><strong>Email:</strong> {selectedAdmission.email}</p>
                      <p><strong>Phone:</strong> {selectedAdmission.phone}</p>
                      <p><strong>DOB:</strong> {selectedAdmission.dateOfBirth ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString() : '-'}</p>
                      <p><strong>Gender:</strong> {selectedAdmission.gender || '-'}</p>
                      <p><strong>Category:</strong> {selectedAdmission.category || '-'}</p>
                    </div>
                    <p style={{marginBottom:'20px'}}><strong>Address:</strong> {selectedAdmission.address || '-'}</p>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>🪪 Aadhar</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>Aadhar No:</strong> {selectedAdmission.aadharNumber || '-'}</p>
                      <p><strong>Name on Aadhar:</strong> {selectedAdmission.aadharName || '-'}</p>
                    </div>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>📚 SSC Details</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>School:</strong> {selectedAdmission.sscSchoolName || '-'}</p>
                      <p><strong>Board:</strong> {selectedAdmission.sscBoard || '-'}</p>
                      <p><strong>Year:</strong> {selectedAdmission.sscYOP || '-'}</p>
                      <p><strong>Percentage:</strong> {selectedAdmission.sscPercentage || '-'}%</p>
                    </div>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>📚 HSC Details</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>College:</strong> {selectedAdmission.hscCollegeName || '-'}</p>
                      <p><strong>Board:</strong> {selectedAdmission.hscBoard || '-'}</p>
                      <p><strong>Stream:</strong> {selectedAdmission.hscStream || '-'}</p>
                      <p><strong>Year:</strong> {selectedAdmission.hscYOP || '-'}</p>
                      <p><strong>Percentage:</strong> {selectedAdmission.hscPercentage || '-'}%</p>
                    </div>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>🎓 Course Selection</h3>
                    <p style={{marginBottom:'20px'}}><strong>Course:</strong> {selectedAdmission.course?.name || '-'} ({selectedAdmission.course?.type || ''})</p>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>👨‍👩‍👧 Family</h3>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                      <p><strong>Father:</strong> {selectedAdmission.fatherName || '-'}</p>
                      <p><strong>Mother:</strong> {selectedAdmission.motherName || '-'}</p>
                      <p><strong>Guardian Phone:</strong> {selectedAdmission.guardianPhone || '-'}</p>
                      <p><strong>Family Income:</strong> {selectedAdmission.familyIncome || '-'}</p>
                    </div>

                    <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>📎 Documents</h3>
                    <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'24px'}}>
                      {selectedAdmission.aadharPhoto && <a href={`http://localhost:5000/uploads/${selectedAdmission.aadharPhoto}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 14px'}}>🪪 Aadhar</a>}
                      {selectedAdmission.sscMarksheet && <a href={`http://localhost:5000/uploads/${selectedAdmission.sscMarksheet}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 14px'}}>📄 SSC Marksheet</a>}
                      {selectedAdmission.hscMarksheet && <a href={`http://localhost:5000/uploads/${selectedAdmission.hscMarksheet}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 14px'}}>📄 HSC Marksheet</a>}
                      {selectedAdmission.casteCertificate && <a href={`http://localhost:5000/uploads/${selectedAdmission.casteCertificate}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 14px'}}>📄 Caste Certificate</a>}
                      {selectedAdmission.gapCertificate && <a href={`http://localhost:5000/uploads/${selectedAdmission.gapCertificate}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 14px'}}>📄 Gap Certificate</a>}
                    </div>

                    {/* ===== FEES SECTION (shown only for approved students) ===== */}
                    {selectedAdmission.status === 'approved' && (
                      <>
                        <h3 style={{color:'#1565C0', marginBottom:'12px', borderBottom:'2px solid #e0e7ff', paddingBottom:'8px'}}>💰 Fees Details</h3>
                        <div style={{
                          background: '#f0f9ff', padding: '20px', borderRadius: '10px',
                          marginBottom: '20px', border: '2px solid #bae6fd'
                        }}>
                          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
                            <p><strong>💵 Total Fees:</strong> ₹{selectedAdmission.fees || 0}</p>
                            <p><strong>📌 Payment Status:</strong>
                              <span style={{
                                marginLeft:'8px', padding:'4px 12px', borderRadius:'20px', fontSize:'13px',
                                background: selectedAdmission.feesPaid ? '#d4edda' : '#fff3cd',
                                color: selectedAdmission.feesPaid ? '#155724' : '#856404'
                              }}>
                                {selectedAdmission.feesPaid ? '✅ Paid' : '⏳ Unpaid'}
                              </span>
                            </p>
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{
                              background: selectedAdmission.feesPaid ? '#dc3545' : '#28a745',
                              fontSize: '14px'
                            }}
                            onClick={() => toggleFeesPaid(selectedAdmission)}
                          >
                            {selectedAdmission.feesPaid ? '↩️ Mark as Unpaid' : '✅ Mark as Paid'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* ===== APPROVE WITH FEES FORM ===== */}
                    {showApproveForm && (
                      <div style={{
                        background: '#fef3c7', padding: '20px', borderRadius: '10px',
                        marginBottom: '20px', border: '2px solid #fbbf24'
                      }}>
                        <h3 style={{color:'#92400e', marginBottom:'14px'}}>💰 Set Fees Amount to Approve</h3>
                        <form onSubmit={submitApproval}>
                          <div className="form-group">
                            <label style={{fontWeight:'600'}}>Course Fees (₹) *</label>
                            <input
                              type="number"
                              placeholder="Enter total fees amount (e.g. 15000)"
                              value={feesAmount}
                              onChange={e => setFeesAmount(e.target.value)}
                              min="1"
                              required
                              autoFocus
                              style={{
                                width:'100%', padding:'12px', fontSize:'16px',
                                borderRadius:'8px', border:'1.5px solid #d97706'
                              }}
                            />
                            <small style={{color:'#92400e', marginTop:'6px', display:'block'}}>
                              💡 The student will see this fee on their dashboard after approval
                            </small>
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
                            style={{background:'#ffc107', color:'#333'}}
                            onClick={() => updateAdmissionStatus(selectedAdmission._id, 'pending')}
                          >⏳ Mark Pending</button>
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
          {/* ============ END ADMISSIONS TAB ============ */}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
