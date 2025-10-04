// =========================
// Tax Calculation Functions
// =========================
const persAfls = 68691;
const s1 = 0.3149;
const s2 = 0.3799;
const s3 = 0.4629;
const thr1 = 472006;
const thr2 = 1325127;

function calculateTax(maki1, maki2) {
  const etes_s = Math.max(maki1, maki2) * 12;
  const etes_m_s = Math.min(maki1, maki2) * 12;

  const mork_1_2 = 5664062;
  const mork_2_3 = 15901524;
  const pros2 = 0.065;
  const pros3 = 0.083;

  const efri_mork_nota = mork_2_3 === 0 ? mork_1_2 : mork_2_3;
  const nedri_mork_nota = mork_2_3 === 0 ? 0 : mork_1_2;
  const milli_pros_nota = pros3 === 0 ? pros2 : pros3;

  const stor_samskottun = (etes_s > efri_mork_nota && etes_m_s < efri_mork_nota) ? 1 : 0;
  const umfram_efri_mork = stor_samskottun ? etes_s - efri_mork_nota : 0;
  const tekjur_m_notad = etes_m_s > nedri_mork_nota ? etes_m_s - nedri_mork_nota : 0;

  const halft_threpabil = stor_samskottun
    ? (efri_mork_nota - nedri_mork_nota - tekjur_m_notad) / 2
    : 0;

  const upph_samnyting = (stor_samskottun && etes_s > etes_m_s)
    ? Math.min(umfram_efri_mork, halft_threpabil)
    : 0;

  const laekkun_v_samnytingar = Math.round(upph_samnyting * milli_pros_nota);
  return Math.round(laekkun_v_samnytingar / 12);
}

// =========================
// Helper Functions
// =========================
function buildGrid(xmin, xmax, ymin, ymax, n) {
  const xs = [], ys = [];
  for (let i = 0; i < n; i++) xs.push(xmin + (xmax - xmin) * i / (n - 1));
  for (let j = 0; j < n; j++) ys.push(ymin + (ymax - ymin) * j / (n - 1));
  return { xs, ys };
}

function computeZ(xs, ys, zscale, scaleFactor) {
  const Z = [];
  for (let j = 0; j < ys.length; j++) {
    const row = [];
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i] / scaleFactor;
      const y = ys[j] / scaleFactor;
      let z = calculateTax(x, y);
      if (!isFinite(z)) z = NaN;
      row.push(z * zscale * scaleFactor);
    }
    Z.push(row);
  }
  return Z;
}

// =========================
// Plotting Logic
// =========================
function computeMyPoint(scaleFactor) {
  
  const x = parseFloat(document.getElementById('mySalary1').value.replace(/,/g, '')) || 0;
  const y = parseFloat(document.getElementById('mySalary2').value.replace(/,/g, '')) || 0;
  const z = scaleFactor*calculateTax(x, y);
  return { x, y, z };
}

function plotSurface() {
  const scaleFactor = parseFloat(document.getElementById('scaleSelect').value);
  const myPoint_scale = computeMyPoint(scaleFactor);
  const max_xy = Math.max(myPoint_scale.x, myPoint_scale.y) + 1000 * 200;
  const xMaxInput = Math.max(max_xy, 1000 * 2000);
  const yMaxInput = Math.max(max_xy, 1000 * 2000);

  const xrange = [0, xMaxInput * scaleFactor];
  const yrange = [0, yMaxInput * scaleFactor];
  const n = 100;
  const zscale = 1;

  const { xs, ys } = buildGrid(xrange[0], xrange[1], yrange[0], yrange[1], n);
  const Z = computeZ(xs, ys, zscale, scaleFactor);
  const myPoint = computeMyPoint(scaleFactor);

  const data = [
    {
      type: 'surface',
      x: xs,
      y: ys,
      z: Z,
      colorscale: 'Turbo',
      showscale: false
    },
    {
      type: 'scatter3d',
      mode: 'markers+text',
      x: [myPoint.x*scaleFactor - 2000 * scaleFactor],
      y: [myPoint.y*scaleFactor - 2000 * scaleFactor],
      z: [myPoint.z + 1000 * scaleFactor],
      marker: { size: 6, color: 'red' },
      hoverinfo: 'none',
      text: ['Þín staða: ' + Math.ceil(myPoint.z).toLocaleString() + "ISK"],
      textfont: {
        family: 'Arial Black, Arial, sans-serif',
        size: 14,
        color: 'black'
      },
      textposition: 'top center'
    }
  ];

  const layout = {
    title: 'Möguleg skattleg hagræðing í sambúð vegna tilfluttnings milli skattþrpa eftir tekjum á Íslandi (1. október 2025)' +
      (scaleFactor === 12 ? ' – Árleg' : ' – Mánaðarleg'),
    scene: {
      xaxis: { title: 'Tekjur maka 1 (ISK)' },
      yaxis: { title: 'Tekjur maka 2 (ISK)' },
      zaxis: { title: 'Hagræðing (ISK)', rangemode: 'tozero' },
      camera: { eye: { x: -2, y: -2, z: 1.2 } },
      aspectmode: 'cube'
    },
    margin: { l: 0, r: 0, b: 40, t: 60 }
  };

  Plotly.newPlot('plot', data, layout, { responsive: true });
}

// =========================
// Input Formatting
// =========================
function formatNumberInput(input) {
  const value = input.value.replace(/,/g, '').replace(/[^\d]/g, '');
  if (value === '') {
    input.value = '';
    return;
  }
  const formatted = parseInt(value, 10).toLocaleString('en-US');
  input.value = formatted;
}

document.querySelectorAll('.number-box input').forEach(input => {
  input.addEventListener('input', () => {
    const caret = input.selectionStart;
    formatNumberInput(input);
    input.setSelectionRange(caret, caret);
  });

  input.addEventListener('change', () => {
    formatNumberInput(input);
    plotSurface();
  });
});

// =========================
// Button & Select Actions
// =========================
document.getElementById('downloadPng').addEventListener('click', () => {
  Plotly.toImage('plot', { format: 'png', height: 800, width: 1200 }).then(url => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Skattleg_Hagraeding_2025.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
});

document.getElementById('scaleSelect').addEventListener('change', plotSurface);
document.getElementById('replotBtn').addEventListener('click', plotSurface);

// =========================
// Initial Plot
// =========================
plotSurface();
