import React from 'react';

const API_BASE = 'https://college-management-nnve.onrender.com';
const docUrl = (f) => (f||'').startsWith('http') ? f : `${API_BASE}/uploads/${f}`;
const getValidPeriod = () => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; };
const getCourseFull = (ct) => { const c=(ct||'').toLowerCase(); if(c.includes('b.sc')||c.includes('bsc')||c.includes('science')) return 'Bachelor of Science (B.Sc.)'; if(c.includes('b.a')||c.includes('ba')||c.includes('arts')) return 'Bachelor of Arts (B.A.)'; return ct||'—'; };

export const printIDCard = (admission) => {
  const logo = "data:image/jpeg;base64,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";
  const validYear = new Date().getFullYear();
  const dobStr = admission.dateOfBirth ? new Date(admission.dateOfBirth).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) : '--';
  const courseFull = getCourseFull(admission.courseType);

  const html = `<!DOCTYPE html><html><head><title>ID Card</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:#fff;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:flex-start;padding:10px}
    /* Horizontal (landscape) ID card */
    .card{width:340px;height:214px;background:#fff;border:1.5px solid #1a237e;border-radius:6px;overflow:hidden;display:flex;flex-direction:column}
    .hdr{display:flex;align-items:center;gap:8px;padding:5px 8px;border-bottom:2px solid #1a237e;background:#fff}
    .logo{width:42px;height:42px;object-fit:contain;border-radius:50%;border:1.5px solid #1a237e;flex-shrink:0}
    .htxt{flex:1;text-align:center;line-height:1.18}
    .sanstha{font-size:5.5px;color:#555;font-style:italic}
    .college{font-size:10px;font-weight:900;color:#1a237e}
    .affil{font-size:5.5px;color:#666}
    .addr{font-size:5.5px;color:#444}
    .titlebar{background:#1a237e;color:#FDD835;padding:2px 0;text-align:center}
    .titletext{font-size:7px;font-weight:700;letter-spacing:3px}
    .body{flex:1;display:flex;gap:9px;padding:6px 9px;background:#f5f7ff}
    .photowrap{width:72px;flex-shrink:0;display:flex;flex-direction:column;align-items:center}
    .photobox{width:64px;height:76px;border:1.5px solid #1a237e;overflow:hidden;background:#c5cae9;display:flex;align-items:center;justify-content:center;border-radius:3px}
    .photobox img{width:100%;height:100%;object-fit:cover}
    .stuname{font-size:9px;font-weight:800;color:#1a237e;text-align:center;margin-top:3px;line-height:1.15;text-transform:capitalize}
    .bodyright{flex:1;display:flex;flex-direction:column}
    .row{display:flex;align-items:baseline;padding:1.5px 0}
    .lbl{font-size:8px;font-weight:700;color:#444;width:64px;flex-shrink:0}
    .val{font-size:8px;font-weight:700;color:#1a237e;flex:1}
    .chip{background:#1a237e;color:#FDD835;text-align:center;padding:2px 0;font-size:10px;font-weight:800;letter-spacing:1px;margin-top:4px;border-radius:3px}
    .sig{display:flex;justify-content:space-between;padding:3px 12px 2px;background:#fff}
    .sigbox{text-align:center}
    .sigline{width:62px;border-top:1px solid #333;margin-bottom:1px}
    .siglabel{font-size:6px;color:#333}
    .foot{background:#1a237e;color:#fff;text-align:center;font-size:6px;font-weight:700;padding:2.5px 6px;line-height:1.4}
    @media print{@page{size:92mm 58mm landscape;margin:0}.card{border-radius:0;width:92mm;height:58mm}}
  </style></head><body>
  <div class="card">
    <div class="hdr">
      <img src="${logo}" class="logo"/>
      <div class="htxt">
        <div class="sanstha">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="college">Late Kalpana Chawla Women's Senior College</div>
        <div class="affil">Affiliated to SNDT Women's University, Mumbai</div>
        <div class="addr">Lecture Colony, Gangakhed, Dist. Parbhani – 431514</div>
      </div>
    </div>
    <div class="titlebar"><span class="titletext">S T U D E N T &nbsp; I D E N T I T Y &nbsp; C A R D</span></div>
    <div class="body">
      <div class="photowrap">
        <div class="photobox">
          ${admission.studentPhoto ? `<img src="${docUrl(admission.studentPhoto)}" alt="photo"/>` : '<div style="font-size:30px">👩</div>'}
        </div>
        <div class="stuname">${admission.applicantName||'--'}</div>
      </div>
      <div class="bodyright">
        <div class="row"><span class="lbl">Course</span><span class="val">${courseFull}</span></div>
        <div class="row"><span class="lbl">Year</span><span class="val">${admission.admissionYear||'--'}</span></div>
        <div class="row"><span class="lbl">Date of Birth</span><span class="val">${dobStr}</span></div>
        <div class="row"><span class="lbl">Mobile No.</span><span class="val">${admission.phone||'--'}</span></div>
        <div class="row"><span class="lbl">Blood Group</span><span class="val">${admission.bloodGroup||'--'}</span></div>
        <div class="row"><span class="lbl">Valid</span><span class="val">${validYear} – ${validYear+1}</span></div>
        <div class="chip">${admission.studentId||'ID PENDING'}</div>
      </div>
    </div>
    <div class="sig">
      <div class="sigbox"><div class="sigline"></div><div class="siglabel">Student Signature</div></div>
      <div class="sigbox"><div class="sigline"></div><div class="siglabel">Principal</div></div>
    </div>
    <div class="foot">📞 +91 9307162914 &nbsp;|&nbsp; ✉️ lkcwscgkd@gmail.com &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com</div>
  </div>
  <scri${'pt'}>
  window.onload = () => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => {
      html2canvas(document.querySelector('.card'), {scale:3, useCORS:true, allowTaint:true, backgroundColor:'#ffffff'}).then(canvas => {
        const a = document.createElement('a');
        a.download = 'IDCard_${(admission.applicantName||"student").replace(/\s+/g,"_")}.jpg';
        a.href = canvas.toDataURL('image/jpeg', 0.96);
        a.click();
        setTimeout(()=>window.close(), 800);
      });
    };
    document.head.appendChild(s);
  };
  </scri${'pt'}></body></html>`;

  const w = window.open('','_blank','width=420,height=320');
  w.document.write(html); w.document.close();
};

const IDCard = ({ admission }) => {
  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <button onClick={() => printIDCard(admission)}
        style={{ background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        🪪 Download ID Card (JPG)
      </button>
    </div>
  );
};

export default IDCard;
