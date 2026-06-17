const form = document.getElementById('applicationForm');
const pages = [...document.querySelectorAll('.step-page')];
const progressBar = document.getElementById('progressBar');
const progressSteps = [...document.querySelectorAll('[data-progress-step]')];

let currentStep = 1;

const data = {
  shareholders: []
};

function value(name) {
  const field = form.elements[name];

  if (!field) return '';

  if (field instanceof RadioNodeList) {
    const checked = [...field].find(item => item.checked);
    return checked ? checked.value : '';
  }

  if (field.type === 'checkbox') {
    return field.checked;
  }

  return field.value?.trim?.() ?? field.value ?? '';
}

function collectFormData() {
  return {
    step1: {
      '법인의 소유주': value('ownerType'),
      '설립 법인 형태': value('entityType'),
      '사업장 소재 주(State)': value('businessState'),
      '설립 법인명(영문)': value('companyName'),
      '법인격 표시(Designator)': value('designator'),
      '임원진 1순위 후보': value('officer1'),
      '임원진 2순위 후보': value('officer2'),
      '임원진 3순위 후보': value('officer3'),
      '미국 사업장 Street Address': value('usStreet'),
      '미국 사업장 City': value('usCity'),
      '미국 사업장 State': value('usState'),
      '미국 사업장 Zip Code': value('usZip'),
      '미국 내 사업장 전화번호': value('noUsPhone')
        ? '현재 미국 내 전화번호가 없습니다'
        : value('usPhone')
    },
    step2: {
      '한 주당 액면가': value('parValue') ? `${value('parValue')} USD` : '',
      '총 주식 수': value('totalShares') ? `${value('totalShares')} 주` : '',
      '등록된 주주 수': `${data.shareholders.length}명`
    },
    step3: {
      '공유 오피스 신청': value('virtualOffice')
    },
    step4: {
      '미국 법인 계좌 개설 지원 서비스 신청 여부': value('bankAccountService'),
      'DBA (Fictitious Business Name)': value('dbaName'),
      'Website or Company Email': value('websiteOrEmail'),
      '안내 사항': '계좌 개설 은행에 대한 자세한 사항은 별도 안내를 통해 진행될 예정입니다.'
    }
  };
}

function showStep(step) {
  currentStep = Math.max(1, Math.min(4, step));

  pages.forEach(page => {
    page.classList.toggle('active', Number(page.dataset.step) === currentStep);
  });

  progressBar.style.width = `${currentStep * 25}%`;

  progressSteps.forEach(item => {
    item.classList.toggle('active', Number(item.dataset.progressStep) <= currentStep);
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

document.querySelectorAll('.next-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showStep(currentStep + 1);
  });
});

document.querySelectorAll('.prev-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showStep(currentStep - 1);
  });
});

const shareholderModal = document.getElementById('shareholderModal');
const reviewModal = document.getElementById('reviewModal');
const paymentModal = document.getElementById('paymentModal');
const shareholderCount = document.getElementById('shareholderCount');
const shareholderList = document.getElementById('shareholderList');
const shareholderSelect = document.getElementById('shareholderSelect');

function openModal(modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('openShareholderBtn').addEventListener('click', () => {
  openModal(shareholderModal);
});

document.querySelectorAll('[data-close-shareholder]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(shareholderModal);
  });
});

document.querySelectorAll('[data-close-review]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(reviewModal);
  });
});

document.querySelectorAll('[data-close-payment]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(paymentModal);
  });
});

[shareholderModal, reviewModal, paymentModal].forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

function shareholderField(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}

function clearShareholderFields() {
  ['shName', 'shShares', 'shPercent', 'shAddress', 'shEmail', 'shPhone'].forEach(id => {
    document.getElementById(id).value = '';
  });

  document.getElementById('shType').value = '개인';
}

