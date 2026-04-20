const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseButton = document.getElementById('browseButton');
const emailInput = document.getElementById('emailInput');
const predictButton = document.getElementById('predictButton');
const clearButton = document.getElementById('clearButton');
const resultText = document.getElementById('resultText');
const resultTextLarge = document.getElementById('resultTextLarge');
const confidenceText = document.getElementById('confidenceText');
const confidenceLarge = document.getElementById('confidenceLarge');
const messageText = document.getElementById('message');
const datasetTotal = document.getElementById('datasetTotal');
const metricAccuracy = document.getElementById('metricAccuracy');
const spamShare = document.getElementById('spamShare');
const confusionMatrix = document.getElementById('confusionMatrix');
const balanceChartCanvas = document.getElementById('balanceChart');
const metricsChartCanvas = document.getElementById('metricsChart');
const lengthChartCanvas = document.getElementById('lengthChart');
const confidenceChartCanvas = document.getElementById('confidenceChart');
const sampleChips = document.querySelectorAll('.sample-chip');

const fallbackMetrics = {
  dataset: { total: 5572, ham: 4825, spam: 747, train: 4457, test: 1115 },
  metrics: { accuracy: 96.32, precision: 98.18, recall: 73.08, f1: 83.74 },
  class_balance: { ham: 4825, spam: 747 },
  average_length: { ham: 15.2, spam: 23.6 },
  confusion_matrix: { labels: ['Ham', 'Spam'], values: [[965, 1], [40, 109]] },
};

const charts = {};
let dashboardMetrics = null;

function destroyChart(name) {
  if (charts[name]) {
    charts[name].destroy();
    delete charts[name];
  }
}

function setMessage(text, isError = false) {
  messageText.textContent = text;
  messageText.style.color = isError ? '#b54708' : '#5d667a';
}

function setResult(label, confidence) {
  const normalized = label.toLowerCase();
  resultText.textContent = normalized === 'spam' ? 'SPAM MAIL' : 'HAM MAIL';
  resultTextLarge.textContent = normalized === 'spam' ? 'SPAM MAIL' : 'HAM MAIL';
  resultText.style.color = normalized === 'spam' ? '#b54708' : '#1e7d49';
  resultTextLarge.style.color = normalized === 'spam' ? '#b54708' : '#1e7d49';
  confidenceText.textContent = `Confidence: ${confidence}%`;
  confidenceLarge.textContent = `Confidence: ${confidence}%`;

  if (charts.confidence) {
    charts.confidence.data.datasets[0].data = [confidence, Math.max(0, 100 - confidence)];
    charts.confidence.update();
  }
}

function createChart(canvas, config) {
  return new Chart(canvas, config);
}

