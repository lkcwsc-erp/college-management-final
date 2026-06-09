import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import './Dashboard.css';

// Official fee structure 2025-26


// ── Print receipt for student ────────────────────────────────────────────────
const printStudentReceipt = (p, adm) => {
  const logo = window.location.origin + "/college-logo.png";
  const acadYear = (() => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; })();
  const dateStr = p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  const amt = p.amount || 0;
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const inW=(n)=>{if(n===0)return'';if(n<20)return a[n]+' ';if(n<100)return b[Math.floor(n/10)]+' '+(n%10?a[n%10]+' ':'');if(n<1000)return a[Math.floor(n/100)]+'Hundred '+(n%100?inW(n%100):'');return a[Math.floor(n/1000)]+'Thousand '+(n%1000?inW(n%1000):'');};
  const amtWords = inW(amt).trim() + ' Only';

  const html = `<!DOCTYPE html><html><head><title>Fee Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#fff;padding:10px;font-size:12px}
    .receipt{width:160mm;border:1px solid #999;margin:0 auto}
    .hdr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1.5px solid #000}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:8.5px;color:#555}
    .hname{font-size:13px;font-weight:800;color:#000;line-height:1.3;margin:2px 0}
    .haddr{font-size:8.5px;color:#444;margin-top:1px}
    .titlebar{text-align:center;padding:5px;border-bottom:1px solid #999;font-size:13px;font-weight:900;letter-spacing:2px;background:#f5f5f5}
    .copyline{padding:4px 12px;font-size:10px;border-bottom:1px dashed #aaa}
    .metarow{display:flex;justify-content:space-between;padding:4px 12px;font-size:11px;border-bottom:1px dashed #aaa}
    .infobox{padding:4px 12px;border-bottom:1px dashed #aaa}
    table.info{width:100%;border-collapse:collapse;font-size:11px}
    table.info td{padding:2px 4px}
    .lbl{font-weight:700;color:#444;width:95px}
    .val{font-weight:600;color:#000}
    table.fees{width:100%;border-collapse:collapse;margin-top:4px}
    table.fees thead tr{background:#ddd}
    table.fees th{padding:5px 8px;font-size:11px;font-weight:700;text-align:left;border:1px solid #aaa}
    table.fees th:last-child{text-align:right}
    table.fees td{padding:5px 8px;font-size:11px;border:1px solid #ccc}
    table.fees td:first-child{text-align:center;width:32px}
    table.fees td:last-child{text-align:right}
    .totrow td{font-weight:800;font-size:12px;background:#f0f0f0;border-top:2px solid #555}
    .amtline{padding:5px 12px;font-size:11px;border-top:1px dashed #aaa}
    .payline{padding:4px 12px;font-size:11px}
    .narrline{padding:4px 12px 6px;font-size:11px;border-top:1px dashed #aaa}
    .sigrow{display:flex;justify-content:space-between;align-items:flex-end;padding:6px 12px 8px;border-top:1px dashed #aaa}
    .sigsys{font-size:9px;color:#666;font-style:italic}
    .sigbox{text-align:center;font-size:10px}
    .sigline{border-top:1px solid #444;margin-top:22px;padding-top:3px;font-weight:700}
    .erpline{padding:3px 12px;font-size:9px;color:#666;border-top:1px dashed #aaa;text-align:center}
    @media print{body{padding:0}.receipt{width:100%}@page{size:A5;margin:5mm}}
  </style></head><body>
  <div class="receipt">
    <div class="hdr">
      <img src="${logo}" class="hlogo"/>
      <div class="htxt">
        <div class="htrust" style="font-weight:700">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="hname">Late Kalpana Chawla Women's Senior College (LKCWSC)</div>
        <div class="haddr">Affiliated to SNDT Women's University, Mumbai</div>
        <div class="haddr">Gangakhed, Dist. Parbhani, Maharashtra – 431514 &nbsp;|&nbsp; +91 9307162914 &nbsp;|&nbsp; lkcwsc.vnssorg.com</div>
      </div>
    </div>
    <div class="titlebar">FEE RECEIPT</div>
    <div class="copyline">Fee Receipt (Student Copy)</div>
    <div class="metarow">
      <span><b>Receipt No. :</b> ${p.receiptNo||'—'}</span>
      <span><b>Date :</b> ${dateStr}</span>
    </div>
    <div class="infobox">
      <table class="info">
        <tr>
          <td class="lbl">Student Name</td><td class="val">: ${adm?.applicantName||'—'}</td>
          <td class="lbl" style="padding-left:16px">Student UID</td><td class="val">: ${adm?.studentId||'—'}</td>
        </tr>
        <tr>
          <td class="lbl">Course</td><td class="val">: ${(()=>{const ct=(adm?.courseType||'').toLowerCase();return ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')?'Bachelor of Science (B.Sc.)':ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')?'Bachelor of Arts (B.A.)':adm?.courseType||'—';})()}  </td>
          <td class="lbl" style="padding-left:16px">Academic Year</td><td class="val">: ${acadYear}</td>
        </tr>
        <tr>
          <td class="lbl">Class</td><td class="val">: ${adm?.admissionYear||'—'}</td>
          <td class="lbl" style="padding-left:16px">Fee Type</td><td class="val">: ${p.feeTypeLabel||p.feeType||'—'}</td>
        </tr>
      </table>
    </div>
    <table class="fees">
      <thead><tr><th>S.No.</th><th>Particulars</th><th>Total (in Rs.)</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>${p.feeTypeLabel||p.feeType||'Fee'}</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
        <tr class="totrow"><td colspan="2" style="text-align:right;padding-right:10px">Total Amount</td><td>₹${amt.toLocaleString('en-IN')}.00</td></tr>
      </tbody>
    </table>
    <div class="amtline">Amt. in words (Rs.) : <b>${amtWords}</b></div>
    <div class="payline">Paid by : <b>${p.paymentMode==='online'?'Online':'Cash'}</b> &nbsp;&nbsp; Rs. <b>${amt.toLocaleString('en-IN')}.00</b> &nbsp;&nbsp; Date : <b>${dateStr}</b></div>
    <div class="narrline">Narration :</div>
    <div class="sigrow">
      <div class="sigsys">This is system generated receipt and does not require seal/stamp.</div>
      <div class="sigbox"><div class="sigline">Accounts Section<br/>LKCWSC</div></div>
    </div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}></body></html>`;
  const w = window.open('','_blank','width=680,height=680');
  w.document.write(html); w.document.close();
};


const printTC = (adm) => {

  const today   = new Date();
  const dateStr = String(today.getDate()).padStart(2,'0') + '/' + String(today.getMonth()+1).padStart(2,'0') + '/' + today.getFullYear();

  const dobObj  = adm.dateOfBirth ? new Date(adm.dateOfBirth) : null;
  const dobStr  = dobObj ? String(dobObj.getDate()).padStart(2,'0')+'/'+String(dobObj.getMonth()+1).padStart(2,'0')+'/'+dobObj.getFullYear() : '';

  // DOB in words
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen',
    'Twenty','Twenty-One','Twenty-Two','Twenty-Three','Twenty-Four','Twenty-Five','Twenty-Six',
    'Twenty-Seven','Twenty-Eight','Twenty-Nine','Thirty','Thirty-One'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const yearToWords = (y) => {
    if (y>=1000){const th=Math.floor(y/1000),rem=y%1000,thW=ones[th]+' Thousand';if(rem===0)return thW;if(rem<100)return thW+' '+(rem<ones.length?ones[rem]:tens[Math.floor(rem/10)]+(rem%10?'-'+ones[rem%10]:''));const h=Math.floor(rem/100),r=rem%100,hw=ones[h]+' Hundred',rw=r===0?'':(r<ones.length?ones[r]:tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:''));return thW+' '+hw+(rw?' '+rw:'');}
    const h=Math.floor(y/100),r=y%100;return(ones[h]+' Hundred'+(r===0?'':(r<ones.length?' '+ones[r]:' '+tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:'')))).trim();
  };
  const dobWords = dobObj ? ones[dobObj.getDate()]+' '+monthNames[dobObj.getMonth()]+' '+yearToWords(dobObj.getFullYear()) : '';

  const ct = (adm.courseType||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : (adm.courseType||'') + (adm.preferredSubject?' — '+adm.preferredSubject:'');

  const html = `<!DOCTYPE html><html><head><title>Transfer Certificate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#f0f0f0;display:flex;justify-content:center;padding:20px;font-size:13px}
    .page{background:white;width:720px;border:1.5px solid #000;padding:0;box-shadow:0 4px 20px rgba(0,0,0,.15)}
    .hdr{display:flex;align-items:center;gap:10px;border-bottom:1.5px solid #000;padding:8px 12px}
    .hlogo{width:52px;height:52px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .htrust{font-size:8.5px;color:#555}
    .hname{font-size:13px;font-weight:800;color:#000;line-height:1.3;margin:2px 0}
    .haddr{font-size:8.5px;color:#444;margin-top:1px}
    .titlesec{text-align:center;padding:6px 0 2px;border-bottom:1px solid #000}
    .title{font-size:15px;font-weight:bold;letter-spacing:2px;text-decoration:underline;text-underline-offset:3px}
    .subtitle{font-size:11px;font-style:italic;margin-top:1px}
    .disclaimer{font-size:9.5px;font-style:italic;padding:5px 14px;border-bottom:1px solid #ccc;color:#333;line-height:1.4}
    .regrow{display:flex;justify-content:space-between;padding:5px 14px;border-bottom:1px solid #ccc;font-size:12px}
    .reglabel{font-weight:600}
    .regval{font-weight:bold}
    /* Editable fields */
    input[type=text]{border:none;border-bottom:1px dotted #555;outline:none;font-family:'Times New Roman',serif;font-size:13px;background:transparent;padding:1px 4px;min-width:180px;font-weight:bold}
    input[type=text]:focus{border-bottom:1.5px solid #000;background:#fffde7}
    /* Table rows */
    .rows{padding:2px 14px}
    .row{display:flex;align-items:baseline;padding:5px 0;border-bottom:1px dotted #ccc;font-size:13px}
    .rnum{width:22px;flex-shrink:0;font-weight:600}
    .rlabel{width:210px;flex-shrink:0}
    .rcolon{width:16px;flex-shrink:0}
    .rval{flex:1;font-weight:bold}
    .rval input{width:100%;min-width:unset}
    /* Footer */
    .foot{display:flex;justify-content:space-between;align-items:flex-end;padding:12px 14px 10px}
    .fsign{text-align:center;min-width:100px}
    .fsign-line{border-top:1px solid #000;margin-top:32px;padding-top:4px;font-size:12px;font-weight:bold}
    /* Print button */
    .print-btn{display:block;margin:10px auto;padding:8px 28px;background:#1a237e;color:white;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer}
    @media print{
      body{background:white;padding:0}
      .page{box-shadow:none}
      .print-btn{display:none}
      input[type=text]{border-bottom:1px dotted #555}
    }
  </style></head><body>
  <div class="page">

    <div class="hdr">
      <img src="${window.location.origin}/college-logo.png" class="logo"/>
      <div class="htxt">
        <div class="h1">Vidya Niketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="h2">Late Kalpana Chawala Arts &amp; Science Mahila Senior College Gangakhed,</div>
        <div class="h3">Lecturer Colony Gangakhed, Dist Parbhani - 431514</div>
        <div class="h4">📞 +91 9307162914 &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com &nbsp;|&nbsp; ✉️ lkcwsc@vnssorg.com</div>
      </div>
    </div>

    <div class="titlesec">
      <div class="title">TRANSFER CERTIFICATE</div>
      <div class="subtitle">(vide Rule 17)</div>
    </div>

    <div class="disclaimer">
      <em>(No Change in any entry in this certificate shall be made except by the authority issuing it and any infringement of this requirement is liable to involve the imposition of penalty of such as that of Rustication)</em>
    </div>

    <div class="regrow">
      <span><span class="reglabel">Register No. : </span><input type="text" value="" style="min-width:100px"/></span>
      <span><span class="reglabel">T.C. No. : </span><span class="regval">TC${String(new Date().getFullYear()).slice(-2)}-${Date.now().toString().slice(-5)}</span></span>
    </div>

    <div class="rows">
      <div class="row"><span class="rnum">1.</span><span class="rlabel">Name of Student in Full</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.applicantName||''}"/></span></div>
      <div class="row"><span class="rnum">2.</span><span class="rlabel">Mother's Name</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.motherName||''}"/></span></div>
      <div class="row"><span class="rnum">3.</span><span class="rlabel">Caste &amp; Sub-Caste</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${adm.caste||''}"/></span></div>
      <div class="row"><span class="rnum">4.</span><span class="rlabel">Place of Birth</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">5.</span><span class="rlabel">Nationality</span><span class="rcolon">:</span>
        <span class="rval"><input type="text" value="Indian" style="min-width:120px"/></span></div>
      <div class="row"><span class="rnum">6.</span><span class="rlabel">Date of Birth</span><span class="rcolon">:</span>
        <span class="rval"> <input type="text" value="${dobStr}" style="min-width:120px"/> </span>
      </div>
      <div class="row"> <span class="rnum">7.</span><span class="rlabel">(In Words)</span><span class="rcolon">:</span>
        <span class="rval"><input type="text" value="${dobWords}" style="min-width:280px"/></span>
      </div>
      <div class="row"><span class="rnum">8.</span><span class="rlabel">Last School / College attended</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">9.</span><span class="rlabel">Date of Admission</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">10.</span><span class="rlabel">Progress</span><span class="rcolon">:</span><span class="rval"><input type="text" value="Satisfactory"/></span></div>
      <div class="row"><span class="rnum">11.</span><span class="rlabel">Conduct</span><span class="rcolon">:</span><span class="rval"><input type="text" value="Good"/></span></div>
      <div class="row"><span class="rnum">12.</span><span class="rlabel">Date of Leaving</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${dateStr}"/></span></div>
      <div class="row"><span class="rnum">11.</span><span class="rlabel">Standard in which studying and since when</span><span class="rcolon">:</span><span class="rval"><input type="text" value="${courseFull + (adm.admissionYear?' ('+adm.admissionYear+')':'')}"/></span></div>
      <div class="row"><span class="rnum">13.</span><span class="rlabel">Reason of Leaving College</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row"><span class="rnum">14.</span><span class="rlabel">Remarks</span><span class="rcolon">:</span><span class="rval"><input type="text" value=""/></span></div>
      <div class="row" style="border-bottom:none;padding-top:8px"><span class="rnum">15.</span><span style="flex:1;font-weight:bold">Certified that the above information is in accordance with the college record.</span></div>
    </div>

    <div class="foot">
      <div class="fsign">
        <div style="font-size:12px;margin-bottom:2px">Date : ${dateStr}</div>
      </div>
      <div class="fsign">
        <div class="fsign-line">Clark</div>
      </div>
      <div class="fsign">
        <div class="fsign-line">Principal</div>
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">🖨️ Print TC</button>
  </div>
  </body></html>`;

  const w = window.open('','_blank','width=800,height=900');
  w.document.write(html);
  w.document.close();
};

