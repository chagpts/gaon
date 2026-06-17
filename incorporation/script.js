const form = document.getElementById('applicationForm');

const pages = Array.from(document.querySelectorAll('.step-page'));
const progressBar = document.getElementById('progressBar');
const progressSteps = Array.from(document.querySelectorAll('[data-progress-step]'));

let currentStep = 1;

const data = {
  shareholders: []
};

function showStep(step) {
  currentStep = Math.max(1, Math.min(4, step));

  pages.forEach(page => {
    page.classList.toggle('active', Number(page.dataset.step) === currentStep);
  });

  if (progressBar) {
    progressBar.style.width = `${currentStep * 25}%`;
  }

  progressSteps.forEach(item => {
    item.classList.toggle('active', Number(item.dataset.progressStep) <= currentStep);
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

document.querySelectorAll('.next-btn').forEach(button => {
  button.addEventListener('click', () => {
    showStep(currentStep + 1);
  });
});

document.querySelectorAll('.prev-btn').forEach(button => {
  button.addEventListener('click', () => {
    showStep(currentStep - 1);
  });
});

function getValue(name) {
  const field = form.elements[name];

  if (!field) return '';

  if (field instanceof RadioNodeList) {
    const checked = Array.from(field).find(item => item.checked);
    return checked ? checked.value : '';
  }

  if (field.type === 'checkbox') {
    return field.checked;
  }

  return field.value ? field.value.trim() : '';
}

function collectFormData() {
  return {
    step1: {
      '법인의 소유주': getValue('ownerType'),
      '설립 법인 형태': getValue('entityType'),
      '사업장 소재 주(State)': getValue('businessState'),
      '설립 법인명(영문)': getValue('companyName'),
      '법인격 표시(Designator)': getValue('designator'),
      '임원진 1순위 후보': getValue('officer1'),
      '임원진 2순위 후보': getValue('officer2'),
      '임원진 3순위 후보': getValue('officer3'),
      '미국 사업장 Street Address': getValue('usStreet'),
      '미국 사업장 City': getValue('usCity'),
      '미국 사업장 State': getValue('usState'),
      '미국 사업장 Zip Code': getValue('usZip'),
      '미국 내 사업장 전화번호': getValue('noUsPhone')
        ? '현재 미국 내 전화번호가 없습니다'
        : getValue('usPhone')
    },

    step2: {
      '한 주당 액면가': getValue('parValue') ? `${getValue('parValue')} USD` : '',
      '총 주식 수': getValue('totalShares') ? `${getValue('totalShares')} 주` : '',
      '등록된 주주 수': `${data.shareholders.length}명`
    },

    step3: {
      '공유 오피스 신청': getValue('virtualOffice')
    },

    step4: {
      '한국 거주 주소 Street Address': getValue('krStreet'),
      '한국 거주 주소 City': getValue('krCity'),
      '한국 거주 주소 State': getValue('krState'),
      '한국 거주 주소 Zip Code': getValue('krZip'),
      'Primary country of residence': getValue('residenceCountry'),
      '미국 영주권 / 시민권 유무': getValue('usStatus'),
      'Cell phone': getValue('noCellPhone') ? '없음' : getValue('cellPhone'),
      'International Phone': getValue('internationalPhone'),
      'Email address': getValue('email'),
      "Mother's maiden name": getValue('motherMaidenName')
        ? '입력됨 / 리뷰 화면 비공개'
        : ''
    }
  };
}

const shareholderModal = document.getElementById('shareholderModal');
const reviewModal = document.getElementById('reviewModal');
const paymentModal = document.getElementById('paymentModal');

const shareholderCount = document.getElementById('shareholderCount');
const shareholderList = document.getElementById('shareholderList');
const shareholderSelect = document.getElementById('shareholderSelect');

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('openShareholderBtn').addEventListener('click', () => {
  openModal(shareholderModal);
});

document.querySelectorAll('[data-close-shareholder]').forEach(button => {
  button.addEventListener('click', () => {
    closeModal(shareholderModal);
  });
});

document.querySelectorAll('[data-close-review]').forEach(button => {
  button.addEventListener('click', () => {
    closeModal(reviewModal);
  });
});

document.querySelectorAll('[data-close-payment]').forEach(button => {
  button.addEventListener('click', () => {
    closeModal(paymentModal);
  });
});

[shareholderModal, reviewModal, paymentModal].forEach(modal => {
  if (!modal) return;

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

function shareholderField(id) {
  const element = document.getElementById(id);
  return element && element.value ? element.value.trim() : '';
}

function clearShareholderFields() {
  document.getElementById('shType').value = '개인';
  document.getElementById('shName').value = '';
  document.getElementById('shShares').value = '';
  document.getElementById('shPercent').value = '';
  document.getElementById('shAddress').value = '';
  document.getElementById('shEmail').value = '';
  document.getElementById('shPhone').value = '';
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

  if (data.shareholders.length === 0) {
    shareholderList.className = 'shareholder-list empty';
    shareholderList.textContent = '등록된 주주 정보가 없습니다.';
    return;
  }

  shareholderList.className = 'shareholder-list';

  shareholderList.innerHTML = data.shareholders.map((item, index) => {
    return `
      <div class="shareholder-item">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <div class="helper-text">
            ${escapeHtml(item.type)} · ${escapeHtml(item.shares || '-')}주 · ${escapeHtml(item.percent || '-')}%
          </div>
        </div>
        <button type="button" onclick="removeShareholder(${index})">삭제</button>
      </div>
    `;
  }).join('');
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

function displayValue(value) {
  if (value === true) return '예';
  if (value === false) return '아니요';

  if (!value) return '-';

  return escapeHtml(value);
}

function makeTable(rows) {
  return `
    <table class="review-table">
      <tbody>
        ${Object.entries(rows).map(([key, value]) => {
          return `
            <tr>
              <th>${escapeHtml(key)}</th>
              <td>${displayValue(value)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function buildReview() {
  const collected = collectFormData();

  const shareholderRows = data.shareholders.length
    ? data.shareholders.map((item, index) => {
        return `
          <tr>
            <th>${index + 1}. ${escapeHtml(item.name)}</th>
            <td>
              유형: ${escapeHtml(item.type || '-')}<br>
              보유 주식 수: ${escapeHtml(item.shares || '-')}주<br>
              지분율: ${escapeHtml(item.percent || '-')}%<br>
              주소: ${escapeHtml(item.address || '-')}<br>
              이메일: ${escapeHtml(item.email || '-')}<br>
              전화번호: ${escapeHtml(item.phone || '-')}
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <th>주주 명부</th>
        <td>등록된 주주 정보가 없습니다.</td>
      </tr>
    `;

  return `
    <section class="review-section">
      <h3>STEP 1. 설립 법인 정보</h3>
      ${makeTable(collected.step1)}
    </section>

    <section class="review-section">
      <h3>STEP 2. 주가 정보</h3>
      ${makeTable(collected.step2)}
      <table class="review-table">
        <tbody>${shareholderRows}</tbody>
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

if (form.elements.noUsPhone) {
  form.elements.noUsPhone.addEventListener('change', event => {
    form.elements.usPhone.disabled = event.target.checked;

    if (event.target.checked) {
      form.elements.usPhone.value = '';
    }
  });
}

if (form.elements.noCellPhone) {
  form.elements.noCellPhone.addEventListener('change', event => {
    form.elements.cellPhone.disabled = event.target.checked;

    if (event.target.checked) {
      form.elements.cellPhone.value = '';
    }
  });
}

showStep(1);
