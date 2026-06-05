import React, { useRef } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────────
const API_BASE = 'https://college-management-nnve.onrender.com';

const docUrl = (f) =>
  (f || '').startsWith('http') ? f : `${API_BASE}/uploads/${f}`;

const getCourseFull = (ct = '') => {
  const c = ct.toLowerCase();
  if (c.includes('b.sc') || c.includes('bsc') || c.includes('science'))
    return 'Bachelor of Science (B.Sc.)';
  if (c.includes('b.a') || c.includes('ba') || c.includes('arts'))
    return 'Bachelor of Arts (B.A.)';
  if (c.includes('b.com') || c.includes('bcom') || c.includes('commerce'))
    return 'Bachelor of Commerce (B.Com.)';
  return ct || '—';
};

// Compute valid period: current academic year → next year
const getValidPeriod = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const startYear = m >= 6 ? y : y - 1;
  return `${startYear} \u2013 ${startYear + 1}`;
};

// ── Print function (opens a new window with the card ready to print) ────────
export const printIDCard = (admission) => {
  const photoSrc = admission.studentPhoto ? docUrl(admission.studentPhoto) : null;
  const course   = getCourseFull(admission.courseType);
  const year     = admission.admissionYear || '\u2014';
  const dob      = admission.dateOfBirth
    ? new Date(admission.dateOfBirth).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '/')
    : '\u2014';
  const mobile    = admission.phone      || '\u2014\u2014';
  const bloodGrp  = admission.bloodGroup || '\u2014\u2014';
  const studentId = admission.studentId  || '\u2014';
  const validPeriod = getValidPeriod();
  const name = (admission.applicantName || '').toLowerCase();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>ID Card – ${admission.applicantName || 'Student'}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
    }
    .card {
      width: 85mm;
      border: 1px solid #ccc;
      background: #fff;
      font-size: 11px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }

    /* ── College Header ── */
    .header {
      background: #fff;
      padding: 12px 14px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
    .logo-circle {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      border: 2px solid #1a237e;
      overflow: hidden;
      margin-bottom: 6px;
      flex-shrink: 0;
    }
    .logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .trust-name {
      font-size: 8px;
      color: #555;
      font-style: italic;
      margin-bottom: 2px;
    }
    .college-name {
      font-size: 12.5px;
      font-weight: 900;
      color: #1a237e;
      line-height: 1.3;
      margin-bottom: 2px;
    }
    .college-addr {
      font-size: 8px;
      color: #444;
      line-height: 1.4;
    }
    .affiliation {
      font-size: 7.5px;
      color: #666;
      margin-top: 1px;
    }

    /* ── Blue Banner ── */
    .banner {
      background: #1a237e;
      color: #FDD835;
      text-align: center;
      padding: 7px 0;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
    }

    /* ── Body ── */
    .body {
      background: #f0f4ff;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .photo-frame {
      width: 70px;
      height: 80px;
      border: 2px solid #1a237e;
      border-radius: 4px;
      overflow: hidden;
      background: #c5cae9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      font-size: 32px;
      color: #555;
    }
    .student-name {
      font-size: 14px;
      font-weight: 900;
      color: #1a237e;
      text-align: center;
      margin-bottom: 10px;
      text-transform: lowercase;
    }
    /* Details table */
    .details {
      width: 100%;
      border-collapse: collapse;
    }
    .details tr {
      border-bottom: 1px dashed #bbb;
    }
    .details tr:last-child {
      border-bottom: none;
    }
    .details td {
      padding: 4px 2px;
      vertical-align: middle;
    }
    .details .lbl {
      font-weight: 600;
      color: #333;
      width: 70px;
      font-size: 10px;
    }
    .details .sep {
      width: 12px;
      color: #333;
      font-size: 10px;
    }
    .details .val {
      font-weight: 700;
      color: #1a237e;
      font-size: 10.5px;
    }

    /* ── Student ID bar ── */
    .id-bar {
      background: #1a237e;
      color: #FDD835;
      text-align: center;
      padding: 7px 0;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 2px;
      font-family: 'Courier New', monospace;
    }

    /* ── Signature strip ── */
    .sig-strip {
      background: #fff;
      padding: 14px 20px 6px;
      display: flex;
      justify-content: space-between;
    }
    .sig-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 34%;
    }
    .sig-line {
      border-top: 1px solid #333;
      width: 100%;
      margin-bottom: 3px;
    }
    .sig-label {
      font-size: 8px;
      font-weight: 700;
      color: #333;
    }

    /* ── Footer ── */
    .footer {
      background: #1a237e;
      color: #fff;
      padding: 8px 10px;
      font-size: 7.5px;
      line-height: 1.7;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
    }
    .footer-center {
      text-align: center;
      margin-top: 2px;
    }

    @media print {
      body { padding: 0; }
      .card { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="card">

    <!-- Header -->
    <div class="header">
      <div class="logo-circle">
        <img src="/college-logo.png" onerror="this.style.display='none'" alt="Logo"/>
      </div>
      <div class="trust-name">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
      <div class="college-name">Late Kalpana Chawla Women's Senior College</div>
      <div class="affiliation">Affiliated to S.N.D.T. Women's University, Mumbai</div>
      <div class="college-addr">Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra &ndash; 431514</div>
    </div>

    <!-- Banner -->
    <div class="banner">S T U D E N T &nbsp; I D E N T I T Y &nbsp; C A R D</div>

    <!-- Body -->
    <div class="body">
      <!-- Photo -->
      <div class="photo-frame">
        ${photoSrc
          ? `<img src="${photoSrc}" alt="Student Photo" />`
          : `<span class="photo-placeholder">&#128105;</span>`}
      </div>

      <!-- Name -->
      <div class="student-name">${name}</div>

      <!-- Details -->
      <table class="details">
        <tr>
          <td class="lbl">Course</td>
          <td class="sep"></td>
          <td class="val">${course}</td>
        </tr>
        <tr>
          <td class="lbl">Year</td>
          <td class="sep"></td>
          <td class="val">${year}</td>
        </tr>
        <tr>
          <td class="lbl">Date of Birth</td>
          <td class="sep"></td>
          <td class="val">${dob}</td>
        </tr>
        <tr>
          <td class="lbl">Mobile No.</td>
          <td class="sep"></td>
          <td class="val">${mobile}</td>
        </tr>
        <tr>
          <td class="lbl">Blood Group</td>
          <td class="sep"></td>
          <td class="val">${bloodGrp}</td>
        </tr>
        <tr>
          <td class="lbl">Valid</td>
          <td class="sep"></td>
          <td class="val">${validPeriod}</td>
        </tr>
      </table>
    </div>

    <!-- Student ID bar -->
    <div class="id-bar">${studentId}</div>

    <!-- Signature strip -->
    <div class="sig-strip">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Student Signature</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Principal</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-row">
        <span>+91 9307162914</span>
        <span>lkcwsc@vnssorg.com</span>
      </div>
      <div class="footer-row">
        <span>lkcwsc.vnssorg.com</span>
      </div>
      <div class="footer-center">
        Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra &ndash; 431514
      </div>
    </div>

  </div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=420,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

// ── React Preview Component ─────────────────────────────────────────────────
// Use this inline in your dashboard to show the card before printing.
// Props: admission (object from your API)
const IDCard = ({ admission }) => {
  const printRef = useRef();
  if (!admission) return null;

  const photoSrc  = admission.studentPhoto ? docUrl(admission.studentPhoto) : null;
  const course    = getCourseFull(admission.courseType);
  const year      = admission.admissionYear || '—';
  const dob       = admission.dateOfBirth
    ? new Date(admission.dateOfBirth).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : '—';
  const mobile    = admission.phone      || '--';
  const bloodGrp  = admission.bloodGroup || '--';
  const studentId = admission.studentId  || '—';
  const validPeriod = getValidPeriod();
  const name = (admission.applicantName || '').toLowerCase();

  const card = {
    width: 321,        // 85mm @ 96dpi
    fontFamily: 'Arial, Helvetica, sans-serif',
    border: '1px solid #ccc',
    background: '#fff',
    fontSize: 11,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    borderRadius: 2,
  };

  const row = (label, value) => (
    <tr key={label} style={{ borderBottom: '1px dashed #bbb' }}>
      <td style={{ padding: '4px 2px', width: 72, fontWeight: 600, color: '#333', fontSize: 10 }}>{label}</td>
      <td style={{ padding: '4px 2px', width: 12, fontSize: 10 }}></td>
      <td style={{ padding: '4px 2px', fontWeight: 700, color: '#1a237e', fontSize: 10.5 }}>{value}</td>
    </tr>
  );

  return (
    <div>
      {/* Print button */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <button
          onClick={() => printIDCard(admission)}
          style={{
            background: '#1a237e', color: '#FDD835', border: 'none',
            padding: '8px 22px', borderRadius: 6, fontWeight: 700,
            fontSize: 13, cursor: 'pointer', letterSpacing: 0.5,
          }}
        >
          🖨️ Print ID Card
        </button>
      </div>

      {/* Preview */}
      <div ref={printRef} style={card}>

        {/* Header */}
        <div style={{
          background: '#fff', padding: '12px 14px 8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', borderBottom: '1px solid #ddd',
        }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            border: '2px solid #1a237e', overflow: 'hidden',
            background: '#e8eaf6', marginBottom: 6, flexShrink: 0,
          }}>
            <img
              src="/college-logo.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ fontSize: 8, color: '#555', marginBottom: 2 }}>
            Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: '#1a237e', lineHeight: 1.3, marginBottom: 2 }}>
            Late Kalpana Chawla Women's Senior College
          </div>
          <div style={{ fontSize: 7.5, color: '#666', marginTop: 1 }}>
            Affiliated to S.N.D.T. Women's University, Mumbai
          </div>
          <div style={{ fontSize: 7, color: '#555', marginTop: 1 }}>
            Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra – 431514
          </div>
          <div style={{ fontSize: 7.5, color: '#444', marginTop: 1 }}>
            Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra – 431514
          </div>
        </div>

        {/* Banner */}
        <div style={{
          background: '#1a237e', color: '#FDD835', textAlign: 'center',
          padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: 3,
        }}>
          S T U D E N T &nbsp; I D E N T I T Y &nbsp; C A R D
        </div>

        {/* Body */}
        <div style={{
          background: '#f0f4ff', padding: '14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {/* Photo */}
          <div style={{
            width: 70, height: 80, border: '2px solid #1a237e',
            borderRadius: 4, overflow: 'hidden', background: '#c5cae9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            {photoSrc
              ? <img src={photoSrc} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 32 }}>👩</span>}
          </div>

          {/* Name */}
          <div style={{
            fontSize: 14, fontWeight: 900, color: '#1a237e',
            textAlign: 'center', marginBottom: 10, textTransform: 'lowercase',
          }}>
            {name}
          </div>

          {/* Details */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {row('Course',       course)}
              {row('Year',         year)}
              {row('Date of Birth', dob)}
              {row('Mobile No.',   mobile)}
              {row('Blood Group',  bloodGrp)}
              {row('Valid',        validPeriod)}
            </tbody>
          </table>
        </div>

        {/* ID bar */}
        <div style={{
          background: '#1a237e', color: '#FDD835', textAlign: 'center',
          padding: '7px 0', fontSize: 14, fontWeight: 900, letterSpacing: 2,
          fontFamily: "'Courier New', monospace",
        }}>
          {studentId}
        </div>

        {/* Signature strip */}
        <div style={{ background: '#fff', padding: '14px 20px 6px', display: 'flex', justifyContent: 'space-between' }}>
          {['Student Signature', 'Principal'].map(lbl => (
            <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '34%' }}>
              <div style={{ borderTop: '1px solid #333', width: '100%', marginBottom: 3 }} />
              <div style={{ fontSize: 8, fontWeight: 700, color: '#333' }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ background: '#1a237e', color: '#fff', padding: '8px 10px', fontSize: 7.5, lineHeight: 1.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>+91 9307162914</span>
            <span>lkcwsc@vnssorg.com</span>
          </div>
          <div><span>lkcwsc.vnssorg.com</span></div>
          <div style={{ textAlign: 'center', marginTop: 2 }}>
            Lecture Colony, Gangakhed, Dist. Parbhani, Maharashtra – 431514
          </div>
        </div>

      </div>
    </div>
  );
};

export default IDCard;