const printBonafide = (adm) => {
  const certNo  = 'BON' + new Date().getFullYear().toString().slice(-2) + '-' + Date.now().toString().slice(-4);
  const now     = new Date();
  const day     = String(now.getDate()).padStart(2,'0');
  const month   = String(now.getMonth()+1).padStart(2,'0');
  const fullYear= now.getFullYear();
  const acadY1  = now.getMonth()+1 >= 6 ? fullYear : fullYear-1;
  const acadYear= acadY1 + '-' + String(acadY1+1).slice(-2);

  const dobObj  = adm.dateOfBirth ? new Date(adm.dateOfBirth) : null;
  const dobDD   = dobObj ? String(dobObj.getDate()).padStart(2,'0') : '____';
  const dobMM   = dobObj ? String(dobObj.getMonth()+1).padStart(2,'0') : '____';
  const dobYYYY = dobObj ? String(dobObj.getFullYear()) : '______';

  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty','Twenty-One','Twenty-Two','Twenty-Three','Twenty-Four','Twenty-Five','Twenty-Six','Twenty-Seven','Twenty-Eight','Twenty-Nine','Thirty','Thirty-One'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const yearToWords = (y) => {
    if (y>=1000){const th=Math.floor(y/1000),rem=y%1000,thW=ones[th]+' Thousand';if(rem===0)return thW;if(rem<100)return thW+' '+(rem<ones.length?ones[rem]:tens[Math.floor(rem/10)]+(rem%10?'-'+ones[rem%10]:''));const h=Math.floor(rem/100),r=rem%100,hw=ones[h]+' Hundred',rw=r===0?'':(r<ones.length?ones[r]:tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:''));return thW+' '+hw+(rw?' '+rw:'');}
    const h=Math.floor(y/100),r=y%100;return(ones[h]+' Hundred'+(r===0?'':(r<ones.length?' '+ones[r]:' '+tens[Math.floor(r/10)]+(r%10?'-'+ones[r%10]:'')))).trim();
  };
  const dobWords = dobObj ? ones[dobObj.getDate()]+' '+monthNames[dobObj.getMonth()]+' '+yearToWords(dobObj.getFullYear()) : '________________';

  const ct = (adm.courseType||'').toLowerCase();
  const courseFull = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science')
    ? 'Bachelor of Science (B.Sc.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts')
    ? 'Bachelor of Arts (B.A.)' + (adm.preferredSubject?' — '+adm.preferredSubject:'')
    : (adm.courseType||'') + (adm.preferredSubject?' — '+adm.preferredSubject:'');

  const logo = window.location.origin + "/college-logo.png";

  const html = `<!DOCTYPE html><html><head><title>Bonafide Certificate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;background:#f0f0f0;display:flex;justify-content:center;padding:20px}
    .page{background:white;width:730px;border:2px solid #000}
    /* Header */
    .hdr{display:flex;align-items:center;gap:10px;border-bottom:2px solid #000;padding:10px 14px}
    .logo{width:82px;height:82px;object-fit:contain;flex-shrink:0}
    .htxt{flex:1;text-align:center}
    .h1{font-size:11px;color:#333}
    .h2{font-size:11px;color:#333}
    .h3{font-size:21px;font-weight:900;color:#000;margin:3px 0 2px}
    .h4{font-size:11px;color:#000;margin-bottom:1px}
    .h5{font-size:10px;color:#555}
    /* Title */
    .titlebar{text-align:center;padding:8px 0;border-bottom:1px solid #000}
    .titletxt{font-size:17px;font-weight:900;letter-spacing:5px;text-decoration:underline;text-underline-offset:4px}
    /* Meta */
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;padding:6px 18px;border-bottom:1px solid #ccc;font-size:12.5px}
    .mrow{display:flex;gap:4px;align-items:baseline}
    .ml{font-weight:700}
    .mv{border-bottom:1px solid #000;flex:1;min-width:80px;padding-left:3px;font-weight:bold}
    /* Body */
    .body{padding:10px 20px 8px;font-size:14px;line-height:1.5}
    .body p{margin:0 0 8px 0}
    .ul{border-bottom:1.5px solid #000;display:inline-block;font-weight:bold;min-width:200px;text-align:center}
    .ul-sm{border-bottom:1.5px solid #000;display:inline-block;font-weight:bold;min-width:44px;text-align:center}
    .ul-lg{border-bottom:1.5px solid #000;display:inline-block;min-width:340px;font-weight:bold}
    /* Footer */
    .foot{display:flex;justify-content:flex-end;align-items:flex-end;padding:10px 20px 12px}
    .signbox{text-align:center;min-width:120px}
    .signline{border-top:1px solid #000;padding-top:5px;font-size:13px;font-weight:bold;margin-top:36px}
    /* ERP */
    .erp{border-top:1px dashed #aaa;padding:5px 18px;font-size:9.5px;color:#666;display:flex;justify-content:space-between}
    .sysgen{padding:3px 18px 5px;font-size:9px;color:#888;text-align:center}
    @media print{body{background:white;padding:0}.page{box-shadow:none}}
  </style></head><body><div class="page">
    <div class="hdr">
      <img src="${logo}" class="logo"/>
      <div class="htxt">
        <div class="h1">Vidyaniketan Sevabhavi Sanstha, Dongargaon (She.)</div>
        <div class="h2">Affiliated to S.N.D.T. Women's University, Mumbai</div>
        <div class="h3">Late Kalpana Chawla Women's Senior College</div>
        <div class="h4">Lecture Colony, Gangakhed, Tq. Gangakhed, Dist. Parbhani, Maharashtra – 431514</div>
        <div class="h5">📞 +91 9307162914 &nbsp;|&nbsp; 🌐 lkcwsc.vnssorg.com</div>
      </div>
    </div>
    <div class="titlebar"><span class="titletxt">BONAFIDE &nbsp; CERTIFICATE</span></div>
    <div class="meta">
      <div class="mrow"><span class="ml">Certificate No.:</span><span class="mv">&nbsp;${certNo}</span></div>
      <div class="mrow"><span class="ml">Date:</span><span class="mv">&nbsp;${day} / ${month} / ${fullYear}</span></div>
      <div class="mrow"><span class="ml">Student ID:</span><span class="mv">&nbsp;${adm.studentId||'____________________'}</span></div>
      <div class="mrow"><span class="ml">Academic Year:</span><span class="mv">&nbsp;${acadYear}</span></div>
    </div>
    <div class="body">
      <p>This is to certify that Miss &nbsp;<span class="ul">&nbsp;${adm.applicantName||''}&nbsp;</span>&nbsp; is a bonafide student of Late Kalpana Chawla Women's Senior College, Gangakhed. She is studying in <span class="ul" style="min-width:220px">&nbsp;${courseFull||'____________________'}&nbsp;</span> Course, <span class="ul" style="min-width:80px">&nbsp;${adm.admissionYear||'________'}&nbsp;</span> during the Academic Year &nbsp;<strong>${acadYear}</strong>. As per college records, her Date of Birth is &nbsp;<span class="ul-sm">&nbsp;${dobDD}&nbsp;</span>&nbsp;/&nbsp;<span class="ul-sm">&nbsp;${dobMM}&nbsp;</span>&nbsp;/&nbsp;<span class="ul-sm" style="min-width:60px">&nbsp;${dobYYYY}&nbsp;</span> (In Words): &nbsp;<span class="ul-lg">&nbsp;${dobWords}&nbsp;</span>. To the best of my knowledge and belief, her conduct and moral character are <strong>good</strong>. This certificate is issued on her request for official purpose.</p>
    </div>
    <div class="foot">
      <div class="signbox">
        <div class="signline">Principal</div>
      </div>
    </div>
    <div class="erp"><span>ERP Verification ID: <strong>ERP${certNo}</strong></span><span>Generated Through College ERP System</span></div>
    <div class="sysgen">This is a system generated certificate.</div>
  </div>
  <scri${'pt'}>window.onload=()=>{window.print()}</scri${'pt'}></body></html>`;
  const w = window.open('','_blank','width=800,height=700'); w.document.write(html); w.document.close();
};



const DOC_CONFIG = {
  TC:        { label: 'Transfer Certificate', icon: '📄', color: '#1565C0', bg: '#e3f2fd' },
  BONAFIDE:  { label: 'Bonafide Certificate',  icon: '📜', color: '#7B1FA2', bg: '#f3e5f5' },
  ID_CARD:   { label: 'ID Card',               icon: '🪪', color: '#2E7D32', bg: '#e8f5e9' },
  MARKSHEET: { label: 'Marksheet',             icon: '📋', color: '#E65100', bg: '#fff3e0' },
  MIGRATION: { label: 'Migration Certificate', icon: '📜', color: '#795548', bg: '#efebe9' },
};

