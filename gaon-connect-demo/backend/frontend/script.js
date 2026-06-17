const API_BASE_URL = 'http://localhost:3000';

/**
 * 테스트용 ID
 * 네가 예시로 말한 DB 문서 ID
 */
const TEST_INCORPORATION_ID = '698a8e207382e4a43f5c38bf';

/**
 * 실제 서비스에서는 Step 1 저장 후 받은 _id를 localStorage에 저장해서 사용하면 됨.
 */
function getCurrentIncorporationId() {
  const savedId = localStorage.getItem('incorporationId');

  if (savedId) {
    return savedId;
  }

  return TEST_INCORPORATION_ID;
}

const pages = document.querySelectorAll('.step-page');
const progressSteps = document.querySelectorAll('.progress-step');
const progressBar = document.getElementById('progressBar');

const reviewBtn = document.getElementById('reviewBtn');
const reviewModal = document.getElementById('reviewModal');
const reviewContent = document.getElementById('reviewContent');
const demoPayBtn = document.getElementById('demoPayBtn');
const backToReviewBtn = document.getElementById('backToReviewBtn');

const shareholderModal = document.getElementById('shareholderModal');
const openShareholderBtn = document.getElementById('openShareholderBtn');
const saveShareholderBtn = document.getElementById('saveShareholderBtn');
const shareholderList = document.getElementById('shareholderList');
const shareholderCount = document.getElementById('shareholderCount');
const shareholderSelect = document.getElementById('shareholderSelect');

const totalAmountEl = document.getElementById('totalAmount');
const bankAmountEl = document.getElementById('bankAmount');
const serviceButtons = document.querySelectorAll('.service-btn');

const toast = document.getElementById('toast');
const submitPaymentBtn = document.getElementById('submitPaymentBtn');

let currentStep = 1;
let shareholders = [];
let selectedServices = [];
let totalAmount = 0;

function showStep(stepNumber) {
  currentStep = stepNumber;

  pages.forEach((page) => {
    const pageStep = Number(page.dataset.step);
    page.classList.toggle('active', pageStep === stepNumber);
  });

  updateProgress(stepNumber);
}

function updateProgress(stepNumber) {
  if (!progressBar) return;

  const normalizedStep = Math.min(stepNumber, 4);
  const percent = ((normalizedStep - 1) / 3) * 100;

  progressBar.style.width = `${percent}%`;

  progressSteps.forEach((step) => {
    const stepValue = Number(step.dataset.progressStep);
    step.classList.toggle('active', stepValue <= normalizedStep);
  });
}

document.querySelectorAll('.next-btn').forEach((button) => {
  button.addEventListener('click', () => {
    showStep(currentStep + 1);
  });
});

document.querySelectorAll('.prev-btn').forEach((button) => {
  button.addEventListener('click', () => {
    showStep(currentStep - 1);
  });
});

function openModal(modal) {
  if (!modal) return;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-close-review]').forEach((button) => {
  button.addEventListener('click', () => {
    closeModal(reviewModal);
  });
});

document.querySelectorAll('[data-close-shareholder]').forEach((button) => {
  button.addEventListener('click', () => {
    closeModal(shareholderModal);
  });
});

if (openShareholderBtn) {
  openShareholderBtn.addEventListener('click', () => {
    openModal(shareholderModal);
  });
}

if (saveShareholderBtn) {
  saveShareholderBtn.addEventListener('click', () => {
    const type = document.getElementById('shType').value;
    const name = document.getElementById('shName').value;
    const shares = document.getElementById('shShares').value;
    const percent = document.getElementById('shPercent').value;
    const address = document.getElementById('shAddress').value;
    const email = document.getElementById('shEmail').value;
    const phone = document.getElementById('shPhone').value;

    if (!name) {
      alert('주주명을 입력해주세요.');
      return;
    }

    const shareholder = {
      id: Date.now().toString(),
      type,
      name,
      shares,
      percent,
      address,
      email,
      phone,
    };

    shareholders.push(shareholder);
    renderShareholders();
    resetShareholderForm();
    closeModal(shareholderModal);
  });
}

function resetShareholderForm() {
  document.getElementById('shName').value = '';
  document.getElementById('shShares').value = '';
  document.getElementById('shPercent').value = '';
  document.getElementById('shAddress').value = '';
  document.getElementById('shEmail').value = '';
  document.getElementById('shPhone').value = '';
}