document.getElementById('saveShareholderBtn').addEventListener('click', () => {
  const shareholder = {
    type: shareholderField('shType'),
    name: shareholderField('shName'),
    shares: shareholderField('shShares'),
    percent: shareholderField('shPercent'),
    address: shareholderField('shAddress'),
    email: shareholderField('shEmail'),
    phone: shareholderField('shPhone')
  };

  if (!shareholder.name) {
    alert('주주명을 입력해주세요.');
    return;
  }

  data.shareholders.push(shareholder);
  renderShareholders();
  clearShareholderFields();
  closeModal(shareholderModal);
});

function renderShareholders() {
  shareholderCount.textContent = `등록된 주주: ${data.shareholders.length}명`;
  shareholderSelect.innerHTML = '<option value="">주주 선택</option>';

  data.shareholders.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${item.name}`;
    shareholderSelect.appendChild(option);
  });

  if (!data.shareholders.length) {
    shareholderList.className = 'shareholder-list empty';
    shareholderList.textContent = '등록된 주주 정보가 없습니다.';
    return;
  }

  shareholderList.className = 'shareholder-list';
  shareholderList.innerHTML = data.shareholders.map((item, index) => `
    <div class="shareholder-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <div class="helper-text">
          ${escapeHtml(item.type)} · ${escapeHtml(item.shares || '-')}주 · ${escapeHtml(item.percent || '-')}%
        </div>
      </div>
      <button type="button" onclick="removeShareholder(${index})">삭제</button>
    </div>
  `).join('');
}

window.removeShareholder = function(index) {
  data.shareholders.splice(index, 1);
  renderShareholders();
};

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function displayValue(v) {
  if (v === true) return '예';
  if (v === false) return '아니요';
  return escapeHtml(v || '-');
}

function makeTable(rows) {
  return `
    <table class="review-table">
      <tbody>
        ${Object.entries(rows).map(([key, val]) => `
          <tr>
            <th>${escapeHtml(key)}</th>
            <td>${displayValue(val)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function buildReview() {
  const collected = collectFormData();

  const shareholdersRows = data.shareholders.length
    ? data.shareholders.map((item, index) => `
      <tr>
        <th>${index + 1}. ${escapeHtml(item.name)}</th>
        <td>
          유형: ${escapeHtml(item.type || '-')}<br />
          보유 주식 수: ${escapeHtml(item.shares || '-')}주<br />
          지분율: ${escapeHtml(item.percent || '-')}%<br />
          주소: ${escapeHtml(item.address || '-')}<br />
          이메일: ${escapeHtml(item.email || '-')}<br />
          전화번호: ${escapeHtml(item.phone || '-')}
        </td>
      </tr>
    `).join('')
    : '<tr><th>주주 명부</th><td>등록된 주주 정보가 없습니다.</td></tr>';

  return `
    <section class="review-section">
      <h3>STEP 1. 설립 법인 정보</h3>
      ${makeTable(collected.step1)}
    </section>

    <section class="review-section">
      <h3>STEP 2. 주가 정보</h3>
      ${makeTable(collected.step2)}
      <table class="review-table">
        <tbody>${shareholdersRows}</tbody>
      </table>
    </section>

    <section class="review-section">
      <h3>STEP 3. 사업장 소재지 등록 / 공유 오피스 계약</h3>
      ${makeTable(collected.step3)}
    </section>

    <section class="review-section">
      <h3>STEP 4. 미국 법인 계좌 개설 정보</h3>
      ${makeTable(collected.step4)}
    </section>
  `;
}

document.getElementById('reviewBtn').addEventListener('click', () => {
  document.getElementById('reviewContent').innerHTML = buildReview();
  openModal(reviewModal);
});

document.getElementById('demoPayBtn').addEventListener('click', () => {
  closeModal(reviewModal);
  openModal(paymentModal);
});

document.getElementById('finishDemoBtn').addEventListener('click', () => {
  closeModal(paymentModal);

  const toast = document.getElementById('toast');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
});

form.elements.noUsPhone.addEventListener('change', e => {
  form.elements.usPhone.disabled = e.target.checked;

  if (e.target.checked) {
    form.elements.usPhone.value = '';
  }
});

showStep(1);