const AllDocumentsTab = ({ user }) => { // eslint-disable-line no-unused-vars
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [admMap, setAdmMap]       = useState({});
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completing, setCompleting] = useState('');
  const [rejecting, setRejecting]   = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [msg, setMsg]               = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, admRes] = await Promise.all([
        API.get('/document-requests/student-section/all'),
        API.get('/admissions/staff-view/all'),
      ]);
      setRequests(reqRes.data.requests || []);
      const map = {};
      (admRes.data.admissions || []).forEach(a => { map[a.email] = a; });
      setAdmMap(map);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePrint = (req) => {
    const adm = admMap[req.studentEmail] || {};
    const merged = {
      applicantName: req.studentName, email: req.studentEmail,
      studentId: adm.studentId||'', prnNumber: adm.prnNumber||'',
      aparIdNumber: adm.aparIdNumber||'', dateOfBirth: adm.dateOfBirth||'',
      gender: adm.gender||'Female', fatherName: adm.fatherName||'',
      motherName: adm.motherName||'', category: adm.category||'',
      caste: adm.caste||'',
      courseType: req.branch||adm.courseType||adm.course||adm.hscStream||'',
      preferredSubject: adm.preferredSubject||adm.subject||'',
      admissionYear: req.admissionYear||adm.admissionYear||'',
      address: adm.address||'', religion: adm.religion||'',
    };
    if (req.documentType === 'TC') printTC(merged);
    else if (req.documentType === 'BONAFIDE') printBonafide(merged);
    else printIDCard(merged);
  };

  const handleComplete = async (req) => {
    setCompleting(req._id);
    try {
      await API.put(`/document-requests/student-section/complete/${req._id}`, {
        notes: `${DOC_CONFIG[req.documentType]?.label || req.documentType} generated and issued.`
      });
      setMsg('✅ Marked as issued!');
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setCompleting(''); }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) return;
    setRejecting(rejectModal._id);
    try {
      await API.put(`/document-requests/accounts/reject/${rejectModal._id}`, { reason: rejectNote });
      setMsg('✅ Request rejected.');
      setRejectModal(null); setRejectNote('');
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setRejecting(''); }
  };

  const filtered = requests.filter(r => {
    const mt = typeFilter === 'all' || r.documentType === typeFilter;
    const ms = statusFilter === 'all' || r.status === statusFilter;
    const q  = search.toLowerCase();
    const mq = !q || r.studentName?.toLowerCase().includes(q) || r.studentEmail?.toLowerCase().includes(q);
    return mt && ms && mq;
  });

  const pending = requests.filter(r => r.status === 'pending_generation').length;

  const statusStyle = (s) => ({
    pending_accounts:      { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending Accounts' },
    rejected_by_accounts:  { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' },
    pending_exam:          { bg: '#e3f2fd', color: '#1565C0', label: '🔍 At Exam Section' },
    rejected_by_exam:      { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Exam' },
    pending_principal:     { bg: '#fff3e0', color: '#E65100', label: '🔄 At Principal' },
    rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
    pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Issue' },
    completed:             { bg: '#f3e5f5', color: '#7B1FA2', label: '🏁 Issued' },
  }[s] || { bg: '#f5f5f5', color: '#888', label: s });

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>📄 Documents & Certificates</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Print TC, Bonafide, ID Card and mark as issued. All document types in one place.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff3e0', color: '#E65100', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Pending: {pending}</div>
        <div style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>Issued: {requests.filter(r=>r.status==='completed').length}</div>
        {Object.entries(DOC_CONFIG).map(([k,v]) => {
          const c = requests.filter(r=>r.documentType===k).length;
          return c > 0 ? <div key={k} style={{ background: v.bg, color: v.color, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>{v.icon} {v.label}: {c}</div> : null;
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Types</option>
          {Object.entries(DOC_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Status</option>
          <option value="pending_generation">✅ Ready to Issue</option>
          <option value="completed">🏁 Issued</option>
          <option value="pending_accounts">⏳ At Accounts</option>
          <option value="pending_exam">🔍 At Exam Section</option>
          <option value="pending_principal">🔄 At Principal</option>
          <option value="rejected_by_accounts">❌ Rejected</option>
        </select>
        <button onClick={fetchData}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 26, maxWidth: 440, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#C62828', marginBottom: 12 }}>❌ Reject Request</h3>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>Student: <strong>{rejectModal.studentName}</strong> — {DOC_CONFIG[rejectModal.documentType]?.label}</p>
            <textarea rows="3" placeholder="Reason for rejection..." value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleReject} disabled={!rejectNote.trim() || rejecting === rejectModal._id}
                style={{ background: '#C62828', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {rejecting === rejectModal._id ? '⏳...' : '❌ Confirm Reject'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                style={{ background: '#eee', color: '#333', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="empty-state"><p style={{fontSize:'2rem'}}>⏳</p><h3>Loading...</h3></div>
      : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><h3>No requests found</h3><p>Document requests will appear here after Accounts section approves them.</p></div>
      : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const cfg = DOC_CONFIG[req.documentType] || { label: req.documentType, icon: '📄', color: '#555', bg: '#f5f5f5' };
            const ss  = statusStyle(req.status);
            const isReady = req.status === 'pending_generation';
            const canPrint = ['TC','BONAFIDE','ID_CARD'].includes(req.documentType);
            const adm = admMap[req.studentEmail] || {};
            return (
              <div key={req._id} style={{ background: '#fff', border: `1px solid ${isReady ? cfg.color+'55' : '#e0e7ef'}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${cfg.color}` }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: isReady ? cfg.bg+'aa' : '#fafbff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h4 style={{ color: cfg.color, fontSize: 15, margin: 0 }}>{cfg.label}</h4>
                        {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>⚡ Urgent</span>}
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 12, background: ss.bg, color: ss.color }}>{ss.label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>{new Date(req.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canPrint && (
                      <button onClick={() => handlePrint(req)}
                        style={{ background: cfg.color, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        🖨️ Print {cfg.label}
                      </button>
                    )}
                    {isReady && (
                      <button onClick={() => handleComplete(req)} disabled={completing === req._id}
                        style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: completing===req._id?'not-allowed':'pointer', opacity: completing===req._id?0.7:1 }}>
                        {completing === req._id ? '⏳...' : '✅ Mark Issued'}
                      </button>
                    )}
                    {isReady && (
                      <button onClick={() => { setRejectModal(req); setRejectNote(''); }}
                        style={{ background: '#ffebee', color: '#C62828', border: '1px solid #ef9a9a', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: '10px 18px 14px', fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderTop: '1px solid #f0f4f8' }}>
                  <span><strong>Student:</strong> {req.studentName}</span>
                  <span><strong>Email:</strong> {req.studentEmail}</span>
                  <span><strong>Branch:</strong> {req.branch||'—'}</span>
                  <span><strong>Year:</strong> {req.admissionYear||'—'}</span>
                  {adm.studentId && <span><strong>Student ID:</strong> {adm.studentId}</span>}
                  {adm.prnNumber && <span><strong>PRN:</strong> {adm.prnNumber}</span>}
                  {req.reason && <span style={{gridColumn:'1/-1'}}><strong>Reason:</strong> {req.reason}</span>}
                  {req.accountsNotes && <span style={{gridColumn:'1/-1',color:'#777',fontStyle:'italic'}}>Accounts: {req.accountsNotes}</span>}
                  {req.principalNotes && <span style={{gridColumn:'1/-1',color:'#777',fontStyle:'italic'}}>Principal: {req.principalNotes}</span>}
                </div>
                {req.status === 'completed' && req.generatedBy && (
                  <div style={{ padding: '6px 18px 10px', fontSize: 12, color: '#7B1FA2', fontWeight: 600, borderTop: '1px solid #f0f4f8' }}>
                    🏁 Issued by {req.generatedBy} on {req.generatedDate ? new Date(req.generatedDate).toLocaleDateString('en-IN') : '—'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const UpdatePrnTab = () => { // eslint-disable-line no-unused-vars
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { _id, prnNumber, aparIdNumber }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/student-section/approved');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/admissions/update-prn/${editing._id}`, {
        prnNumber: editing.prnNumber,
        aparIdNumber: editing.aparIdNumber,
      });
      setMsg('✅ PRN / ABC ID updated successfully!');
      setTimeout(() => setMsg(''), 3000);
      setEditing(null);
      fetchAdmissions();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to update')); }
    finally { setSaving(false); }
  };

  const filtered = admissions.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🔢 Update PRN / ABC ID</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Add or update the PRN Number and ABC (APAR) ID for enrolled students.</p>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name, student ID or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#1565C0', marginBottom: 4 }}>🔢 Update PRN / ABC ID</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Student: <strong>{editing.applicantName}</strong> ({editing.studentId || 'No ID'})</p>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>PRN Number</label>
              <input type="text" placeholder="Enter PRN Number" value={editing.prnNumber}
                onChange={e => setEditing({ ...editing, prnNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 6, fontSize: 13 }}>ABC ID (APAR ID)</label>
              <input type="text" placeholder="Enter ABC / APAR ID" value={editing.aparIdNumber}
                onChange={e => setEditing({ ...editing, aparIdNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #1565C0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, background: '#1565C0', color: '#fff', padding: 12, borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={() => { setEditing(null); setMsg(''); }}
                style={{ padding: '12px 20px', background: '#eee', color: '#333', borderRadius: 9, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading students...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔢</div><h3>No students found</h3><p>Approved students will appear here.</p></div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.3fr 1.4fr 0.8fr', background: '#1565C0', padding: '13px 16px', gap: 8 }}>
            {['Student', 'Student ID', 'PRN Number', 'ABC / APAR ID', 'Action'].map(h => (
              <span key={h} style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{h}</span>
            ))}
          </div>
          {filtered.map((adm, idx) => (
            <div key={adm._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.3fr 1.4fr 0.8fr', padding: '12px 16px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f4f8', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', margin: 0 }}>{adm.applicantName}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{adm.courseType} · {adm.admissionYear}</p>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{adm.studentId || '—'}</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.prnNumber ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                {adm.prnNumber || '⚠️ Not set'}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: adm.aparIdNumber ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                {adm.aparIdNumber || '⚠️ Not set'}
              </span>
              <button onClick={() => setEditing({ _id: adm._id, applicantName: adm.applicantName, studentId: adm.studentId, prnNumber: adm.prnNumber || '', aparIdNumber: adm.aparIdNumber || '' })}
                style={{ background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARRY FORWARD TAB
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CARRY FORWARD TAB — with result check
// ─────────────────────────────────────────────────────────────────────────────
const CarryForwardTab = () => { // eslint-disable-line no-unused-vars
  const [admissions, setAdmissions]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [yearFilter, setYearFilter]       = useState('all');
  const [promoting, setPromoting]         = useState('');
  const [msg, setMsg]                     = useState('');
  const [results, setResults]             = useState({});
  const [loadingResult, setLoadingResult] = useState('');
  const [expandedResult, setExpandedResult] = useState(null); // admissionId to show full marksheet

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admissions/student-section/approved');
      setAdmissions(res.data.admissions || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const fetchResult = async (adm) => {
    setLoadingResult(adm._id);
    try {
      const res = await API.get(`/results/by-email/${encodeURIComponent(adm.email)}`);
      const allResults = res.data.results || [];
      if (allResults.length === 0) {
        setResults(prev => ({ ...prev, [adm._id]: { status: 'no_result', allResults: [] } }));
        return;
      }
      // Sort by year desc, semester desc → latest first
      allResults.sort((a, b) => b.year - a.year || b.semester - a.semester);
      const latest = allResults[0];
      const subjects = latest.subjects || [];
      const atktSubs = subjects.filter(s => Number(s.obtainedMarks) < Number(s.maxMarks) * 0.35);
      const status = latest.result ||
        (atktSubs.length === subjects.length && subjects.length > 0 ? 'fail' :
         atktSubs.length > 0 ? 'atkt' :
         (latest.percentage >= 75 ? 'distinction' : 'pass'));
      setResults(prev => ({
        ...prev,
        [adm._id]: {
          status,
          percentage: latest.percentage,
          semester: latest.semester,
          year: latest.year,
          subjects,
          atktSubjects: atktSubs.map(s => s.name),
          totalSubjects: subjects.length,
          allResults,
        }
      }));
    } catch {
      setResults(prev => ({ ...prev, [adm._id]: { status: 'error', allResults: [] } }));
    }
    finally { setLoadingResult(''); }
  };

  const handlePromote = async (adm, newYear) => {
    const r = results[adm._id];
    if (!r || r.status === 'no_result') {
      alert('⚠️ Please check the result first before promoting.'); return;
    }
    if (r.status === 'fail') {
      if (!window.confirm(`⚠️ ${adm.applicantName} has FAILED all subjects (${r.percentage}%).
Are you sure you want to promote?`)) return;
    } else if (r.status === 'atkt') {
      if (!window.confirm(`⚠️ ${adm.applicantName} has ATKT in: ${r.atktSubjects.join(', ')}.
Promote to ${newYear} with ATKT?`)) return;
    } else {
      if (!window.confirm(`Promote ${adm.applicantName} (${r.percentage}%) to ${newYear}?`)) return;
    }
    setPromoting(adm._id);
    try {
      await API.put(`/admissions/carry-forward/${adm._id}`, { newYear });
      setMsg(`✅ ${adm.applicantName} promoted to ${newYear}!`);
      setTimeout(() => setMsg(''), 4000);
      fetchAdmissions();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setPromoting(''); }
  };

  const nextYear = (current) => {
    if (current === '1st Year') return '2nd Year';
    if (current === '2nd Year') return '3rd Year';
    return null;
  };

  const statusColor = (s) => ({
    pass:        { bg: '#e8f5e9', color: '#2E7D32', border: '#a5d6a7' },
    distinction: { bg: '#e8f5e9', color: '#1b5e20', border: '#66bb6a' },
    atkt:        { bg: '#fff3e0', color: '#E65100', border: '#ffb74d' },
    fail:        { bg: '#ffebee', color: '#C62828', border: '#ef9a9a' },
    no_result:   { bg: '#f5f5f5', color: '#888',    border: '#e0e0e0' },
    error:       { bg: '#ffebee', color: '#C62828', border: '#ef9a9a' },
  }[s] || { bg: '#f5f5f5', color: '#888', border: '#e0e0e0' });

  const statusLabel = (r) => {
    if (!r) return null;
    const sc = statusColor(r.status);
    const labels = {
      no_result:   'No Result Uploaded',
      error:       'Fetch Error',
      pass:        `✅ PASS — ${r.percentage}%`,
      distinction: `🏅 DISTINCTION — ${r.percentage}%`,
      atkt:        `⚠️ ATKT — ${r.atktSubjects?.length} subject(s) failed`,
      fail:        `❌ FAIL — All subjects failed`,
    };
    return (
      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
        {labels[r.status] || r.status}
      </span>
    );
  };

  const gradeColor = (obtained, max) => {
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    if (pct < 35) return { bg: '#ffebee', color: '#C62828', label: 'F' };
    if (pct < 45) return { bg: '#fff3e0', color: '#E65100', label: 'B' };
    if (pct < 55) return { bg: '#fff8e1', color: '#F57F17', label: 'B+' };
    if (pct < 65) return { bg: '#f3e5f5', color: '#7B1FA2', label: 'A' };
    if (pct < 75) return { bg: '#e3f2fd', color: '#1565C0', label: 'A+' };
    return { bg: '#e8f5e9', color: '#2E7D32', label: 'O' };
  };

  const filtered = admissions.filter(a => {
    const mf = yearFilter === 'all' || a.admissionYear === yearFilter;
    const q = search.toLowerCase();
    const ms = !q || a.applicantName?.toLowerCase().includes(q) || a.studentId?.toLowerCase().includes(q);
    return mf && ms;
  });

  const counts = {
    first:  admissions.filter(a => a.admissionYear === '1st Year').length,
    second: admissions.filter(a => a.admissionYear === '2nd Year').length,
    third:  admissions.filter(a => a.admissionYear === '3rd Year').length,
  };

  return (
    <div>
      <h2 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 SY / TY Carry Forward</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        Check last semester marksheet first, then promote student to next year.
      </p>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 500, fontSize: 14,
          background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee',
          color: msg.startsWith('✅') ? '#2E7D32' : '#C62828' }}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '1st Year', count: counts.first,  color: '#1565C0', bg: '#e3f2fd' },
          { label: '2nd Year', count: counts.second, color: '#7B1FA2', bg: '#f3e5f5' },
          { label: '3rd Year', count: counts.third,  color: '#2E7D32', bg: '#e8f5e9' },
          { label: 'Total',    count: admissions.length, color: '#555', bg: '#f5f5f5' },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, color: p.color, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>
            {p.label}: {p.count}
          </div>
        ))}
      </div>

      {/* Warning */}
      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#7c5e00' }}>
        📌 <strong>Step 1:</strong> Click <strong>📊 Check Marksheet</strong> to view last semester result.
        &nbsp;&nbsp;<strong>Step 2:</strong> Review marks/status. &nbsp;&nbsp;<strong>Step 3:</strong> Click promote if eligible.
        <br/>Result must be checked before promoting. Pass / ATKT / Fail determines eligibility.
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or student ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }} />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="all">All Years</option>
          <option value="1st Year">1st Year (→ 2nd Year)</option>
          <option value="2nd Year">2nd Year (→ 3rd Year)</option>
          <option value="3rd Year">3rd Year (Completed)</option>
        </select>
        <button onClick={fetchAdmissions}
          style={{ padding: '9px 16px', background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((adm) => {
            const ny = nextYear(adm.admissionYear);
            const r  = results[adm._id];
            const sc = r ? statusColor(r.status) : { bg: '#fff', color: '#888', border: '#e0e7ef' };
            const isExpanded = expandedResult === adm._id;

            return (
              <div key={adm._id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${r ? sc.border : '#e0e7ef'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderLeft: `5px solid ${r ? sc.color : '#bbb'}` }}>

                {/* Student header row */}
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h4 style={{ color: '#1565C0', fontSize: 15, margin: 0 }}>{adm.applicantName}</h4>
                      <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1565C0', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{adm.admissionYear}</span>
                      {statusLabel(r)}
                    </div>
                    <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>
                      {adm.email} · {adm.courseType || '—'} · ID: {adm.studentId || '—'}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => { fetchResult(adm); setExpandedResult(adm._id); }}
                      disabled={loadingResult === adm._id}
                      style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: loadingResult === adm._id ? 'not-allowed' : 'pointer', opacity: loadingResult === adm._id ? 0.7 : 1 }}>
                      {loadingResult === adm._id ? '⏳ Loading...' : '📊 Check Marksheet'}
                    </button>
                    {r && (
                      <button
                        onClick={() => setExpandedResult(isExpanded ? null : adm._id)}
                        style={{ background: '#f0f4ff', color: '#1565C0', border: '1px solid #c7d7f9', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {isExpanded ? '▲ Hide' : '▼ View Details'}
                      </button>
                    )}
                    {ny && r && r.status !== 'no_result' && r.status !== 'error' && (
                      <button
                        onClick={() => handlePromote(adm, ny)}
                        disabled={promoting === adm._id}
                        style={{
                          background: r.status === 'fail' ? '#ffebee' : r.status === 'atkt' ? '#fff3e0' : '#2E7D32',
                          color: r.status === 'fail' ? '#C62828' : r.status === 'atkt' ? '#E65100' : '#fff',
                          border: `2px solid ${r.status === 'fail' ? '#ef9a9a' : r.status === 'atkt' ? '#ffb74d' : '#2E7D32'}`,
                          borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                          cursor: promoting === adm._id ? 'not-allowed' : 'pointer',
                          opacity: promoting === adm._id ? 0.7 : 1,
                        }}>
                        {promoting === adm._id ? '⏳...' : `→ Promote to ${ny}`}
                      </button>
                    )}
                    {!ny && <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>✅ Course Completed</span>}
                  </div>
                </div>

                {/* Expanded marksheet */}
                {isExpanded && r && r.status !== 'no_result' && r.status !== 'error' && r.subjects?.length > 0 && (
                  <div style={{ borderTop: `1px solid ${sc.border}`, background: r.status === 'fail' ? '#fff8f8' : r.status === 'atkt' ? '#fffaf5' : '#f8fff8' }}>
                    {/* Result summary bar */}
                    <div style={{ padding: '10px 20px', background: sc.bg, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${sc.border}` }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>
                        📋 Sem {r.semester} — {r.year} Result
                      </span>
                      <span style={{ fontSize: 13, color: '#555' }}>
                        Total: <strong>{r.subjects.reduce((s, sub) => s + (sub.obtainedMarks || 0), 0)}</strong>
                        /{r.subjects.reduce((s, sub) => s + (sub.maxMarks || 0), 0)}
                      </span>
                      <span style={{ fontSize: 13, color: '#555' }}>
                        Percentage: <strong style={{ color: sc.color }}>{r.percentage}%</strong>
                      </span>
                      {r.status === 'atkt' && (
                        <span style={{ fontSize: 13, color: '#E65100', fontWeight: 600 }}>
                          ATKT: {r.atktSubjects.length} subject(s)
                        </span>
                      )}
                    </div>

                    {/* Subject-wise table */}
                    <div style={{ padding: '14px 20px' }}>
                      <div style={{ background: '#1565C0', display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '8px 14px', borderRadius: '8px 8px 0 0', gap: 8 }}>
                        {['Subject', 'Max Marks', 'Obtained', 'Grade', 'Status'].map(h => (
                          <span key={h} style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{h}</span>
                        ))}
                      </div>
                      {r.subjects.map((sub, i) => {
                        const gc = gradeColor(sub.obtainedMarks, sub.maxMarks);
                        const pct = sub.maxMarks > 0 ? Math.round((sub.obtainedMarks / sub.maxMarks) * 100) : 0;
                        const isFail = sub.obtainedMarks < sub.maxMarks * 0.35;
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '9px 14px', gap: 8, alignItems: 'center', background: isFail ? '#fff5f5' : i % 2 === 0 ? '#fafbff' : '#fff', borderBottom: '1px solid #f0f4f8' }}>
                            <span style={{ fontSize: 13, fontWeight: isFail ? 700 : 500, color: isFail ? '#C62828' : '#222' }}>
                              {isFail ? '⚠️ ' : ''}{sub.name || `Subject ${i + 1}`}
                            </span>
                            <span style={{ fontSize: 13, color: '#555' }}>{sub.maxMarks}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isFail ? '#C62828' : '#1565C0' }}>
                              {sub.obtainedMarks} <span style={{ fontSize: 10, color: '#888' }}>({pct}%)</span>
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: gc.bg, color: gc.color, textAlign: 'center' }}>
                              {sub.grade || gc.label}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isFail ? '#C62828' : '#2E7D32' }}>
                              {isFail ? '❌ ATKT' : '✅ Pass'}
                            </span>
                          </div>
                        );
                      })}
                      {/* Summary row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.8fr', padding: '10px 14px', gap: 8, alignItems: 'center', background: sc.bg, borderRadius: '0 0 8px 8px', borderTop: `2px solid ${sc.color}` }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: sc.color }}>TOTAL</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{r.subjects.reduce((s, sub) => s + (sub.maxMarks || 0), 0)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{r.subjects.reduce((s, sub) => s + (sub.obtainedMarks || 0), 0)} <span style={{ fontSize: 10 }}>({r.percentage}%)</span></span>
                        <span></span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: sc.color }}>{r.status.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* ATKT summary */}
                    {r.status === 'atkt' && (
                      <div style={{ margin: '0 20px 14px', background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                        <strong style={{ color: '#E65100' }}>⚠️ ATKT in {r.atktSubjects.length} Subject(s):</strong>
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {r.atktSubjects.map((s, i) => (
                            <span key={i} style={{ background: '#ffebee', color: '#C62828', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: '#555', marginTop: 8, marginBottom: 0 }}>
                          Student must clear these subjects. Can be promoted with ATKT pending.
                        </p>
                      </div>
                    )}

                    {r.status === 'fail' && (
                      <div style={{ margin: '0 20px 14px', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C62828' }}>
                        ❌ <strong>All subjects failed.</strong> Promotion is not recommended. Staff must approve manually if promoting.
                      </div>
                    )}

                    {(r.status === 'pass' || r.status === 'distinction') && (
                      <div style={{ margin: '0 20px 14px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2E7D32' }}>
                        ✅ <strong>All subjects cleared.</strong> Student is eligible for promotion to {ny || 'next year'}.
                      </div>
                    )}
                  </div>
                )}

                {/* No result message */}
                {isExpanded && r && r.status === 'no_result' && (
                  <div style={{ padding: '16px 20px', background: '#f9f9f9', borderTop: '1px solid #eee', fontSize: 13, color: '#888', textAlign: 'center' }}>
                    📭 No marksheet found for this student. Ask the Examination Section to upload the result first.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const PaymentReceiptsTab = ({ themeColor = "#1565C0" }) => { // eslint-disable-line no-unused-vars
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


const _docUrl_id = (f) => (f||'').startsWith('http') ? f : `https://college-management-nnve.onrender.com/uploads/${f}`;
const _getValidPeriod = () => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; };

const printIDCard = (admission) => {
  const photoSrc = admission.studentPhoto ? _docUrl_id(admission.studentPhoto) : null;
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
  const validPeriod = _getValidPeriod();
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
const IDCard = ({ admission }) => { // eslint-disable-line no-unused-vars
  const printRef = useRef();
  if (!admission) return null;

  const photoSrc  = admission.studentPhoto ? _docUrl_id(admission.studentPhoto) : null;
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
  const validPeriod = _getValidPeriod();
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


// ── Document Request Form ────────────────────────────────────────────────────
const DocRequestForm = ({ myAdmission, onSubmitted }) => {
  const [docType, setDocType]   = useState('');
  const [reason, setReason]     = useState('');
  const [urgency, setUrgency]   = useState('normal');
  const [msSem, setMsSem]       = useState('');
  const [msSession, setMsSession] = useState('');
  const [msYear, setMsYear]     = useState(new Date().getFullYear().toString());
  const [msAcadYear, setMsAcadYear] = useState('');
  const [provYear, setProvYear]   = useState('');
  const [provSession, setProvSession] = useState('');
  const [provCourse, setProvCourse] = useState('');
  const [migrateTo, setMigrateTo] = useState('');
  const [migrateFor, setMigrateFor] = useState('');
  // TC / Degree last exam result fields
  const [lastExamYear, setLastExamYear]         = useState('');
  const [lastExamSem, setLastExamSem]           = useState('');
  const [lastExamSession, setLastExamSession]   = useState('');
  const [lastExamResult, setLastExamResult]     = useState('');
  // eslint-disable-next-line no-unused-vars
  const [lastExamPercent, setLastExamPercent]   = useState('');
  // eslint-disable-next-line no-unused-vars
  const [lastExamCollege, setLastExamCollege]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState('');

  // Check if TC already issued
  const tcAlreadyIssued = myAdmission?.tcIssued;

  const handleSubmit = async () => {
    if (!docType) { setMsg('❌ Please select document type.'); return; }
    if (docType === 'TC' && tcAlreadyIssued) { setMsg('❌ TC has already been issued to you. Contact college for re-issue.'); return; }
    if (docType === 'MARKSHEET' && (!msSem || !msSession || !msYear)) { setMsg('❌ Please select semester, session and year for marksheet.'); return; }
    setSubmitting(true);
    try {
      await API.post('/document-requests', {
        documentType: docType, reason, urgency,
        marksheetSemester: docType === 'MARKSHEET' ? msSem : '',
        marksheetSession:  docType === 'MARKSHEET' ? msSession : '',
        marksheetYear:     docType === 'MARKSHEET' ? msYear : '',
        marksheetAcadYear: docType === 'MARKSHEET' ? msAcadYear : '',
        // TC / Degree last exam fields
        lastExamYear:    ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamYear : '',
        lastExamSem:     ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamSem : '',
        lastExamSession: ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamSession : '',
        lastExamResult:  ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamResult : '',
        lastExamPercent: ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamPercent : '',
        lastExamCollege: ['TC','DEGREE','PROVISIONAL_DEGREE'].includes(docType) ? lastExamCollege : '',
        // Provisional/Degree fields
        provYear, provSession, provCourse,
        // Migration fields
        migrateTo, migrateFor,
      });
      setMsg('✅ Request submitted successfully!');
      setDocType(''); setReason(''); setUrgency('normal'); setMsSem(''); setMsSession(''); setMsYear(new Date().getFullYear().toString()); setMsAcadYear('');
      setTimeout(() => setMsg(''), 3000);
      if (onSubmitted) onSubmitted();
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to submit')); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
      <h4 style={{ color: '#1565C0', marginBottom: 16, fontSize: 14 }}>📋 Apply for a Document</h4>

      {/* TC inactive warning */}
      {tcAlreadyIssued && (
        <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#C62828', fontWeight: 600 }}>
          ⚠️ Your Transfer Certificate has been issued. Your account is marked as <strong>Inactive</strong>. Contact the college for any queries.
        </div>
      )}

      {msg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: msg.startsWith('✅')?'#e8f5e9':'#ffebee', color: msg.startsWith('✅')?'#2E7D32':'#C62828', fontWeight: 500 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Document Type *</label>
          <select value={docType} onChange={e => setDocType(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
            <option value="">— Select —</option>
            <option value="TC" disabled={tcAlreadyIssued}>🎓 Transfer Certificate (TC){tcAlreadyIssued?' — Already Issued':''}</option>
            <option value="BONAFIDE">📋 Bonafide Certificate</option>
            <option value="ID_CARD">🪪 ID Card</option>
            <option value="MARKSHEET">📄 Marksheet</option>
            <option value="PROVISIONAL_DEGREE">📜 Provisional Degree Certificate</option>
            <option value="DEGREE">🎓 Degree Certificate</option>
            <option value="MIGRATION">📜 Migration Certificate</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Priority</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
            <option value="normal">Normal</option>
            <option value="urgent">⚡ Urgent</option>
          </select>
        </div>
      </div>

      {/* Marksheet extra fields */}
      {docType === 'MARKSHEET' && (
        <div style={{ background: '#e3f2fd', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1565C0', marginBottom: 10 }}>📄 Marksheet Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Semester *</label>
              <select value={msSem} onChange={e => setMsSem(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                {['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Session *</label>
              <select value={msSession} onChange={e => setMsSession(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                <option value="mar_apr">March / April</option>
                <option value="nov_dec">November / December</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Year *</label>
              <select value={msYear} onChange={e => setMsYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Academic Year *</label>
              <select value={msAcadYear} onChange={e => setMsAcadYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                {['2022-23','2023-24','2024-25','2025-26','2026-27'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Reason / Purpose</label>
        <input type="text" placeholder="e.g. For job application, higher studies..." value={reason} onChange={e => setReason(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
      </div>

      {/* TC / Degree — Last Examination Result */}
      {(docType === 'TC' || docType === 'DEGREE' || docType === 'PROVISIONAL_DEGREE') && (
        <div style={{ background: '#e8eaf6', borderRadius: 10, padding: 16, marginBottom: 14, border: '1px solid #9fa8da' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>
            📊 Last Examination Details <span style={{ fontSize: 11, fontWeight: 400, color: '#555' }}>(Fill as per marksheet)</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Last Semester *</label>
              <select value={lastExamSem} onChange={e => setLastExamSem(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #9fa8da', fontSize: 13 }}>
                <option value="">— Select —</option>
                {['Sem I','Sem II','Sem III','Sem IV','Sem V','Sem VI'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Session *</label>
              <select value={lastExamSession} onChange={e => setLastExamSession(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #9fa8da', fontSize: 13 }}>
                <option value="">— Select —</option>
                <option value="mar_apr">March / April</option>
                <option value="nov_dec">November / December</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Year *</label>
              <select value={lastExamYear} onChange={e => setLastExamYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #9fa8da', fontSize: 13 }}>
                <option value="">— Select —</option>
                {[2020,2021,2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Result</label>
            <select value={lastExamResult} onChange={e => setLastExamResult(e.target.value)}
              style={{ width: '250px', padding: '9px 12px', borderRadius: 8, border: '1px solid #9fa8da', fontSize: 13 }}>
              <option value="">— Select —</option>
              <option value="pass">✅ Pass</option>
              <option value="distinction">🏅 Distinction</option>
              <option value="atkt">⚠️ ATKT</option>
              <option value="fail">❌ Fail</option>
            </select>
          </div>
          <div style={{ marginTop: 10, background: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#3949ab' }}>
            ℹ️ These details will be used by Student Section while issuing your {docType === 'TC' ? 'Transfer Certificate' : 'Degree Certificate'}.
          </div>
        </div>
      )}

            {/* Provisional Degree extra fields */}
      {docType === 'PROVISIONAL_DEGREE' && (
        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32', marginBottom: 10 }}>📜 Provisional Degree Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Passing Year *</label>
              <select value={provYear} onChange={e => setProvYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #a5d6a7', fontSize: 13 }}>
                <option value="">— Select —</option>
                {[2020,2021,2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Exam Session</label>
              <select value={provSession} onChange={e => setProvSession(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #a5d6a7', fontSize: 13 }}>
                <option value="">— Select —</option>
                <option value="mar_apr">March / April</option>
                <option value="nov_dec">November / December</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Degree extra fields */}
      {docType === 'DEGREE' && (
        <div style={{ background: '#e3f2fd', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1565C0', marginBottom: 10 }}>🎓 Degree Certificate Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Passing Year *</label>
              <select value={provYear} onChange={e => setProvYear(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13 }}>
                <option value="">— Select —</option>
                {[2020,2021,2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Course Completed</label>
              <input type="text" placeholder="e.g. Bachelor of Science (B.Sc.)" value={provCourse} onChange={e => setProvCourse(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #90CAF9', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      )}

      {/* Migration extra fields */}
      {docType === 'MIGRATION' && (
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 10 }}>📜 Migration Certificate Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Migrating To (College/University)</label>
              <input type="text" placeholder="e.g. Mumbai University" value={migrateTo} onChange={e => setMigrateTo(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #FFB74D', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Purpose</label>
              <input type="text" placeholder="e.g. Higher Studies, Job etc." value={migrateFor} onChange={e => setMigrateFor(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #FFB74D', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      )}

            {/* TC / Degree — Last Examination Result */}
      

            

      

      

      {/* Workflow info */}
      {docType && (
  <div style={{ marginBottom: 14, background: '#f8faff', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555' }}>
    {docType==='TC' && '📋 Workflow: You → Accounts (fee) → Principal → Student Section (print)'}
    {docType==='BONAFIDE' && '📋 Workflow: You → Student Section → Admin → Principal → Issued'}
    {docType==='ID_CARD' && '📋 Workflow: You → Student Section (issue)'}
    {docType==='MARKSHEET' && '📋 Workflow: You → Exam Section (process & issue)'}
    {docType==='PROVISIONAL_DEGREE' && '📋 Workflow: You → Student Section → Admin → Principal → Issued'}
    {docType==='DEGREE' && '📋 Workflow: You → Student Section → Admin → Principal → Issued'}
    {docType==='MIGRATION' && '📋 Workflow: You → Student Section → Admin → Principal → Issued'}
  </div>
)}

      <button onClick={handleSubmit} disabled={submitting || (docType==='TC' && tcAlreadyIssued)}
        style={{ background: submitting||(!docType)||(docType==='TC'&&tcAlreadyIssued)?'#aaa':'#1565C0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: submitting?'not-allowed':'pointer' }}>
        {submitting ? '⏳ Submitting...' : '📤 Submit Request'}
      </button>
    </div>
  );
};


// ─── Yearly fee structure for student view ───────────────────────────────────
const OFFICIAL_FEES_YEARLY = {
  'B.Sc.': {
    label: 'B.Sc. (Un-aided)',
    years: {
      '1st Year': { total: 30677, sem1: 29927, sem2: 750  },
      '2nd Year': { total: 28957, sem1: 28207, sem2: 750  },
      '3rd Year': { total: 30692, sem1: 27842, sem2: 2850 },
    }
  },
  'B.A.': {
    label: 'B.A. (Un-aided)',
    years: {
      '1st Year': { total: 14627, sem1: 13877, sem2: 750  },
      '2nd Year': { total: 12707, sem1: 11957, sem2: 750  },
      '3rd Year': { total: 14542, sem1: 12092, sem2: 2450 },
    }
  },
};

// ── Course full name helper ──────────────────────────────────────────────────
const getCourseFull = (ct) => {
  const c = (ct||'').toLowerCase();
  if (c.includes('b.sc')||c.includes('bsc')||c.includes('science')) return 'Bachelor of Science (B.Sc.)';
  if (c.includes('b.a')||c.includes('ba')||c.includes('arts')) return 'Bachelor of Arts (B.A.)';
  return ct||'—';
};


// ─── Last Degree / TC Tab ────────────────────────────────────────────────────
const LastDegreeTab = ({ myAdmission, user }) => {
  const [activeSection, setActiveSection] = useState('result'); // 'result' | 'provisional' | 'degree' | 'migration'
  const [resultForm, setResultForm] = useState({
    semester: '', year: new Date().getFullYear().toString(), examSession: '',
    subjects: [{ name: '', maxMarks: 100, obtainedMarks: '' }],
  });
  const [provForm, setProvForm] = useState({ rollNo: '', examYear: '', examSession: '', percentage: '', remarks: '' });
  const [degForm, setDegForm]   = useState({ rollNo: '', convocationYear: '', percentage: '', honours: '' });
  const [migForm, setMigForm]   = useState({ reason: '', destinationCollege: '', destinationCity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [myResults, setMyResults] = useState([]);

  React.useEffect(() => {
    API.get('/results/my').then(r => setMyResults(r.data.results || [])).catch(() => {});
  }, []);

  const addSubject = () => setResultForm(f => ({ ...f, subjects: [...f.subjects, { name: '', maxMarks: 100, obtainedMarks: '' }] }));
  const removeSubject = (i) => setResultForm(f => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));
  const updateSubject = (i, field, val) => setResultForm(f => {
    const subs = [...f.subjects]; subs[i] = { ...subs[i], [field]: val }; return { ...f, subjects: subs };
  });

  const handleResultSubmit = async () => {
    if (!resultForm.semester || !resultForm.year || !resultForm.examSession) { setMsg('❌ Please fill semester, year and session.'); return; }
    if (resultForm.subjects.some(s => !s.name || s.obtainedMarks === '')) { setMsg('❌ Please fill all subject names and marks.'); return; }
    setSubmitting(true);
    try {
      const subjects = resultForm.subjects.map(s => ({ name: s.name, maxMarks: Number(s.maxMarks), obtainedMarks: Number(s.obtainedMarks) }));
      const totalMax  = subjects.reduce((s, x) => s + x.maxMarks, 0);
      const totalObt  = subjects.reduce((s, x) => s + x.obtainedMarks, 0);
      const percentage = totalMax > 0 ? Math.round((totalObt / totalMax) * 100 * 10) / 10 : 0;
      const atkt = subjects.filter(s => s.obtainedMarks < s.maxMarks * 0.35).length;
      const result = atkt === subjects.length ? 'fail' : atkt > 0 ? 'atkt' : percentage >= 60 ? 'distinction' : 'pass';
      await API.post('/results/student-submit', {
        semester: resultForm.semester,
        year: Number(resultForm.year),
        examSession: resultForm.examSession,
        subjects, percentage,
        totalMarks: totalMax, obtainedMarks: totalObt, result,
        studentEmail: user?.email,
        studentName: myAdmission?.applicantName || user?.name,
      });
      setMsg('✅ Result submitted! Exam Section will verify it.');
      setResultForm({ semester: '', year: new Date().getFullYear().toString(), examSession: '', subjects: [{ name: '', maxMarks: 100, obtainedMarks: '' }] });
      API.get('/results/my').then(r => setMyResults(r.data.results || [])).catch(() => {});
    } catch(e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSubmitting(false); }
  };

  const handleDocSubmit = async (docType, extraData) => {
    setSubmitting(true);
    try {
      await API.post('/document-requests', { documentType: docType, reason: extraData.reason || '', urgency: 'normal', ...extraData });
      setMsg(`✅ ${docType === 'PROVISIONAL_DEGREE' ? 'Provisional Degree' : docType === 'DEGREE' ? 'Degree' : 'Migration'} request submitted!`);
      if (docType === 'PROVISIONAL_DEGREE') setProvForm({ rollNo: '', examYear: '', examSession: '', percentage: '', remarks: '' });
      if (docType === 'DEGREE') setDegForm({ rollNo: '', convocationYear: '', percentage: '', honours: '' });
      if (docType === 'MIGRATION') setMigForm({ reason: '', destinationCollege: '', destinationCity: '' });
    } catch(e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSubmitting(false); }
  };

  const sections = [
    { id: 'result',      label: '📊 Last Year Result', color: '#1565C0' },
    { id: 'provisional', label: '📜 Provisional Degree', color: '#7B1FA2' },
    { id: 'degree',      label: '🎓 Degree Certificate', color: '#2E7D32' },
    { id: 'migration',   label: '📦 Migration Certificate', color: '#E65100' },
  ];

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 };

  return (
    <div>
      <h3 style={{ color: '#1565C0', marginBottom: 4 }}>🎓 Last Degree / TC</h3>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Submit your last year examination result and apply for degree/migration certificates.</p>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2E7D32' : '#C62828', fontWeight: 500 }}>
          {msg}
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f0f4f8', borderRadius: 12, padding: 5, flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => { setActiveSection(s.id); setMsg(''); }}
            style={{ flex: 1, minWidth: 120, padding: '9px 12px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeSection === s.id ? s.color : 'transparent',
              color: activeSection === s.id ? '#fff' : '#555' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── RESULT SECTION ── */}
      {activeSection === 'result' && (
        <div>
          {/* Submitted results */}
          {myResults.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: '#1565C0', marginBottom: 12, fontSize: 14 }}>📋 My Submitted Results</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myResults.map((r, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderLeft: `4px solid ${r.result==='pass'||r.result==='distinction'?'#2E7D32':'#C62828'}` }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#1565C0', fontSize: 14 }}>Semester {r.semester} — {r.year}</span>
                      <span style={{ marginLeft: 10, fontSize: 12, color: '#888' }}>{r.examSession}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1565C0' }}>{r.percentage}%</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: (r.result==='pass'||r.result==='distinction') ? '#e8f5e9' : (r.result==='atkt') ? '#fff3e0' : '#ffebee', color: (r.result==='pass'||r.result==='distinction') ? '#2E7D32' : (r.result==='atkt') ? '#E65100' : '#C62828' }}>
                        {r.result === 'distinction' ? '🏅 Distinction' : r.result === 'pass' ? '✅ Pass' : r.result === 'atkt' ? '⚠️ ATKT' : '❌ Fail'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add result form */}
          <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, padding: 20 }}>
            <h4 style={{ color: '#1565C0', marginBottom: 16, fontSize: 14 }}>➕ Add Last Year Examination Result</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Semester *</label>
                <select value={resultForm.semester} onChange={e => setResultForm(f => ({ ...f, semester: e.target.value }))} style={inputStyle}>
                  <option value="">— Select —</option>
                  {['I','II','III','IV','V','VI'].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Exam Session *</label>
                <select value={resultForm.examSession} onChange={e => setResultForm(f => ({ ...f, examSession: e.target.value }))} style={inputStyle}>
                  <option value="">— Select —</option>
                  <option value="mar_apr">March / April</option>
                  <option value="nov_dec">November / December</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year *</label>
                <select value={resultForm.year} onChange={e => setResultForm(f => ({ ...f, year: e.target.value }))} style={inputStyle}>
                  {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Subjects */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Subjects & Marks *</label>
                <button onClick={addSubject} style={{ background: '#e3f2fd', color: '#1565C0', border: '1px solid #90CAF9', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Subject</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', gap: 6, background: '#f0f4f8', padding: '6px 10px', borderRadius: 8, marginBottom: 6 }}>
                {['Subject Name','Max Marks','Obtained Marks',''].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{h}</span>)}
              </div>
              {resultForm.subjects.map((sub, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', gap: 6, marginBottom: 6 }}>
                  <input type="text" placeholder={`Subject ${i+1}`} value={sub.name} onChange={e => updateSubject(i, 'name', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} />
                  <input type="number" value={sub.maxMarks} onChange={e => updateSubject(i, 'maxMarks', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} />
                  <input type="number" placeholder="0" value={sub.obtainedMarks} onChange={e => updateSubject(i, 'obtainedMarks', e.target.value)} style={{ ...inputStyle, padding: '8px 10px', borderColor: sub.obtainedMarks !== '' && Number(sub.obtainedMarks) < sub.maxMarks * 0.35 ? '#ef9a9a' : '#ddd' }} />
                  {i > 0 && <button onClick={() => removeSubject(i)} style={{ background: '#ffebee', color: '#C62828', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>}
                </div>
              ))}
              {/* Live percentage */}
              {resultForm.subjects.some(s => s.obtainedMarks !== '') && (() => {
                const totalMax = resultForm.subjects.reduce((s, x) => s + Number(x.maxMarks || 0), 0);
                const totalObt = resultForm.subjects.reduce((s, x) => s + Number(x.obtainedMarks || 0), 0);
                const pct = totalMax > 0 ? Math.round((totalObt / totalMax) * 1000) / 10 : 0;
                const atkt = resultForm.subjects.filter(s => s.obtainedMarks !== '' && Number(s.obtainedMarks) < Number(s.maxMarks) * 0.35).length;
                const res = atkt === resultForm.subjects.length ? 'fail' : atkt > 0 ? 'atkt' : pct >= 60 ? 'distinction' : 'pass';
                const resColor = res === 'pass' || res === 'distinction' ? '#2E7D32' : res === 'atkt' ? '#E65100' : '#C62828';
                return (
                  <div style={{ background: '#f8faff', border: '1px solid #e0e7ef', borderRadius: 8, padding: '8px 14px', marginTop: 8, display: 'flex', gap: 20, fontSize: 13 }}>
                    <span>Total: <strong>{totalObt}/{totalMax}</strong></span>
                    <span>Percentage: <strong style={{ color: resColor }}>{pct}%</strong></span>
                    <span>Result: <strong style={{ color: resColor }}>{res.toUpperCase()}</strong></span>
                  </div>
                );
              })()}
            </div>

            <button onClick={handleResultSubmit} disabled={submitting}
              style={{ background: submitting ? '#aaa' : '#1565C0', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '⏳ Submitting...' : '📤 Submit Result'}
            </button>
          </div>
        </div>
      )}

      {/* ── PROVISIONAL DEGREE ── */}
      {activeSection === 'provisional' && (
        <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, padding: 20 }}>
          <h4 style={{ color: '#7B1FA2', marginBottom: 6, fontSize: 15 }}>📜 Provisional Degree Certificate Application</h4>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Apply for provisional degree certificate after passing final year examination.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input type="text" placeholder="Your exam roll number" value={provForm.rollNo} onChange={e => setProvForm(f => ({...f, rollNo: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Exam Year</label>
              <select value={provForm.examYear} onChange={e => setProvForm(f => ({...f, examYear: e.target.value}))} style={inputStyle}>
                <option value="">— Select Year —</option>
                {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exam Session</label>
              <select value={provForm.examSession} onChange={e => setProvForm(f => ({...f, examSession: e.target.value}))} style={inputStyle}>
                <option value="">— Select —</option>
                <option value="mar_apr">March / April</option>
                <option value="nov_dec">November / December</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Final Percentage / CGPA</label>
              <input type="text" placeholder="e.g. 72.5% or 7.8 CGPA" value={provForm.percentage} onChange={e => setProvForm(f => ({...f, percentage: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Purpose / Remarks</label>
            <input type="text" placeholder="e.g. For job application, higher studies admission..." value={provForm.remarks} onChange={e => setProvForm(f => ({...f, remarks: e.target.value}))} style={inputStyle} />
          </div>
          <div style={{ background: '#f3e5f5', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#7B1FA2' }}>
            📋 Workflow: You → Student Section → Admin → Principal → Approved → Issued
          </div>
          <button onClick={() => handleDocSubmit('PROVISIONAL_DEGREE', { reason: provForm.remarks || 'Provisional Degree Certificate', provForm })} disabled={submitting}
            style={{ background: submitting ? '#aaa' : '#7B1FA2', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '⏳...' : '📤 Submit Application'}
          </button>
        </div>
      )}

      {/* ── DEGREE CERTIFICATE ── */}
      {activeSection === 'degree' && (
        <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, padding: 20 }}>
          <h4 style={{ color: '#2E7D32', marginBottom: 6, fontSize: 15 }}>🎓 Degree Certificate Application</h4>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Apply for original degree certificate after convocation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input type="text" placeholder="Your exam roll number" value={degForm.rollNo} onChange={e => setDegForm(f => ({...f, rollNo: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Convocation Year</label>
              <select value={degForm.convocationYear} onChange={e => setDegForm(f => ({...f, convocationYear: e.target.value}))} style={inputStyle}>
                <option value="">— Select Year —</option>
                {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Final Percentage / CGPA</label>
              <input type="text" placeholder="e.g. 72.5% or 7.8 CGPA" value={degForm.percentage} onChange={e => setDegForm(f => ({...f, percentage: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Honours / Distinction (if any)</label>
              <input type="text" placeholder="e.g. First Class with Distinction" value={degForm.honours} onChange={e => setDegForm(f => ({...f, honours: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div style={{ background: '#e8f5e9', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#2E7D32' }}>
            📋 Workflow: You → Student Section → Admin → Principal → Approved → Issued
          </div>
          <button onClick={() => handleDocSubmit('DEGREE', { reason: 'Degree Certificate — Convocation ' + degForm.convocationYear, degForm })} disabled={submitting}
            style={{ background: submitting ? '#aaa' : '#2E7D32', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '⏳...' : '📤 Submit Application'}
          </button>
        </div>
      )}

      {/* ── MIGRATION ── */}
      {activeSection === 'migration' && (
        <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, padding: 20 }}>
          <h4 style={{ color: '#E65100', marginBottom: 6, fontSize: 15 }}>📦 Migration Certificate Application</h4>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Apply for migration certificate to join another university or institution.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Destination College / University</label>
              <input type="text" placeholder="Name of the college/university you are joining" value={migForm.destinationCollege} onChange={e => setMigForm(f => ({...f, destinationCollege: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" placeholder="City of destination college" value={migForm.destinationCity} onChange={e => setMigForm(f => ({...f, destinationCity: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Reason for Migration *</label>
            <input type="text" placeholder="e.g. Admission in PG course, job transfer, family relocation..." value={migForm.reason} onChange={e => setMigForm(f => ({...f, reason: e.target.value}))} style={inputStyle} />
          </div>
          <div style={{ background: '#fff3e0', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#E65100' }}>
            📋 Workflow: You → Student Section → Admin → Principal → Approved → Issued
          </div>
          <button onClick={() => handleDocSubmit('MIGRATION', { reason: migForm.reason || 'Migration Certificate', migForm })} disabled={submitting || !migForm.reason}
            style={{ background: submitting || !migForm.reason ? '#aaa' : '#E65100', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: submitting || !migForm.reason ? 'not-allowed' : 'pointer' }}>
            {submitting ? '⏳...' : '📤 Submit Application'}
          </button>
        </div>
      )}
    </div>
  );
};


const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [profileTab, setProfileTab] = useState('personal');
  const [notices, setNotices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myAdmission, setMyAdmission] = useState(null);
  const [admissionLoading, setAdmissionLoading] = useState(true);


  const [results, setResults] = useState([]);
  const [resultsLoading] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);   // published forms matching this student
  // eslint-disable-next-line no-unused-vars
  const [examFormRequests, setExamFormRequests] = useState([]);
  const [examFormSubmitting, setExamFormSubmitting] = useState('');
  const [examFormMsg, setExamFormMsg] = useState('');

  const fetchExamForms = () => {
    API.get('/results/exam-form/available')
      .then(res => setAvailableForms(res.data.forms || []))
      .catch(() => {});
    API.get('/results/exam-form/my')
      .then(r => setExamFormRequests(r.data.requests || []))
      .catch(() => {});
  };

  useEffect(() => {
    API.get('/notices').then(res => setNotices(res.data.notices || []));
    if (user?.email) {
      API.get(`/admissions/by-email/${user.email}`)
        .then(res => {
          if (res.data.success) setMyAdmission(res.data.admission);
          setAdmissionLoading(false);
        })
        .catch(() => setAdmissionLoading(false));
    } else {
      setAdmissionLoading(false);
    }
    // Fetch results
    API.get('/results/my')
      .then(res => setResults(res.data.results || []))
      .catch(() => {});
    API.get('/document-requests/my')
      .then(r => setMyRequests(r.data.requests || []))
      .catch(() => {});
    // Fetch published exam forms available to this student + own requests
    fetchExamForms();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };


  const tabs = [
    { id: 'home',          label: '🏠 Dashboard' },
    { id: 'application',   label: '📋 My Application' },
    { id: 'profile',       label: '👤 My Profile' },
    { id: 'fees',          label: '💰 My Fees' },
    { id: 'documents',     label: '📄 Request Documents' },
    { id: 'results',       label: '🎓 Results' },
    { id: 'examform',      label: '📝 Exam Form' },
    { id: 'scholarship',   label: '🏅 Scholarship' },
    { id: 'attendance',    label: '📊 Attendance' },
    { id: 'last_degree',   label: '🎓 Last Degree / TC' },
    { id: 'academic_year', label: '📅 Academic Year' },
    { id: 'notices',       label: '📢 Notices' },
  ];

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#ffebee', color: '#C62828', label: '❌ Rejected' };
    return { bg: '#fff3e0', color: '#E65100', label: '⏳ Pending' };
  };

  const getStatusMessage = (status) => {
    if (status === 'approved') return 'Congratulations! Your admission has been approved.';
    if (status === 'rejected') return 'Unfortunately your application was not approved. Please contact the college office.';
    return 'Your application is being reviewed. Please check back later.';
  };

  const getStatusEmoji = (status) => {
    if (status === 'approved') return '🎉';
    if (status === 'rejected') return '😞';
    return '⏳';
  };

  const docUrl = (f) => (f || '').startsWith('http')
    ? f
    : `https://college-management-nnve.onrender.com/uploads/${f}`;

  const docList = [
    { key: 'studentPhoto', label: '📸 Student Photo' },
    { key: 'aadharPhoto', label: '🪪 Aadhar Card' },
    { key: 'sscMarksheet', label: '📄 SSC Marksheet' },
    { key: 'hscMarksheet', label: '📄 HSC Marksheet' },
    { key: 'gapCertificate', label: '📅 Gap Certificate' },
    { key: 'casteCertificate', label: '📋 Caste Certificate' },
    { key: 'casteValidityCertificate', label: '✅ Caste Validity' },
  ];
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/college-logo.png" alt="College Logo" className="sidebar-logo-img" />
          <div className="sidebar-text">
            <h3>Late Kalpana Chawla Women's Senior College</h3>
            <p>Senior Science & Arts College, Gangakhed</p>
          </div>
    
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="user-info"><span>👋 Welcome, {user?.name}</span></div>
        </div>

        <div className="dashboard-content">

          {/* ============ HOME TAB ============ */}
          {activeTab === 'home' && (
            <div>
              {/* ── MIT/JUNO style Profile Card ── */}
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '28px 24px',
                marginBottom: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                textAlign: 'center', border: '1px solid #e3f2fd'
              }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  margin: '0 auto 14px', overflow: 'hidden',
                  border: '4px solid #1565C0', background: '#e3f2fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {myAdmission?.studentPhoto ? (
                    <img src={docUrl(myAdmission.studentPhoto)} alt="Student"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>👩‍🎓</span>
                  )}
                </div>

                <h2 style={{ color: '#0d1b3e', margin: '0 0 4px', fontSize: '1.5rem' }}>
                  {myAdmission?.applicantName || user?.name}
                </h2>

                {myAdmission?.studentId ? (
                  <div style={{
                    display: 'inline-block', background: '#e8f5e9', color: '#2E7D32',
                    padding: '5px 16px', borderRadius: '20px', fontSize: '14px',
                    fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px',
                    margin: '4px 0 14px'
                  }}>
                    🎓 ID: {myAdmission.studentId}
                  </div>
                ) : (
                  <div style={{
                    display: 'inline-block', background: '#fff3e0', color: '#E65100',
                    padding: '5px 16px', borderRadius: '20px', fontSize: '13px',
                    fontWeight: '600', margin: '4px 0 14px'
                  }}>
                    ⏳ Student ID Pending
                  </div>
                )}

                <div style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                  gap: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '16px'
                }}>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>COURSE</p>
                    <p style={{ fontSize: '14px', color: '#1565C0', fontWeight: '600', margin: '2px 0 0' }}>
                      {myAdmission?.courseType || myAdmission?.hscStream || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#e8f5e9', borderRadius: '10px', border: '1px solid #a5d6a7' }}>
                    <p style={{ fontSize: '11px', color: '#2E7D32', margin: 0, fontWeight: '700' }}>CURRENT YEAR</p>
                    <p style={{ fontSize: '14px', color: '#1b5e20', fontWeight: '700', margin: '2px 0 0' }}>
                      {myAdmission?.admissionYear || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>EMAIL</p>
                    <p style={{ fontSize: '13px', color: '#333', fontWeight: '500', margin: '2px 0 0', wordBreak: 'break-all' }}>
                      {myAdmission?.email || user?.email}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>PHONE</p>
                    <p style={{ fontSize: '14px', color: '#333', fontWeight: '500', margin: '2px 0 0' }}>
                      {myAdmission?.phone || user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div style={{ minWidth: '140px', padding: '8px 14px', background: '#f8faff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>STATUS</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '2px 0 0',
                      color: myAdmission?.status === 'approved' ? '#2E7D32' : '#E65100' }}>
                      {myAdmission?.status === 'approved' ? '✅ Approved' : '⏳ Under Review'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dash-cards">
                <div className="dash-card blue">
                  <div className="dash-card-icon">📋</div>
                  <div>
                    <h3>Application</h3>
                    <p style={{ color: myAdmission ? getStatusStyle(myAdmission.status).color : '#888', fontWeight: '500', fontSize: '13px' }}>
                      {myAdmission ? getStatusStyle(myAdmission.status).label : 'Not Applied'}
                    </p>
                  </div>
                </div>
                <div className="dash-card green">
                  <div className="dash-card-icon">💰</div>
                  <div>
                    <h3>Fees</h3>
                    <p>{myAdmission?.fees ? `₹${myAdmission.fees}` : 'Not Set'}</p>
                  </div>
                </div>
                <div className="dash-card orange">
                  <div className="dash-card-icon">📢</div>
                  <div>
                    <h3>Notices</h3>
                    <p>{notices.length} notices</p>
                  </div>
                </div>
              </div>

              {myAdmission && (
                <div className="recent-section" style={{ marginTop: '20px' }}>
                  <h3>My Application Status</h3>
                  <div style={{ padding: '8px 0' }}>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Applicant Name</span>
                      <span className="fees-info-value">{myAdmission.applicantName}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Course Applied</span>
                      <span className="fees-info-value">{myAdmission.course?.name || getCourseFull(myAdmission.courseType) || 'N/A'}</span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Status</span>
                      <span style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                        background: getStatusStyle(myAdmission.status).bg,
                        color: getStatusStyle(myAdmission.status).color,
                      }}>
                        {getStatusStyle(myAdmission.status).label}
                      </span>
                    </div>
                    <div className="fees-info-row">
                      <span className="fees-info-label">Fees</span>
                      <span className="fees-info-value">
                        {myAdmission.fees ? `₹${myAdmission.fees}` : 'Not set by college yet'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {myAdmission && (
                <div className="recent-section" style={{ marginTop: '20px' }}>
                  <h3>📊 Admission Approval Progress</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '12px 0', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600' }}>📝 Submitted</span>
                    <span>→</span>
                    <span style={{
                      color: (myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '#2E7D32' : '#999',
                      fontWeight: (myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '600' : '400'
                    }}>
                      {(myAdmission.studentSectionStatus === 'verified' || myAdmission.status === 'approved') ? '✅' : '⏳'} Student Section
                    </span>
                    <span>→</span>
                    <span style={{
                      color: myAdmission.status === 'approved' ? '#2E7D32' : '#999',
                      fontWeight: myAdmission.status === 'approved' ? '600' : '400'
                    }}>
                      {myAdmission.status === 'approved' ? '✅' : '⏳'} Principal
                    </span>
                    <span>→</span>
                    <span style={{
                      color: myAdmission.status === 'approved' ? '#2E7D32' : '#999',
                      fontWeight: myAdmission.status === 'approved' ? '600' : '400'
                    }}>
                      {myAdmission.status === 'approved' ? '✅ Approved' : '⏳ Approved'}
                    </span>
                  </div>
                  {myAdmission.rejectionReason && (
                    <div style={{ background: '#ffebee', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#C62828' }}>
                      <strong>❌ Rejection Reason:</strong> {myAdmission.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {!myAdmission && !admissionLoading && (
                <div className="recent-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                  <h3>📝 Complete Your Admission</h3>
                  <p style={{ color: '#666', margin: '12px 0' }}>You haven't submitted your admission form yet.</p>
                  <button onClick={() => navigate('/admissions?tab=apply')}
                    style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    📝 Complete Your Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============ APPLICATION TAB ============ */}
          {activeTab === 'application' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>My Application Details</h3>

              {admissionLoading && (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading...</h3></div>
              )}

              {!admissionLoading && !myAdmission && (
                <div style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📝</div>
                  <h2 style={{ color: 'white', marginBottom: '12px' }}>Complete Your Profile</h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '24px' }}>
                    Welcome to LKCWSC! Please complete your admission profile.
                  </p>
                  <a href="/admissions?tab=apply" onClick={(e) => { e.preventDefault(); navigate('/admissions?tab=apply'); }}
                    style={{ display: 'inline-block', background: 'white', color: '#1565C0', padding: '14px 36px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
                    ✨ Complete Your Profile →
                  </a>
                </div>
              )}

              {!admissionLoading && myAdmission && (
                <div>
                  <div style={{ padding: '20px 24px', borderRadius: '12px', marginBottom: '24px', background: getStatusStyle(myAdmission.status).bg, border: `2px solid ${getStatusStyle(myAdmission.status).color}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{getStatusEmoji(myAdmission.status)}</div>
                    <div>
                      <h3 style={{ color: getStatusStyle(myAdmission.status).color }}>
                        Application {myAdmission.status === 'approved' ? 'Approved!' : myAdmission.status === 'rejected' ? 'Rejected' : 'Under Review'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#555' }}>{getStatusMessage(myAdmission.status)}</p>
                    </div>
                  </div>

                  {myAdmission.studentId && (
                    <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #2E7D32' }}>
                      <p style={{ fontSize: '13px', color: '#2E7D32', marginBottom: '4px' }}>🎓 Your Student ID:</p>
                      <h3 style={{ color: '#2E7D32', fontFamily: 'monospace', letterSpacing: '1px' }}>{myAdmission.studentId}</h3>
                    </div>
                  )}

                  <div className="fees-card">
                    <h3>Personal Information</h3>
                    <div className="fees-info-row"><span className="fees-info-label">Full Name</span><span className="fees-info-value">{myAdmission.applicantName}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Email</span><span className="fees-info-value">{myAdmission.email}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Phone</span><span className="fees-info-value">{myAdmission.phone}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Category</span><span className="fees-info-value">{myAdmission.category ? myAdmission.category.toUpperCase() : 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">Course Applied</span><span className="fees-info-value">{myAdmission.course?.name || getCourseFull(myAdmission.courseType) || 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">SSC Percentage</span><span className="fees-info-value">{myAdmission.sscPercentage ? `${myAdmission.sscPercentage}%` : 'N/A'}</span></div>
                    <div className="fees-info-row"><span className="fees-info-label">HSC Percentage</span><span className="fees-info-value">{myAdmission.hscPercentage ? `${myAdmission.hscPercentage}%` : 'N/A'}</span></div>
                  </div>

                  <div className="fees-card" style={{ marginTop: '20px' }}>
                    <h3>Uploaded Documents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {docList.map(doc => {
                        if (!myAdmission[doc.key]) return null;
                        return (
                          <div key={doc.key} style={{ background: '#f8faff', border: '1px solid #e3f2fd', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                            <img src={docUrl(myAdmission[doc.key])} alt={doc.label}
                              style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                              onError={(e) => { e.target.style.display = 'none'; }} />
                            <p style={{ fontSize: '11px', color: '#1565C0', fontWeight: '500', marginBottom: '6px' }}>{doc.label}</p>
                            <a href={docUrl(myAdmission[doc.key])} target="_blank" rel="noreferrer"
                              style={{ fontSize: '11px', color: '#1565C0', textDecoration: 'underline' }}>View Full</a>
                          </div>
                        );
                      })}
                    </div>
                    {docList.every(doc => !myAdmission[doc.key]) && (
                      <p className="empty-msg">No documents uploaded</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ PROFILE TAB ============ */}
          {activeTab === 'profile' && (() => {
  const profileTabs = [
    { id: 'personal',  label: '👤 Personal' },
    { id: 'academic',  label: '🎓 Current Academic' },
    { id: 'previous',  label: '📚 Previous Academic' },
    { id: 'address',   label: '🏠 Address' },
    { id: 'bank',      label: '🏦 Bank Details' },
  ];
  const FieldRow = ({ label, value, mono }) => !value || value === '—' ? null : (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
      <span style={{ color:'#888', fontWeight:600, minWidth:130, flexShrink:0 }}>{label}</span>
      <span style={{ color:'#222', textAlign:'right', wordBreak:'break-all', fontFamily: mono?'monospace':'inherit', fontWeight: mono?700:400 }}>{value}</span>
    </div>
  );
  return (
    <div>
      <h3 style={{ marginBottom:16, color:'#1565C0' }}>👤 My Profile</h3>
      {!myAdmission ? (
        <div className="empty-state"><div className="empty-icon">👤</div><h3>No profile data</h3></div>
      ) : (
        <>
          {/* Top card — photo + name + ID */}
          <div style={{ background:'linear-gradient(135deg,#1565C0,#0d47a1)', borderRadius:16, padding:'20px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', marginBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.5)', overflow:'hidden', background:'#e3f2fd', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {myAdmission.studentPhoto
                ? <img src={docUrl(myAdmission.studentPhoto)} alt="Student" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                : <span style={{ fontSize:'2rem' }}>👩‍🎓</span>}
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <h2 style={{ color:'#fff', margin:'0 0 4px', fontSize:'1.3rem' }}>{myAdmission.applicantName || user?.name}</h2>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                {myAdmission.studentId
                  ? <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700, fontFamily:'monospace' }}>🎓 {myAdmission.studentId}</span>
                  : <span style={{ background:'#fff3e0', color:'#E65100', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>⏳ ID Pending</span>}
                <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', padding:'3px 12px', borderRadius:20, fontSize:12 }}>{getCourseFull(myAdmission.courseType)} · {myAdmission.admissionYear}</span>
                <span style={{ background: myAdmission.status==='approved'?'#e8f5e9':'#fff3e0', color: myAdmission.status==='approved'?'#2E7D32':'#E65100', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {myAdmission.status==='approved'?'✅ Approved':'⏳ Under Review'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-tab navigation */}
          <div style={{ display:'flex', gap:4, marginBottom:20, background:'#f0f4f8', borderRadius:12, padding:5, flexWrap:'wrap' }}>
            {profileTabs.map(t => (
              <button key={t.id} onClick={() => setProfileTab(t.id)}
                style={{ flex:1, minWidth:100, padding:'8px 10px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                  background: profileTab===t.id ? '#1565C0' : 'transparent',
                  color: profileTab===t.id ? '#fff' : '#555' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PERSONAL ── */}
          {profileTab === 'personal' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:'#1565C0', marginBottom:16, fontSize:15, borderBottom:'2px solid #e3f2fd', paddingBottom:8 }}>👤 Personal Details</h4>
              <FieldRow label="Full Name"       value={myAdmission.applicantName} />
              <FieldRow label="Father's Name"   value={myAdmission.fatherName} />
              <FieldRow label="Mother's Name"   value={myAdmission.motherName} />
              <FieldRow label="Date of Birth"   value={myAdmission.dateOfBirth ? new Date(myAdmission.dateOfBirth).toLocaleDateString('en-IN') : '—'} />
              <FieldRow label="Gender"          value={myAdmission.gender} />
              <FieldRow label="Blood Group"     value={myAdmission.bloodGroup} />
              <FieldRow label="Religion"        value={myAdmission.religion} />
              <FieldRow label="Category"        value={myAdmission.category?.toUpperCase()} />
              <FieldRow label="Caste"           value={myAdmission.caste} />
              <FieldRow label="Marital Status"  value={myAdmission.isMarried ? 'Married' : 'Unmarried'} />
              <FieldRow label="Mobile"          value={myAdmission.phone} />
              <FieldRow label="Parent Phone"    value={myAdmission.parentPhone || myAdmission.fatherPhone || myAdmission.motherPhone} />
              <FieldRow label="Email"           value={myAdmission.email} />
              <FieldRow label="Aadhar No."      value={myAdmission.aadharNumber} mono />
              <FieldRow label="Family Income"   value={myAdmission.familyIncome ? `₹${myAdmission.familyIncome}` : '—'} />
              <FieldRow label="Guardian Name"   value={myAdmission.guardianName} />
              <FieldRow label="Guardian Phone"  value={myAdmission.guardianPhone} />
            </div>
          )}

          {/* ── CURRENT ACADEMIC ── */}
          {profileTab === 'academic' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:'#1565C0', marginBottom:16, fontSize:15, borderBottom:'2px solid #e3f2fd', paddingBottom:8 }}>🎓 Current Academic Details</h4>
              <FieldRow label="Student ID"       value={myAdmission.studentId} mono />
              <FieldRow label="PRN Number"       value={myAdmission.prnNumber} mono />
              <FieldRow label="ABC / APAR ID"    value={myAdmission.aparIdNumber} mono />
              <FieldRow label="Course"           value={getCourseFull(myAdmission.courseType)} />
              <FieldRow label="Preferred Subject" value={myAdmission.preferredSubject} />
              <FieldRow label="Admission Year"   value={myAdmission.admissionYear} />
              <FieldRow label="Academic Year"    value={myAdmission.academicYear} />
              <FieldRow label="Admission Type"   value={myAdmission.admissionType} />
              <FieldRow label="Roll Number"      value={myAdmission.rollNumber} mono />
            </div>
          )}

          {/* ── PREVIOUS ACADEMIC ── */}
          {profileTab === 'previous' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:'#1565C0', marginBottom:16, fontSize:15, borderBottom:'2px solid #e3f2fd', paddingBottom:8 }}>📚 Previous Academic Details</h4>
              <div style={{ marginBottom:16 }}>
                <div style={{ background:'#e3f2fd', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, color:'#1565C0', marginBottom:10 }}>🏫 SSC (10th)</div>
                <FieldRow label="School Name"   value={myAdmission.sscSchoolName} />
                <FieldRow label="Board"         value={myAdmission.sscBoard} />
                <FieldRow label="Year"          value={myAdmission.sscPassingYear} />
                <FieldRow label="Percentage"    value={myAdmission.sscPercentage ? `${myAdmission.sscPercentage}%` : '—'} />
                <FieldRow label="Seat No."      value={myAdmission.sscSeatNumber} mono />
              </div>
              <div>
                <div style={{ background:'#e8f5e9', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, color:'#2E7D32', marginBottom:10 }}>🏫 HSC (12th)</div>
                <FieldRow label="College Name"  value={myAdmission.hscCollegeName} />
                <FieldRow label="Board"         value={myAdmission.hscBoard} />
                <FieldRow label="Stream"        value={myAdmission.hscStream} />
                <FieldRow label="Year"          value={myAdmission.hscPassingYear} />
                <FieldRow label="Percentage"    value={myAdmission.hscPercentage ? `${myAdmission.hscPercentage}%` : '—'} />
                <FieldRow label="Seat No."      value={myAdmission.hscSeatNumber} mono />
              </div>
            </div>
          )}

          {/* ── ADDRESS ── */}
          {profileTab === 'address' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:'#1565C0', marginBottom:16, fontSize:15, borderBottom:'2px solid #e3f2fd', paddingBottom:8 }}>🏠 Address Details</h4>
              <FieldRow label="House No."      value={myAdmission.houseNumber} />
              <FieldRow label="Street / Area"  value={myAdmission.streetArea} />
              <FieldRow label="City / Village" value={myAdmission.cityTownVillage} />
              <FieldRow label="Taluka"         value={myAdmission.taluka} />
              <FieldRow label="District"       value={myAdmission.district} />
              <FieldRow label="State"          value={myAdmission.state} />
              <FieldRow label="Pin Code"       value={myAdmission.pinCode} mono />
              {myAdmission.houseNumber && (
                <div style={{ marginTop:14, background:'#f8faff', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#555', lineHeight:1.6 }}>
                  📍 {[myAdmission.houseNumber, myAdmission.streetArea, myAdmission.cityTownVillage, myAdmission.taluka, myAdmission.district, myAdmission.state, myAdmission.pinCode].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* ── BANK DETAILS ── */}
          {profileTab === 'bank' && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e0e7ef', padding:20 }}>
              <h4 style={{ color:'#1565C0', marginBottom:16, fontSize:15, borderBottom:'2px solid #e3f2fd', paddingBottom:8 }}>🏦 Bank Details</h4>
              {!myAdmission.bankName && !myAdmission.bankAccountNumber ? (
                <div style={{ textAlign:'center', padding:'30px 0', color:'#aaa' }}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>🏦</div>
                  <p>No bank details added yet.</p>
                </div>
              ) : (
                <>
                  <FieldRow label="Bank Name"       value={myAdmission.bankName} />
                  <FieldRow label="Account No."     value={myAdmission.bankAccountNumber} mono />
                  <FieldRow label="IFSC Code"       value={myAdmission.bankIfscCode} mono />
                  <FieldRow label="Branch"          value={myAdmission.bankBranch} />
                  <FieldRow label="Account Holder"  value={myAdmission.bankAccountHolder || myAdmission.applicantName} />
                  <div style={{ marginTop:14, background:'#e8f5e9', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#2E7D32', fontWeight:600 }}>
                    ✅ Bank details are used for MahaDBT scholarship disbursement.
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── COLLECTED DOCUMENTS ── */}
          <div style={{ background:'#e8f5e9', borderRadius:14, border:'1px solid #a5d6a7', padding:16, marginTop:4 }}>
            <h4 style={{ color:'#2E7D32', marginBottom:12, fontSize:14 }}>📦 Documents Collected from College</h4>
            {myRequests.filter(r => r.status === 'completed').length === 0 ? (
              <p style={{ fontSize:13, color:'#555' }}>No documents collected yet.</p>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {myRequests.filter(r => r.status === 'completed').map((r, i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:10, border:'1px solid #c8e6c9', padding:'10px 16px', fontSize:12, minWidth:170 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:18 }}>
                        {r.documentType==='TC'?'📄':r.documentType==='BONAFIDE'?'📋':r.documentType==='ID_CARD'?'🪪':r.documentType==='MARKSHEET'?'📝':r.documentType==='PROVISIONAL_DEGREE'?'📜':r.documentType==='DEGREE'?'🎓':r.documentType==='MIGRATION'?'📜':'📃'}
                      </span>
                      <span style={{ fontWeight:800, color:'#1b5e20', fontSize:13 }}>{r.documentTypeLabel || r.documentType}</span>
                    </div>
                    {r.documentType === 'MARKSHEET' && r.marksheetSemester && (
                      <div style={{ color:'#1565C0', fontSize:11, fontWeight:600, marginBottom:2 }}>
                        {r.marksheetSemester} · {r.marksheetSession === 'mar_apr' ? 'March / April' : 'Nov / December'} {r.marksheetYear}
                      </div>
                    )}
                    {r.reason && <div style={{ color:'#666', fontSize:11, marginBottom:2 }}>Purpose: {r.reason}</div>}
                    <div style={{ color:'#888', fontSize:10 }}>
                      Issued: {new Date(r.updatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
})()}


          {activeTab === 'fees' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>💰 My Fees</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>View your fee structure and payment history.</p>

              {!myAdmission ? (
                <div className="empty-state"><div className="empty-icon">💰</div><h3>No Fee Information</h3></div>
              ) : (() => {
                const ct = (myAdmission.courseType || '').toLowerCase();
                const courseKey = ct.includes('b.sc')||ct.includes('bsc')||ct.includes('science') ? 'B.Sc.' : ct.includes('b.a')||ct.includes('ba')||ct.includes('arts') ? 'B.A.' : null;
                const schol = myAdmission.scholarshipAmount || 0;
                const ledger = myAdmission.feeLedger || [];
                const paidTotal = ledger.reduce((s, p) => s + (p.amount || 0), 0) || myAdmission.fees || 0;

                return (
                  <div>
                    {/* ── Fee Structure Details Table ── */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                      <div style={{ background: '#009688', padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>Fee Structure Details</span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
  <tr style={{ background: '#f5f5f5' }}>
    {['Fee Structure Name','Year','Total Fees','Scholarship','Net Payable','Paid Amount','Balance Due','Receipt'].map(h => (
      <th
        key={h}
        style={{
          padding: '9px 12px',
          fontWeight: 700,
          color: '#009688',
          textAlign: 'center',
          borderBottom: '2px solid #009688',
          fontSize: 12,
          whiteSpace: 'nowrap'
        }}
      >
        {h}
      </th>
    ))}
  </tr>
</thead>
                          <tbody>
                            {courseKey ? Object.entries(OFFICIAL_FEES_YEARLY[courseKey]?.years || {}).map(([yr, data], i) => {
                              const isCurrent = yr === myAdmission.admissionYear;
                              const netPay = Math.max(0, data.total - schol);
                              const yrPaid = isCurrent ? paidTotal : 0;
                              const balance = Math.max(0, netPay - yrPaid);
                              return (
                                <tr key={yr} style={{ background: isCurrent ? '#e0f7fa' : i%2===0?'#fafafa':'#fff', fontWeight: isCurrent ? 700 : 400 }}>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    {OFFICIAL_FEES_YEARLY[courseKey]?.label} {isCurrent && <span style={{ background: '#009688', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 8, marginLeft: 4 }}>Current</span>}
                                   </td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#009688', fontWeight: 700 }}>{yr}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>₹{data.total.toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: schol>0?'#7B1FA2':'#999' }}>{schol>0?`₹${schol.toLocaleString('en-IN')}.00`:'₹0.00'}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>₹{netPay.toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#2E7D32', fontWeight: 700 }}>{isCurrent ? `₹${yrPaid.toLocaleString('en-IN')}.00` : '₹0.00'}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: balance>0?'#C62828':'#2E7D32', fontWeight: 700 }}>{isCurrent ? `₹${balance.toLocaleString('en-IN')}.00` : `₹${netPay.toLocaleString('en-IN')}.00`}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    {isCurrent && ledger.length > 0 && <span style={{ color: '#009688', fontSize: 11, fontWeight: 600 }}>↓ Below</span>}
                                   </td>
                                 </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan="8" style={{ padding: 16, textAlign: 'center', color: '#888' }}>Course not detected — contact Student Section</td>
                              </tr>
                            )}
                            {/* Total row */}
                            {courseKey && (
                              <tr style={{ background: '#e0f7fa', fontWeight: 800 }}>
                                <td colSpan="2" style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800 }}>Total</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>₹{Object.values(OFFICIAL_FEES_YEARLY[courseKey]?.years||{}).reduce((s,d)=>s+d.total,0).toLocaleString('en-IN')}.00</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#7B1FA2' }}>{schol>0?`₹${(schol*3).toLocaleString('en-IN')}.00`:'₹0.00'}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>₹{Object.values(OFFICIAL_FEES_YEARLY[courseKey]?.years||{}).reduce((s,d)=>s+Math.max(0,d.total-schol),0).toLocaleString('en-IN')}.00</td>
                                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#2E7D32' }}>₹{paidTotal.toLocaleString('en-IN')}.00</td>
                                <td colSpan="2" style={{ padding: '9px 12px', textAlign: 'center' }}></td>
                               </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ── Installment / Receipt Details ── */}
                    {ledger.length > 0 && (
                      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                        <div style={{ background: '#009688', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>Payment Receipts</span>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{ledger.length} payment(s)</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#f5f5f5' }}>
                                {['Receipt No','Date','Fee Type','Amount','Mode','Status'].map(h => (
                                  <th key={h} style={{ padding: '8px 12px', fontWeight: 700, color: '#009688', textAlign: 'center', borderBottom: '2px solid #009688', fontSize: 12 }}>{h}</th>
                                ))}
                               </tr>
                            </thead>
                            <tbody>
                              {ledger.map((p, i) => (
                                <tr key={i} style={{ background: i%2===0?'#fafafa':'#fff' }}>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontFamily: 'monospace', color: '#1565C0', fontWeight: 600 }}>{p.receiptNo||'—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.feeTypeLabel||p.feeType||'—'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontWeight: 700, color: '#2E7D32' }}>₹{(p.amount||0).toLocaleString('en-IN')}.00</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{p.paymentMode==='online'?'🌐 Online':'💵 Cash'}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                    <span style={{ background: '#e8f5e9', color: '#2E7D32', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>PAID ✓</span>
                                    <button onClick={() => printStudentReceipt(p, myAdmission)}
                                      style={{ background: '#1565C0', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>🖨️ Print</button>
                                  </div>
                                   </td>
                                 </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {ledger.length === 0 && (
                      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '14px 20px', fontSize: 13, color: '#7c5e00', textAlign: 'center' }}>
                        No payments recorded yet. Contact Accounts Section.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}


          {/* ============ DOCUMENTS TAB ============ */}
          {activeTab === 'documents' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📄 Request Documents</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Apply for Transfer Certificate, Bonafide, ID Card or Marksheet.</p>

              {/* Apply form */}
              <DocRequestForm myAdmission={myAdmission} onSubmitted={() => {
                API.get('/document-requests/my').then(r => setMyRequests(r.data.requests || [])).catch(() => {});
              }} />

              {/* My Requests */}
              <div style={{ marginTop: 24 }}>
                {/* Issued Documents summary */}
                {myRequests.filter(r => r.status === 'completed').length > 0 && (
                  <div style={{ background: '#e8f5e9', borderRadius: 14, border: '1px solid #a5d6a7', padding: 16, marginBottom: 20 }}>
                    <h4 style={{ color: '#2E7D32', marginBottom: 12, fontSize: 14 }}>📦 Documents Collected from College</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {myRequests.filter(r => r.status === 'completed').map((r, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #c8e6c9', padding: '10px 16px', fontSize: 13 }}>
                          <div style={{ fontWeight: 700, color: '#1b5e20', fontSize: 14 }}>{r.documentTypeLabel || r.documentType}</div>
                          {r.documentType === 'MARKSHEET' && r.marksheetSemester && (
                            <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{r.marksheetSemester} · {r.marksheetSession === 'mar_apr' ? 'Mar / Apr' : 'Nov / Dec'} {r.marksheetYear}</div>
                          )}
                          <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Issued: {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  <h4 style={{ color: '#1565C0', marginBottom: 14 }}>📋 My Requests ({myRequests.length})</h4>
                  {myRequests.length === 0 ? (
                    <div style={{ background: '#f8faff', borderRadius: 10, padding: 20, textAlign: 'center', color: '#888', fontSize: 13 }}>
                      No document requests yet. Apply above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {myRequests.map((req, i) => {
                        const statusMap = {
                          pending_accounts:      { bg: '#fff3e0', color: '#E65100', label: '⏳ At Accounts (Fee Verification)' },
                          rejected_by_accounts:  { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Accounts' },
                          pending_exam:          { bg: '#e3f2fd', color: '#1565C0', label: '⏳ At Exam Section' },
                          rejected_by_exam:      { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Exam Section' },
                          pending_principal:     { bg: '#fff3e0', color: '#E65100', label: '⏳ At Principal' },
                          rejected_by_principal: { bg: '#ffebee', color: '#C62828', label: '❌ Rejected by Principal' },
                          pending_generation:    { bg: '#e8f5e9', color: '#2E7D32', label: '✅ Ready to Collect' },
                          completed:             { bg: '#e8f5e9', color: '#1b5e20', label: '🏁 Issued — Collect from office' },
                        };
                        const ss = statusMap[req.status] || { bg: '#f5f5f5', color: '#888', label: req.status };
                        return (
                          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', padding: 16, borderLeft: `4px solid ${ss.color}`, boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <h4 style={{ fontSize: 14, color: '#1a1a2e', margin: 0 }}>{req.documentTypeLabel || req.documentType}</h4>
                                {req.urgency === 'urgent' && <span style={{ background: '#ffebee', color: '#C62828', fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>⚡ Urgent</span>}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                            </div>
                            {req.reason && <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>Reason: {req.reason}</p>}
                            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Applied: {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                            {/* Workflow progress */}
                            <div style={{ background: '#f8faff', padding: '10px 12px', borderRadius: 8, marginTop: 10, fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span>📝 Submitted</span>
                                {req.documentType === 'MARKSHEET' ? (
  <>
    <span>→</span>
    <span style={{ color: req.status === 'completed' ? '#2E7D32' : '#999', fontWeight: req.status === 'completed' ? 600 : 400 }}>
      {req.status === 'completed' ? '✅' : '⏳'} Exam Section
    </span>
  </>
                                ) : (
                                  <>
                                    <span>→</span>
                                    <span style={{ color: req.accountsApprovedDate ? '#2E7D32' : '#999', fontWeight: req.accountsApprovedDate ? 600 : 400 }}>{req.accountsApprovedDate ? '✅' : '⏳'} Accounts</span>
                                    {req.documentType === 'TC' && (<>
                                      <span>→</span>
                                      <span style={{ color: req.examVerifiedDate ? '#2E7D32' : '#999', fontWeight: req.examVerifiedDate ? 600 : 400 }}>{req.examVerifiedDate ? '✅' : '⏳'} Exam Section</span>
                                      <span>→</span>
                                      <span style={{ color: req.principalApprovedDate ? '#2E7D32' : '#999', fontWeight: req.principalApprovedDate ? 600 : 400 }}>{req.principalApprovedDate ? '✅' : '⏳'} Principal</span>
                                    </>)}
                                    <span>→</span>
                                    <span style={{ color: req.status === 'completed' ? '#2E7D32' : '#999', fontWeight: req.status === 'completed' ? 600 : 400 }}>{req.status === 'completed' ? '✅' : '⏳'} Student Section</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
            </div>
          )}

          {/* ============ RESULTS TAB ============ */}
          {activeTab === 'results' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>🎓 My Exam Results</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>All semester results published by the Examination Section.</p>

              {resultsLoading ? (
                <div className="empty-state"><p style={{ fontSize: '2rem' }}>⏳</p><h3>Loading results...</h3></div>
              ) : results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎓</div>
                  <h3>No Results Yet</h3>
                  <p>Your results will appear here once published by the Examination Section.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {results.map(r => (
                    <div key={r._id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e7ef', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
                      {/* Result header */}
                      <div style={{ background: r.result === 'pass' || r.result === 'distinction' ? 'linear-gradient(135deg,#1b5e20,#2E7D32)' : 'linear-gradient(135deg,#b71c1c,#C62828)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: 16 }}>
                            {r.course?.name || 'Course'} — Semester {r.semester} ({r.year})
                          </h4>
                          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '4px 0 0' }}>
                            Published: {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{r.percentage ? `${r.percentage}%` : '—'}</div>
                          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                            {r.result === 'distinction' ? '🏅 Distinction' : r.result === 'pass' ? '✅ Pass' : '❌ Fail'}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div style={{ padding: '14px 20px', background: '#f8faff', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                        <span><strong>Total Marks:</strong> {r.obtainedMarks}/{r.totalMarks}</span>
                        <span><strong>Percentage:</strong> {r.percentage ? `${r.percentage}%` : '—'}</span>
                        <span><strong>Semester:</strong> {r.semester}</span>
                        <span><strong>Year:</strong> {r.year}</span>
                      </div>

                      {/* Subject-wise marks */}
                      {r.subjects && r.subjects.length > 0 && (
                        <div style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 700, color: '#1565C0', marginBottom: 10, fontSize: 13 }}>Subject-wise Marks:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                            {r.subjects.map((sub, i) => (
                              <div key={i} style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd' }}>
                                <p style={{ fontWeight: 600, color: '#0c4a6e', fontSize: 13, margin: '0 0 4px' }}>{sub.name}</p>
                                <p style={{ fontSize: 14, color: '#1565C0', fontWeight: 700, margin: 0 }}>
                                  {sub.obtainedMarks}/{sub.maxMarks}
                                  {sub.grade && <span style={{ marginLeft: 8, background: '#e3f2fd', padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>{sub.grade}</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ EXAM FORM TAB ============ */}
          {activeTab === 'examform' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📝 Exam Form</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Exam forms published for your course &amp; year appear below. Click "Fill Exam Form" to apply.
              </p>

              {examFormMsg && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, background: examFormMsg.startsWith('✅')?'#e8f5e9':'#ffebee', color: examFormMsg.startsWith('✅')?'#2E7D32':'#C62828' }}>{examFormMsg}</div>}

              {availableForms.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 36, textAlign: 'center', color: '#888', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <p style={{ fontSize: '2.8rem', margin: 0 }}>🔒</p>
                  <p style={{ fontWeight: 600, color: '#555', marginTop: 8 }}>No Exam Form Published Yet</p>
                  <p style={{ fontSize: 13 }}>The Examination Section will publish your exam form when the time comes.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {availableForms.map(f => {
                    const isRegular = f.formType === 'regular';
                    const submittedReq = f.request;
                    return (
                      <div key={f._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                        <div style={{ background: isRegular ? 'linear-gradient(135deg,#0D47A1,#1565C0)' : 'linear-gradient(135deg,#e65100,#f57c00)', padding: '16px 20px' }}>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: 16 }}>
                            {isRegular ? '📋 Regular Examination Form' : '📋 Backlog / KT Examination Form'}
                          </h4>
                          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '4px 0 0' }}>
                            {f.course} · {f.semester} Semester · {f.examEvent}
                          </p>
                        </div>
                        <div style={{ padding: 20 }}>
                          {submittedReq ? (
                            <div style={{ background: isRegular?'#e8f5e9':'#fff3e0', borderRadius: 10, padding: 20, textAlign: 'center', border: `2px solid ${isRegular?'#2E7D32':'#E65100'}` }}>
                              <p style={{ fontSize: '2rem', margin: 0 }}>✅</p>
                              <h4 style={{ color: isRegular?'#2E7D32':'#E65100', margin: '8px 0 4px' }}>Exam Form Submitted!</h4>
                              <p style={{ fontSize: 13, color: '#555' }}>Your form has been submitted. Visit the Accounts Section to pay exam fees.</p>
                              <div style={{ marginTop: 10, background: submittedReq.feeStatus==='collected'?'#c8e6c9':'#fff3e0', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: submittedReq.feeStatus==='collected'?'#1b5e20':'#e65100', fontWeight: 600 }}>
                                {submittedReq.feeStatus==='collected' ? `✅ Fees Paid: ₹${submittedReq.feeAmount} | Receipt: ${submittedReq.feeReceiptNo}` : '⏳ Exam Fees Pending — Visit Accounts Section'}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ background: '#e3f2fd', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#0c4a6e' }}>
                                <strong>ℹ️ Student Details:</strong><br />
                                Name: {myAdmission?.applicantName || user?.name} | Course: {myAdmission?.courseType || f.course} | Year: {myAdmission?.admissionYear || f.admissionYear}<br/>
                                Semester: <strong>{f.semester}</strong> | Exam Event: <strong>{f.examEvent}</strong>
                              </div>
                              <button
                                disabled={examFormSubmitting === f._id}
                                onClick={async () => {
                                  setExamFormSubmitting(f._id); setExamFormMsg('');
                                  try {
                                    await API.post('/results/exam-form/submit', { publishedFormId: f._id });
                                    setExamFormMsg('✅ Exam form submitted! Pay fees at the Accounts Section.');
                                    fetchExamForms();
                                  } catch(e) { setExamFormMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
                                  finally { setExamFormSubmitting(''); }
                                }}
                                style={{ background: examFormSubmitting===f._id?'#aaa':(isRegular?'#1565C0':'#E65100'), color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: examFormSubmitting===f._id?'not-allowed':'pointer' }}>
                                {examFormSubmitting===f._id ? '⏳ Submitting...' : '📝 Fill Exam Form'}
                              </button>
                              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>* After submission, pay exam fees at the Accounts Section.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ SCHOLARSHIP TAB ============ */}
          {activeTab === 'scholarship' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>🏅 Scholarship Status</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                Track your scholarship application status on the MahaDBT portal.
              </p>

              {!myAdmission ? (
                <div className="empty-state">
                  <div className="empty-icon">🏅</div>
                  <h3>Application Required</h3>
                  <p>Please complete your admission application first.</p>
                </div>
              ) : (
                <>
                  {/* Status card */}
                  {(() => {
                    const statusMap = {
                      not_filled: { bg: '#fff3e0', color: '#E65100', icon: '📝', label: 'Not Filled', desc: 'You have not yet filled the scholarship form on MahaDBT portal.' },
                      filled:     { bg: '#e3f2fd', color: '#1565C0', icon: '📋', label: 'Form Filled', desc: 'Your scholarship form has been submitted on MahaDBT portal.' },
                      approved:   { bg: '#e8f5e9', color: '#2E7D32', icon: '✅', label: 'Approved', desc: 'Your scholarship has been approved! Disbursement is pending.' },
                      rejected:   { bg: '#ffebee', color: '#C62828', icon: '❌', label: 'Rejected', desc: 'Your scholarship was rejected. Please contact the Scholarship Section.' },
                      disbursed:  { bg: '#e8f5e9', color: '#1b5e20', icon: '💰', label: 'Disbursed', desc: 'Scholarship amount has been credited to your bank account.' },
                    };
                    const s = statusMap[myAdmission.scholarshipStatus || 'not_filled'];
                    return (
                      <div style={{ background: s.bg, border: `2px solid ${s.color}`, borderRadius: 14, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '3rem' }}>{s.icon}</div>
                        <div>
                          <h3 style={{ color: s.color, margin: '0 0 6px', fontSize: 20 }}>Scholarship Status: {s.label}</h3>
                          <p style={{ color: '#555', fontSize: 14, margin: 0 }}>{s.desc}</p>
                          {myAdmission.scholarshipNote && (
                            <p style={{ color: '#777', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>Note: {myAdmission.scholarshipNote}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Student eligibility info */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14, fontSize: 15 }}>📋 Your Details for Scholarship</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                      {[
                        { label: 'Name', value: myAdmission.applicantName },
                        { label: 'Category', value: myAdmission.category ? myAdmission.category.toUpperCase() : '—' },
                        { label: 'Caste', value: myAdmission.caste || '—' },
                        { label: 'Annual Income', value: myAdmission.familyIncome ? `₹${myAdmission.familyIncome}` : '—' },
                        { label: 'Course', value: myAdmission.courseType || '—' },
                        { label: 'Year', value: myAdmission.admissionYear || '—' },
                        { label: 'PRN Number', value: myAdmission.prnNumber || '⚠️ Not assigned yet' },
                        { label: 'ABC / APAR ID', value: myAdmission.aparIdNumber || '⚠️ Not assigned yet' },
                      ].map((item, i) => (
                        <div key={i} style={{ background: '#f8faff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e3f2fd' }}>
                          <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px', fontWeight: 600 }}>{item.label}</p>
                          <p style={{ fontSize: 13, color: '#222', fontWeight: 600, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MahaDBT instructions */}
                  <div style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                    <h4 style={{ color: '#6A1B9A', marginBottom: 12, fontSize: 15 }}>🌐 How to Fill Scholarship on MahaDBT</h4>
                    <ol style={{ paddingLeft: 20, fontSize: 13, color: '#444', lineHeight: 2 }}>
                      <li>Visit <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noreferrer" style={{ color: '#6A1B9A', fontWeight: 600 }}>mahadbt.maharashtra.gov.in</a></li>
                      <li>Login with your registered mobile number and Aadhar</li>
                      <li>Select your scholarship scheme (e.g. GOI, State, EBC, OBC, SBC etc.)</li>
                      <li>Fill all required details — ensure PRN and ABC ID are correct</li>
                      <li>Upload required documents (caste certificate, income certificate, marksheet)</li>
                      <li>Submit the form and note down your application number</li>
                      <li>Inform the <strong>Scholarship Section</strong> of your college after submitting</li>
                    </ol>
                    <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#6A1B9A', fontWeight: 500 }}>
                      ⚠️ Make sure your <strong>PRN Number</strong> and <strong>ABC ID</strong> are updated before filling the form. Contact the Student Section if they are missing.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}


          {/* ============ ACADEMIC YEAR TAB ============ */}
          {activeTab === 'academic_year' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>📅 Academic Year</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Your academic year details and examination schedule.</p>
              {myAdmission ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14 }}>🎓 Current Academic Details</h4>
                    {[
                      ['Course', (() => { const ct=(myAdmission.courseType||'').toLowerCase(); return ct.includes('b.sc')||ct.includes('bsc')?'Bachelor of Science (B.Sc.)':ct.includes('b.a')||ct.includes('ba')?'Bachelor of Arts (B.A.)':myAdmission.courseType||'—'; })()],
                      ['Current Year', myAdmission.admissionYear || '—'],
                      ['Academic Year', (() => { const y=new Date().getFullYear(); const m=new Date().getMonth()+1; return m>=6?`${y}-${String(y+1).slice(2)}`:`${y-1}-${String(y).slice(2)}`; })()],
                      ['Student ID', myAdmission.studentId || '—'],
                      ['PRN Number', myAdmission.prnNumber || 'Not assigned yet'],
                      ['Admission Year', myAdmission.createdAt ? new Date(myAdmission.createdAt).getFullYear() : '—'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                        <span style={{ color:'#888', fontWeight:600 }}>{l}</span>
                        <span style={{ color:'#1a1a2e', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20 }}>
                    <h4 style={{ color: '#1565C0', marginBottom: 14 }}>📋 Exam Schedule (SNDT Pattern)</h4>
                    {[
                      ['Odd Semesters (I, III, V)', 'November – December'],
                      ['Even Semesters (II, IV, VI)', 'March – April'],
                      ['Result Declaration', '45-60 days after exam'],
                      ['Marksheet Collection', 'Student Section after result'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f4f8', fontSize:13 }}>
                        <span style={{ color:'#888', fontWeight:600, maxWidth:200 }}>{l}</span>
                        <span style={{ color:'#1565C0', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:14, background:'#e3f2fd', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#1565C0' }}>
                      💡 Current Semester: <strong>{(() => { const yr=myAdmission.admissionYear||''; const m=new Date().getMonth()+1; const odd=m>=6&&m<=12; return yr==='1st Year'?(odd?'Sem I':'Sem II'):yr==='2nd Year'?(odd?'Sem III':'Sem IV'):yr==='3rd Year'?(odd?'Sem V':'Sem VI'):'—'; })()}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state"><div className="empty-icon">📅</div><h3>No admission data found</h3></div>
              )}
            </div>
          )}

          {/* ============ LAST DEGREE / TC TAB ============ */}
          {activeTab === 'lastdegree' && (
            <LastDegreeTab myAdmission={myAdmission} user={user} />
          )}

          {/* ============ LAST DEGREE / TC TAB ============ */}
          {activeTab === 'last_degree' && (
            <div>
              <h3 style={{ marginBottom: 4, color: '#1565C0' }}>🎓 Last Degree / TC</h3>
              <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
                View your final year examination results and apply for Degree / TC related documents.
              </p>

              {/* Last Year Result */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h4 style={{ color: '#1565C0', marginBottom: 16, fontSize: 15 }}>📊 Final Year Examination Result</h4>
                {results.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
                    <p>No results uploaded yet. Contact the Examination Section.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {results.filter(r => {
                      const sem = r.semester;
                      return sem === 6 || sem === '6' || sem === 'Sem VI' || sem === 'VI';
                    }).length > 0 ? (
                      results.filter(r => {
                        const sem = r.semester;
                        return sem === 6 || sem === '6' || sem === 'Sem VI' || sem === 'VI';
                      }).map(r => (
                        <div key={r._id} style={{ background: r.result === 'pass' || r.result === 'distinction' ? '#e8f5e9' : '#ffebee', borderRadius: 12, border: `2px solid ${r.result === 'pass' || r.result === 'distinction' ? '#2E7D32' : '#C62828'}`, padding: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                            <div>
                              <h4 style={{ color: '#1a1a2e', margin: 0 }}>Semester {r.semester} — {r.year}</h4>
                              <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0' }}>{r.course?.name || 'Course'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 22, fontWeight: 800, color: r.result === 'pass' || r.result === 'distinction' ? '#2E7D32' : '#C62828' }}>{r.percentage}%</div>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: r.result === 'pass' || r.result === 'distinction' ? '#2E7D32' : '#C62828', color: '#fff' }}>
                                {r.result === 'distinction' ? '🏅 Distinction' : r.result === 'pass' ? '✅ Pass' : '❌ Fail/ATKT'}
                              </span>
                            </div>
                          </div>
                          {r.subjects && r.subjects.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                              {r.subjects.map((sub, i) => (
                                <div key={i} style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e0e7ef' }}>
                                  <p style={{ fontSize: 12, color: '#555', margin: '0 0 3px', fontWeight: 600 }}>{sub.name}</p>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1565C0', margin: 0 }}>{sub.obtainedMarks}/{sub.maxMarks}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div>
                        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#7c5e00' }}>
                          ℹ️ Final semester (Sem VI) result not found. Showing all available results below.
                        </div>
                        {results.map(r => (
                          <div key={r._id} style={{ background: '#f8faff', borderRadius: 10, border: '1px solid #e0e7ef', padding: 14, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: '#1565C0' }}>Sem {r.semester} — {r.year}</span>
                              <span style={{ fontWeight: 700, color: r.result === 'pass' ? '#2E7D32' : '#C62828' }}>{r.percentage}% — {r.result?.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Apply for Degree/TC Documents */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e0e7ef', padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h4 style={{ color: '#1565C0', marginBottom: 6, fontSize: 15 }}>📋 Apply for Degree / TC Documents</h4>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
                  After completing your course, apply for the following documents from the Documents tab.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {[
                    { type: 'TC', icon: '📄', label: 'Transfer Certificate', desc: 'Required when leaving the college', color: '#1565C0', bg: '#e3f2fd' },
                    { type: 'PROVISIONAL_DEGREE', icon: '📜', label: 'Provisional Degree', desc: 'Temporary degree certificate after passing', color: '#2E7D32', bg: '#e8f5e9' },
                    { type: 'DEGREE', icon: '🎓', label: 'Degree Certificate', desc: 'Official degree from SNDT University', color: '#7B1FA2', bg: '#f3e5f5' },
                    { type: 'MIGRATION', icon: '📜', label: 'Migration Certificate', desc: 'Required for joining another university', color: '#E65100', bg: '#fff3e0' },
                  ].map(doc => {
                    const alreadyApplied = myRequests.some(r => r.documentType === doc.type);
                    const isIssued = myRequests.some(r => r.documentType === doc.type && r.status === 'completed');
                    return (
                      <div key={doc.type} style={{ background: doc.bg, borderRadius: 12, border: `1px solid ${doc.color}33`, padding: 16 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{doc.icon}</div>
                        <h5 style={{ color: doc.color, margin: '0 0 4px', fontSize: 14 }}>{doc.label}</h5>
                        <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px' }}>{doc.desc}</p>
                        {isIssued ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32', background: '#e8f5e9', padding: '4px 12px', borderRadius: 10 }}>✅ Issued</span>
                        ) : alreadyApplied ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#E65100', background: '#fff3e0', padding: '4px 12px', borderRadius: 10 }}>⏳ Applied</span>
                        ) : (
                          <button onClick={() => setActiveTab('documents')}
                            style={{ background: doc.color, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            📋 Apply Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ NOTICES TAB ============ */}
          {activeTab === 'notices' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#1565C0' }}>All Notices ({notices.length})</h3>
              {notices.map(notice => (
                <div className="notice-full-card" key={notice._id}>
                  <div className="notice-full-header">
                    <h4>{notice.title}</h4>
                    <span className="notice-tag">{notice.category}</span>
                  </div>
                  <p>{notice.content}</p>
                  <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
              {notices.length === 0 && <p className="empty-msg">No notices available</p>}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