function renderShareholders() {
  if (!shareholderList || !shareholderCount || !shareholderSelect) return;

  shareholderCount.textContent = `등록된 주주: ${shareholders.length}명`;
  shareholderSelect.innerHTML = '<option value="">주주 선택</option>';

  shareholders.forEach((shareholder) => {
    const option = document.createElement('option');
    option.value = shareholder.id;
    option.textContent = shareholder.name;
    shareholderSelect.appendChild(option);
  });

  if (shareholders.length === 0) {
    shareholderList.classList.add('empty');
    shareholderList.innerHTML = '등록된 주주 정보가 없습니다.';
    return;
  }

  shareholderList.classList.remove('empty');

  shareholderList.innerHTML = shareholders
    .map(
      (shareholder) => `
        <div class="shareholder-card">
          <strong>${escapeHtml(shareholder.name)}</strong>
          <p>유형: ${escapeHtml(shareholder.type)}</p>
          <p>보유 주식 수: ${escapeHtml(shareholder.shares || '-')}</p>
          <p>지분율: ${escapeHtml(shareholder.percent || '-')}%</p>
          <p>주소: ${escapeHtml(shareholder.address || '-')}</p>
          <p>이메일: ${escapeHtml(shareholder.email || '-')}</p>
          <p>전화번호: ${escapeHtml(shareholder.phone || '-')}</p>
        </div>
      `
    )
    .join('');
}

/**
 * STEP 4의 "입력 내용 확인" 버튼 클릭 시
 * DB에서 incorporation 데이터를 가져와서 리뷰 모달에 출력
 */