function prepareChartCanvas(canvas, height) {
  const width = canvas.parentElement ? canvas.parentElement.clientWidth : 300;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function renderConfusionMatrix(matrix) {
  const cells = [
    { label: 'Actual ham / Predicted ham', value: matrix[0][0], accent: '#1f7a49' },
    { label: 'Actual ham / Predicted spam', value: matrix[0][1], accent: '#b45309' },
    { label: 'Actual spam / Predicted ham', value: matrix[1][0], accent: '#b45309' },
    { label: 'Actual spam / Predicted spam', value: matrix[1][1], accent: '#1f7a49' },
  ];

  confusionMatrix.innerHTML = cells
    .map(
      (cell) => `
        <div class="matrix-cell" style="background: linear-gradient(180deg, ${cell.accent}14, rgba(255,255,255,0.85));">
          <span class="matrix-label">${cell.label}</span>
          <strong>${cell.value}</strong>
        </div>`,
    )
    .join('');
}

function renderDashboard(metrics) {
  dashboardMetrics = metrics;
  datasetTotal.textContent = metrics.dataset.total.toLocaleString();
  metricAccuracy.textContent = `${metrics.metrics.accuracy}%`;
  const spamRatio = ((metrics.class_balance.spam / metrics.dataset.total) * 100).toFixed(1);
  spamShare.textContent = `${spamRatio}%`;

  renderConfusionMatrix(metrics.confusion_matrix.values);

  destroyChart('balance');
  destroyChart('metrics');
  destroyChart('length');
  destroyChart('confidence');

  prepareChartCanvas(balanceChartCanvas, 240);
  prepareChartCanvas(metricsChartCanvas, 240);
  prepareChartCanvas(lengthChartCanvas, 240);
  prepareChartCanvas(confidenceChartCanvas, 220);

  charts.balance = createChart(balanceChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Ham', 'Spam'],
      datasets: [
        {
          data: [metrics.class_balance.ham, metrics.class_balance.spam],
          backgroundColor: ['#d8cfbf', '#111111'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
      },
    },
  });

  charts.metrics = createChart(metricsChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Accuracy', 'Precision', 'Recall', 'F1'],
      datasets: [
        {
          label: 'Score %',
          data: [metrics.metrics.accuracy, metrics.metrics.precision, metrics.metrics.recall, metrics.metrics.f1],
          backgroundColor: ['#111111', '#4b5563', '#b45309', '#1f7a49'],
          borderRadius: 14,
        },
      ],
    },
    options: {
      responsive: false,
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(17, 24, 39, 0.08)' } },
        x: { grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });

  charts.length = createChart(lengthChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Ham', 'Spam'],
      datasets: [
        {
          label: 'Average words',
          data: [metrics.average_length.ham, metrics.average_length.spam],
          backgroundColor: ['#d4a373', '#111111'],
          borderRadius: 14,
        },
      ],
    },
    options: {
      responsive: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(17, 24, 39, 0.08)' } },
        x: { grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });

  charts.confidence = createChart(confidenceChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Confidence', 'Remaining'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['#111111', '#ece5d8'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: '76%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
}

async function loadDashboardMetrics() {
  try {
    const response = await fetch('/api/metrics');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to load dashboard metrics.');
    }

    renderDashboard(payload);
    setMessage('Dashboard metrics loaded.');
  } catch (error) {
    renderDashboard(fallbackMetrics);
    setMessage('Live API unavailable, showing preview data.', true);
  }
}

async function classifyEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    setMessage('Paste or drop an email first.', true);
    return;
  }

  setMessage('Analyzing message...');
  predictButton.disabled = true;

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to classify the message.');
    }

    setResult(payload.label, payload.confidence.toFixed(2));
    setMessage('Prediction complete.');
  } catch (error) {
    const fallbackLabel = /\b(free|winner|urgent|password|prize|claim)\b/i.test(email) ? 'spam' : 'ham';
    const fallbackConfidence = fallbackLabel === 'spam' ? 92.4 : 86.7;
    setResult(fallbackLabel, fallbackConfidence.toFixed(2));
    setMessage('Live API unavailable, using local preview classification.', true);
  } finally {
    predictButton.disabled = false;
  }
}

function handleFiles(files) {
  const file = files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    emailInput.value = String(reader.result || '');
    setMessage(`Loaded ${file.name}.`);
    emailInput.focus();
  };
  reader.readAsText(file);
}

function resetResultState() {
  resultText.textContent = 'Waiting for an email';
  resultTextLarge.textContent = 'Waiting for an email';
  resultText.style.color = '#121827';
  resultTextLarge.style.color = '#121827';
  confidenceText.textContent = 'No prediction yet';
  confidenceLarge.textContent = 'No prediction yet';
  if (charts.confidence) {
    charts.confidence.data.datasets[0].data = [0, 100];
    charts.confidence.update();
  }
}

browseButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => handleFiles(event.target.files));
predictButton.addEventListener('click', classifyEmail);
clearButton.addEventListener('click', () => {
  emailInput.value = '';
  resetResultState();
  setMessage('Cleared.');
  emailInput.focus();
});

sampleChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const sample = chip.getAttribute('data-sample');
    if (!sample) {
      return;
    }

    emailInput.value = sample;
    resetResultState();
    setMessage(`Loaded ${chip.textContent.toLowerCase()}.`);
    emailInput.focus();
  });
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('is-active');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-active');
  });
});

dropZone.addEventListener('drop', (event) => {
  const files = event.dataTransfer.files;
  if (files && files.length) {
    handleFiles(files);
    return;
  }

  const text = event.dataTransfer.getData('text/plain');
  if (text) {
    emailInput.value = text;
    setMessage('Loaded dropped text.');
  }
});

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    classifyEmail();
  }
});

loadDashboardMetrics();