if (reviewBtn) {
  reviewBtn.addEventListener('click', async () => {
    try {
      const incorporationId = getCurrentIncorporationId();

      if (!incorporationId) {
        alert('신청서 ID가 없습니다.');
        return;
      }

      reviewContent.innerHTML = '<p>신청 정보를 불러오는 중입니다...</p>';
      openModal(reviewModal);

      const data = await fetchIncorporationById(incorporationId);

      reviewContent.innerHTML = renderReview(data);
    } catch (error) {
      console.error(error);

      reviewContent.innerHTML = `
        <div class="review-section">
          <h3>오류</h3>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  });
}

async function fetchIncorporationById(id) {
  const response = await fetch(`${API_BASE_URL}/api/incorporations/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '신청 정보를 불러오지 못했습니다.');
  }

  return data;
}

function renderReview(data) {
  const step1 = data.step1 || {};
  const step2 = data.step2 || {};
  const step3 = data.step3 || {};
  const step4 = data.step4 || {};
  const step7 = data.step7 || {};
  const step9 = data.step9 || {};

  const owner = step1.owner || {};
  const company = step1.company || {};
  const register = step2.register || {};

  const dbShareholders = register.shareholders || [];
  const dbMembers = register.members || [];

  return `
    <div class="review-section">
      <h3>신청서 기본 정보</h3>
      ${reviewRow('신청서 ID', data._id)}
      ${reviewRow('현재 단계', data.currentStep)}
      ${reviewRow('생성일', formatDate(data.createdAt))}
      ${reviewRow('수정일', formatDate(data.updatedAt))}
      ${reviewRow('마감일', data.dueDate)}
    </div>

    <div class="review-section">
      <h3>STEP 1. 소유주 정보</h3>
      ${reviewRow('Step 상태', step1.status)}
      ${reviewRow('소유주 유형', formatOwnerType(owner.type))}
      ${reviewRow('개인 이름', owner.name)}
      ${reviewRow('개인 영문명', owner.nameEnglish)}
      ${reviewRow('회사명', owner.companyName)}
      ${reviewRow('회사 영문명', owner.companyNameEnglish)}
      ${reviewRow('대표자명', owner.representativeName)}
      ${reviewRow('사업자등록번호', maskSensitive(owner.businessRegistrationNumber))}
      ${reviewFileRow('사업자등록증', owner.businessRegistrationCertificate)}
    </div>

    <div class="review-section">
      <h3>STEP 1. 설립 법인 정보</h3>
      ${reviewRow('법인 형태', formatCompanyType(company.type))}
      ${reviewRow('법인명 1순위', company.nameEnglish)}
      ${reviewRow('법인명 2순위', company.secondaryNameEnglish)}
      ${reviewRow('법인명 3순위', company.thirdNameEnglish)}
      ${reviewRow('Designator', company.designator)}
      ${reviewRow('주(State)', company.state)}
      ${reviewRow('Street Address', company.streetAddress)}
      ${reviewRow('City', company.city)}
      ${reviewRow('Zip Code', company.zipCode)}
    </div>

    <div class="review-section">
      <h3>STEP 2. 주식 / 지분 정보</h3>
      ${reviewRow('Step 상태', step2.status)}
      ${reviewRow('등록 유형', formatCompanyType(register.type))}
      ${reviewRow('한 주당 액면가', formatCurrency(step2.perValue))}
      ${reviewRow('총 주식 수', formatNumber(step2.authorizedShares))}
    </div>

    <div class="review-section">
      <h3>STEP 2. 주주 명부</h3>
      ${renderShareholderReview(dbShareholders)}
    </div>

    <div class="review-section">
      <h3>STEP 2. LLC 멤버 명부</h3>
      ${renderMemberReview(dbMembers)}
    </div>

    <div class="review-section">
      <h3>STEP 3. 서비스 / 결제 전 정보</h3>
      ${reviewRow('Step 상태', step3.status)}
      ${reviewRow('선택 서비스', formatServices(step3.selectedServices))}
      ${reviewRow('결제 증빙 유형', step3.paymentProof?.type)}
      ${reviewRow('현금영수증 전화번호', maskPhone(step3.paymentProof?.phoneNumber))}
      ${reviewRow('세금계산서 사업자명', step3.paymentProof?.businessName)}
      ${reviewRow('세금계산서 대표자명', step3.paymentProof?.representativeName)}
      ${reviewRow('세금계산서 사업자등록번호', maskSensitive(step3.paymentProof?.businessRegistrationNumber))}
      ${reviewRow('입금자명', step3.depositorName)}
    </div>

    <div class="review-section">
      <h3>STEP 4. 공유오피스 / 진행 상태</h3>
      ${reviewRow('Step 상태', step4.status)}
      ${reviewRow('공유오피스 요청', step4.officeRequest === true ? '예' : '아니오')}
    </div>

    <div class="review-section">
      <h3>서명 정보</h3>
      ${reviewRow('서명 상태', step7.status)}
      ${reviewRow('SignNow 문서 ID', step7.signnowDocumentId)}
      ${reviewRow('서명일', formatDate(step7.signedAt))}
      ${reviewLinkRow('서명 링크', step7.signingLink)}
    </div>

    <div class="review-section">
      <h3>은행 계좌 개설 추가 정보</h3>
      ${reviewRow('Step 상태', step9.status)}
      ${reviewRow('주소', joinAddress(step9))}
      ${reviewRow('국가', step9.country)}
      ${reviewRow('전화번호', maskPhone(step9.phoneNumber || step9.internationalPhone))}
      ${reviewRow('이메일', step9.email)}
      ${reviewRow('어머니 성함', step9.mothersMaidenName)}
      ${reviewRow('직업', step9.occupation)}
      ${reviewRow('업종', step9.industry)}
      ${reviewRow('미국 내 사업 목적', step9.businessPurposeUS)}
      ${reviewRow('예상 거래량', step9.expectedTransactionVolume)}
      ${reviewRow('예상 거래금액', step9.expectedTransactionAmount)}
    </div>
  `;
}

if (demoPayBtn) {
  demoPayBtn.addEventListener('click', () => {
    closeModal(reviewModal);
    showStep(5);
  });
}

if (backToReviewBtn) {
  backToReviewBtn.addEventListener('click', () => {
    showStep(4);
  });
}

serviceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const serviceName = button.dataset.serviceName;
    const servicePrice = Number(button.dataset.servicePrice || 0);

    const existingIndex = selectedServices.findIndex(
      (service) => service.name === serviceName
    );

    if (existingIndex >= 0) {
      selectedServices.splice(existingIndex, 1);
      button.classList.remove('selected');
      button.textContent = '서비스 신청';
    } else {
      selectedServices.push({
        name: serviceName,
        price: servicePrice,
      });
      button.classList.add('selected');
      button.textContent = '신청 취소';
    }

    totalAmount = selectedServices.reduce((sum, service) => {
      return sum + service.price;
    }, 0);

    updateTotalAmount();
  });
});

function updateTotalAmount() {
  const formatted = `$${totalAmount.toLocaleString()}`;

  if (totalAmountEl) {
    totalAmountEl.textContent = formatted;
  }

  if (bankAmountEl) {
    bankAmountEl.textContent = formatted;
  }
}

if (submitPaymentBtn) {
  submitPaymentBtn.addEventListener('click', () => {
    showToast('결제 신청이 완료되었습니다.');
  });
}

function showToast(message) {
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 2500);
}

function reviewRow(label, value) {
  return `
    <div class="review-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${value === undefined || value === null || value === '' ? '-' : escapeHtml(String(value))}</span>
    </div>
  `;
}

function reviewLinkRow(label, url) {
  if (!url) {
    return reviewRow(label, '-');
  }

  return `
    <div class="review-row">
      <strong>${escapeHtml(label)}</strong>
      <span>
        <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
          링크 열기
        </a>
      </span>
    </div>
  `;
}

function reviewFileRow(label, file) {
  if (!file) {
    return reviewRow(label, '-');
  }

  const fileName = file.name || '첨부파일';
  const fileUrl = file.location;

  if (!fileUrl) {
    return reviewRow(label, fileName);
  }

  return `
    <div class="review-row">
      <strong>${escapeHtml(label)}</strong>
      <span>
        <a href="${escapeHtml(fileUrl)}" target="_blank" rel="noreferrer">
          ${escapeHtml(fileName)}
        </a>
      </span>
    </div>
  `;
}

function renderShareholderReview(items) {
  if (!items || items.length === 0) {
    return '<p class="empty-text">등록된 주주가 없습니다.</p>';
  }

  return items
    .map(
      (item, index) => `
        <div class="review-card">
          <h4>주주 ${index + 1}</h4>
          ${reviewRow('이름', item.fullname)}
          ${reviewRow('영문명', item.fullnameEnglish)}
          ${reviewRow('SSN/ITIN', maskSensitive(item.ssnOrItin))}
          ${reviewRow('보유 주식 수', formatNumber(item.owned))}
          ${reviewFileRow('여권 / 첨부파일', item.passport)}
        </div>
      `
    )
    .join('');
}

function renderMemberReview(items) {
  if (!items || items.length === 0) {
    return '<p class="empty-text">등록된 멤버가 없습니다.</p>';
  }

  return items
    .map(
      (item, index) => `
        <div class="review-card">
          <h4>멤버 ${index + 1}</h4>
          ${reviewRow('이름', item.fullname)}
          ${reviewRow('영문명', item.fullnameEnglish)}
          ${reviewRow('SSN/ITIN', maskSensitive(item.ssnOrItin))}
          ${reviewRow('지분율', item.ownershipPercentage !== undefined ? `${item.ownershipPercentage}%` : '-')}
          ${reviewFileRow('여권 / 첨부파일', item.passport)}
        </div>
      `
    )
    .join('');
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('ko-KR');
}

function formatNumber(value) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString();
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `$${number.toLocaleString()}`;
}

function formatServices(services) {
  if (!services || services.length === 0) {
    return '-';
  }

  const serviceMap = {
    incorporation: '미국 법인 설립',
    'bank-account': '미국 법인 계좌 개설',
    'expedited-filing': '빠른 설립',
  };

  return services.map((service) => serviceMap[service] || service).join(', ');
}

function formatOwnerType(type) {
  const typeMap = {
    individual: '개인',
    company: '회사',
  };

  return typeMap[type] || type || '-';
}

function formatCompanyType(type) {
  const typeMap = {
    'c-corp': 'C-Corporation',
    llc: 'LLC',
  };

  return typeMap[type] || type || '-';
}

function joinAddress(data) {
  const parts = [
    data.streetAddress,
    data.city,
    data.state,
    data.zipCode,
    data.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '-';
}

function maskSensitive(value) {
  if (!value) return '-';

  const str = String(value);

  if (str.length <= 4) {
    return '*'.repeat(str.length);
  }

  return `${str.slice(0, 3)}${'*'.repeat(Math.max(str.length - 5, 0))}${str.slice(-2)}`;
}

function maskPhone(value) {
  if (!value) return '-';

  const str = String(value).replace(/[^0-9]/g, '');

  if (str.length <= 4) {
    return '*'.repeat(str.length);
  }

  return `${str.slice(0, 3)}****${str.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

showStep(1);
renderShareholders();
updateTotalAmount();
