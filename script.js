// Quiz data is kept in one place so the owner can replace the placeholder
// content easily without touching the rest of the application logic.
const quizQuestions = [
  {
    question: "Apa makanan lebaran kesukaan Erlang?",
    options: ["Putri salju", "Kastengel", "Nastar", "Lidah kucing"],
    answer: 2,
  },
  {
    question: "Erlang SMA dimana?",
    options: [
      "SMA Negeri 2 Klaten",
      "SMA Semesta Semarang",
      "SMA Negeri 1 Sampit",
      "SMA Islam Al Azhar 9 Yogyakarta",
    ],
    answer: 3,
  },
  {
    question: "Mana dibawah ini yang tidak pernah diikuti Erlang?",
    options: ["Malpres", "Komatik", "Omah TI", "Global Village Winter Peak "],
    answer: 2,
  },
  {
    question:
      "Saat berbuka puasa, dihidangkan makanan berikut. Makanan apa yang Erlang makan pertama?",
    options: ["Risol mayo", "Kolak Pisang", "Kurma", "Martabak manis"],
    answer: 1,
  },
  {
    question: "Siapa orang yang paling baik sama Erlang?",
    options: ["[nama user]", "Avatar", "Ler", "Ozo"],
    answer: 0,
  },
  {
    question: "Kalau jadi hewan, Erlang mau jadi apa?",
    options: ["Dinosaurus", "Capybara", "Naga", "Gurita"],
    answer: 2,
  },
  {
    question:
      "Saat masih playgroup, Erlang suka nangis di kelas. Mengapa hal itu terjadi?",
    options: [
      "Erlang gak ngerti belajar apa",
      "Erlang dibully oleh teman-temannya",
      "Erlang sedih ditinggal mama nya pulang ke rumah",
      "Erlang gak suka sekolahnya",
    ],
    answer: 2,
  },
  {
    question:
      "Erlang diberi satu barang untuk membantu menjalankan sebuah misi. Barang apa yang bakal Erlang pilih?",
    options: [
      "Jam tangan yang bisa mengulang waktu 5 menit terakhir",
      "Kacamata yang bisa melihat niat orang lain",
      "Sepatu yang bisa berjalan di udara",
      "Headphone yang bisa berbicata dengan hewan",
    ],
    answer: 1,
  },
  {
    question:
      "Apa kemungkinan besar reaksi Erlang kalau lagi sendirian di rumah, tiba-tiba ada hantu yang ngintip di jendela…",
    options: ["Nangis", "Telpon mama", "Lari", "Cek jendela"],
    answer: 2,
  },
  {
    question:
      "Erlang ditawari permen oleh [nama user], sebelum menjawab apa yang ada dipikiran Erlang?",
    options: [
      "Baik banget sih [nama user]… 🩵☺️",
      "Ambil aja, kasihan kalau ditolak",
      "Itu enak gak ya… kalau gak enak gmn",
      "Segini doang dia ngasihnya?",
    ],
    answer: 0,
  },
];

const state = {
  currentScreen: "welcomeScreen",
  currentQuestionIndex: 0,
  visitorName: "",
  answers: new Array(quizQuestions.length).fill(null),
  bonusOptions: [],
  lastBonusLayoutSignature: "",
  selectedBonusIndex: null,
  selectedBonusAmount: 0,
  bonusRevealLocked: false,
  bonusCompleted: false,
};

const screens = document.querySelectorAll(".screen");
const topProgress = document.getElementById("topProgress");
const openGreetingBtn = document.getElementById("openGreetingBtn");
const nameForm = document.getElementById("nameForm");
const claimForm = document.getElementById("claimForm");
const paymentMethod = document.getElementById("paymentMethod");
const conditionalFields = document.querySelectorAll(".conditional-field");
const phoneNumberLabel = document.getElementById("phoneNumberLabel");
const phoneNumberInput = document.getElementById("phoneNumber");
const bankNameSelect = document.getElementById("bankName");
const customBankNameInput = document.getElementById("customBankName");
const bankNumberInput = document.getElementById("bankNumber");
const accountNameInput = document.getElementById("accountName");
const quizContent = document.getElementById("quizContent");
const questionProgress = document.getElementById("questionProgress");
const quizProgressBar = document.getElementById("quizProgressBar");
const prevQuestionBtn = document.getElementById("prevQuestionBtn");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const claimSuccess = document.getElementById("claimSuccess");
const celebrationCanvas = document.getElementById("celebrationCanvas");
const celebrationContext = celebrationCanvas.getContext("2d");
const envelopeOpenSound = document.getElementById("envelopeOpenSound");
const failSound = document.getElementById("failSound");
const normalSound = document.getElementById("normalSound");
const successSound = document.getElementById("successSound");
const openingSequence = document.getElementById("openingSequence");
const resultClaimBtn = document.getElementById("resultClaimBtn");
const resultName = document.getElementById("resultName");
const resultScore = document.getElementById("resultScore");
const resultReward = document.getElementById("resultReward");
const resultGreeting = document.getElementById("resultGreeting");
const resultDetail = document.getElementById("resultDetail");
const resultRoast = document.getElementById("resultRoast");
const bonusModal = document.getElementById("bonusModal");
const bonusBoxes = document.getElementById("bonusBoxes");
const bonusStatus = document.getElementById("bonusStatus");
const bonusCloseBtn = document.getElementById("bonusCloseBtn");
const claimFormStatus = document.getElementById("claimFormStatus");
const claimSubmitButton = claimForm.querySelector('button[type="submit"]');

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyP9XVhaU9T3kBVFV2ivxDV71AT8s9mHnBC3msmKI49gYvH3rSqELCC4bPlZo93jvCqTA/exec";
const CLAIMS_STORAGE_KEY = "eid-thr-claims";

let celebrationFrame = null;
let greetingSequenceTimer = null;

envelopeOpenSound.volume = 0.45;
failSound.volume = 0.5;
normalSound.volume = 0.5;
successSound.volume = 0.55;

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function stopResultSounds() {
  [failSound, normalSound, successSound].forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
}

function playResultSound(score) {
  stopResultSounds();

  const targetSound =
    score === quizQuestions.length ? successSound : score >= 5 ? normalSound : failSound;

  targetSound.play().catch(() => {});
}

function personalizeText(text) {
  const nickname = state.visitorName || "kamu";
  return text.split("[nama user]").join(nickname);
}

function getRandomInt(max) {
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function shuffleArray(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomInt(index + 1);
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }

  return shuffledItems;
}

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("screen--active", screen.id === screenId);
  });

  state.currentScreen = screenId;
  topProgress.textContent = getScreenLabel(screenId);
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (screenId === "quizScreen") {
    renderQuestion();
  }

  if (screenId === "resultScreen") {
    if (!state.bonusCompleted && state.bonusOptions.length === 0) {
      initializeBonusGame();
    }
    renderResult();
    playCelebration();
    playResultSound(calculateScore());
  }

}

function playGreetingOpeningSequence() {
  if (greetingSequenceTimer) {
    window.clearTimeout(greetingSequenceTimer);
  }

  envelopeOpenSound.pause();
  envelopeOpenSound.currentTime = 0;
  stopResultSounds();

  openingSequence.classList.remove("hidden");
  openingSequence.classList.remove("is-active");
  openingSequence.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  window.requestAnimationFrame(() => {
    envelopeOpenSound.play().catch(() => {});
    openingSequence.classList.add("is-active");
  });

  greetingSequenceTimer = window.setTimeout(() => {
    openingSequence.classList.add("hidden");
    openingSequence.classList.remove("is-active");
    openingSequence.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    envelopeOpenSound.pause();
    envelopeOpenSound.currentTime = 0;
    showScreen("greetingScreen");
    greetingSequenceTimer = null;
  }, 2800);
}

function getScreenLabel(screenId) {
  const labels = {
    welcomeScreen: "Selamat Datang",
    greetingScreen: "Greeting",
    rulesScreen: "Aturan THR",
    nameScreen: "Isi Nama",
    quizScreen: "Quiz Berjalan",
    resultScreen: "Hasil THR",
    claimScreen: "Klaim THR",
  };

  return labels[screenId] || "Eid THR";
}

function renderQuestion() {
  const currentQuestion = quizQuestions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];

  questionProgress.textContent = `Pertanyaan ${state.currentQuestionIndex + 1} dari ${quizQuestions.length}`;
  quizProgressBar.style.width = `${((state.currentQuestionIndex + 1) / quizQuestions.length) * 100}%`;

  quizContent.innerHTML = `
    <p class="eyebrow">Quiz Tentang Aku</p>
    <h2 class="question-title">${personalizeText(currentQuestion.question)}</h2>
    <div class="option-list">
      ${currentQuestion.options
        .map(
          (option, index) => `
            <label class="option-item">
              <input
                type="radio"
                name="questionOption"
                value="${index}"
                ${selectedAnswer === index ? "checked" : ""}
              />
              <span class="option-label">
                <span class="option-badge">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${personalizeText(option)}</span>
              </span>
            </label>
          `
        )
        .join("")}
    </div>
  `;

  prevQuestionBtn.disabled = state.currentQuestionIndex === 0;
  prevQuestionBtn.style.opacity = state.currentQuestionIndex === 0 ? "0.5" : "1";
  nextQuestionBtn.textContent =
    state.currentQuestionIndex === quizQuestions.length - 1 ? "Lihat Hasil" : "Berikutnya";
}

function saveSelectedAnswer() {
  const selectedOption = document.querySelector('input[name="questionOption"]:checked');

  if (!selectedOption) {
    alert("Pilih satu jawaban dulu sebelum lanjut ya.");
    return false;
  }

  state.answers[state.currentQuestionIndex] = Number(selectedOption.value);
  return true;
}

function calculateScore() {
  return state.answers.reduce((total, answer, index) => {
    return total + (answer === quizQuestions[index].answer ? 1 : 0);
  }, 0);
}

function getBaseReward() {
  return calculateScore() * 1000;
}

function getFinalReward() {
  return getBaseReward() + state.selectedBonusAmount;
}

function getQuizAnswerSummary() {
  return quizQuestions.map((question, index) => {
    const selectedAnswerIndex = state.answers[index];

    return {
      questionNumber: index + 1,
      question: personalizeText(question.question),
      selectedAnswerIndex,
      selectedAnswer:
        selectedAnswerIndex !== null ? personalizeText(question.options[selectedAnswerIndex]) : null,
      isCorrect: selectedAnswerIndex === question.answer,
    };
  });
}

function getPaymentDetails(formData) {
  const paymentMethodValue = formData.get("paymentMethod");
  const bankNameValue = formData.get("bankName");
  const customBankNameValue = formData.get("customBankName");

  return {
    phoneNumber: formData.get("phoneNumber"),
    bankName: bankNameValue,
    customBankName: customBankNameValue,
    resolvedBankName:
      paymentMethodValue === "bank"
        ? bankNameValue === "Other / Bank Lainnya"
          ? customBankNameValue
          : bankNameValue
        : "",
    bankNumber: formData.get("bankNumber"),
    accountName: formData.get("accountName"),
    notes: formData.get("notes"),
  };
}

function buildClaimPayload(formData) {
  return {
    nickname: state.visitorName,
    answers: getQuizAnswerSummary(),
    score: calculateScore(),
    bonusThr: state.selectedBonusAmount,
    finalThr: getFinalReward(),
    fullName: formData.get("claimName"),
    paymentMethod: formData.get("paymentMethod"),
    paymentDetails: getPaymentDetails(formData),
    submittedAt: new Date().toISOString(),
  };
}

function saveClaimLocally(payload) {
  const existingClaims = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || "[]");
  existingClaims.push(payload);
  localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(existingClaims));
}

function setClaimFormStatus(message, type = "") {
  claimFormStatus.textContent = message;
  claimFormStatus.classList.toggle("hidden", !message);
  claimFormStatus.classList.toggle("is-loading", type === "loading");
  claimFormStatus.classList.toggle("is-error", type === "error");
}

function setClaimSubmissionState(isSubmitting) {
  claimSubmitButton.disabled = isSubmitting;
  claimSubmitButton.textContent = isSubmitting ? "Mengirim..." : "Kirim Klaim THR";
}

async function sendClaimToBackend(payload) {
  console.log("Sending claim payload:", payload);

  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("Backend response:", response);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

function renderResult() {
  const score = calculateScore();
  const baseReward = getBaseReward();
  const finalReward = getFinalReward();
  const resultTitle = document.querySelector("#resultScreen h2");

  resultName.textContent = state.visitorName;
  resultScore.textContent = `${score} jawaban benar dari ${quizQuestions.length}`;
  resultReward.textContent = formatRupiah(finalReward);
  resultDetail.textContent =
    state.selectedBonusAmount > 0 || state.bonusRevealLocked
      ? `${score} x Rp1.000 + Bonus ${formatRupiah(state.selectedBonusAmount)} = ${formatRupiah(finalReward)}`
      : `${score} x Rp1.000 = ${formatRupiah(baseReward)}`;

  if (score === quizQuestions.length) {
    resultTitle.textContent = "Perfect Score! THR Kamu Maksimal!";
    resultGreeting.textContent = "WOW! Semua benar, THR full untukmu 💸✨";
    resultRoast.textContent = "Fix lu my temen sejati gua 💯🔥";
  } else if (score >= 7) {
    resultTitle.textContent = "THR Kamu Sudah Dihitung";
    resultGreeting.textContent = "Selamat, kamu mengenal Erlang cukup baik!";
    resultRoast.textContent = "Lumayan... tapi masih harus sering ngobrol sama Erlang 😏";
  } else if (score >= 5) {
    resultTitle.textContent = "THR Kamu Sudah Dihitung";
    resultGreeting.textContent = "Makasih ya, udah ada effort";
    resultRoast.textContent = "Hmm... kayaknya masih banyak yang belum kamu tahu 👀";
  } else {
    resultTitle.textContent = "THR Kamu Sudah Dihitung";
    resultGreeting.textContent = "Jangan lupa bersyukur";
    resultRoast.textContent = "Kayaknya kamu ga kenal aku";
  }
}

function initializeBonusGame() {
  const rewardPool = [2000, 1000, 0];
  const iconPool = ["🎁", "🧧", "🎊"];
  let rewards = shuffleArray(rewardPool);
  let layoutSignature = rewards.join("-");
  let rerollCount = 0;

  while (layoutSignature === state.lastBonusLayoutSignature && rerollCount < 5) {
    rewards = shuffleArray(rewardPool);
    layoutSignature = rewards.join("-");
    rerollCount += 1;
  }

  const boxIcons = shuffleArray(iconPool);

  state.bonusOptions = rewards.map((amount, index) => ({
      id: index,
      amount,
      revealed: false,
      selected: false,
      icon: boxIcons[index],
    }));
  state.lastBonusLayoutSignature = layoutSignature;
  state.selectedBonusIndex = null;
  state.selectedBonusAmount = 0;
  state.bonusRevealLocked = false;
  state.bonusCompleted = false;

  bonusStatus.textContent = "Kamu baru bisa memilih satu box saja.";
  bonusCloseBtn.classList.add("hidden");
  renderBonusBoxes();
}

function getBonusMessage(amount) {
  if (amount === 2000) {
    return "Hoki banget! Kamu dapat bonus spesial Rp2.000 🎉";
  }

  if (amount === 1000) {
    return "Asik, bonus manis Rp1.000 buat kamu ✨";
  }

  return "Belum rezeki bonus kali ini, jangan lupa bersyukur";
}

function renderBonusBoxes() {
  bonusBoxes.innerHTML = state.bonusOptions
    .map((box, index) => {
      const classNames = [
        "bonus-box",
        box.revealed ? "revealed" : "",
        box.selected ? "selected" : "",
        box.revealed && box.amount > 0 ? "lucky" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <button
          type="button"
          class="${classNames}"
          data-box-index="${index}"
          ${state.bonusRevealLocked ? "disabled" : ""}
        >
          <span class="bonus-box__icon">${box.revealed ? "✨" : box.icon}</span>
          <span class="bonus-box__label">${box.revealed ? "Terbuka" : "Mystery Box"}</span>
          <span class="bonus-box__reward">${formatRupiah(box.amount)}</span>
        </button>
      `;
    })
    .join("");
}

function revealRemainingBonusBoxes() {
  const remainingIndexes = state.bonusOptions
    .map((_, index) => index)
    .filter((index) => index !== state.selectedBonusIndex);

  state.bonusOptions.forEach((box, index) => {
    if (index === state.selectedBonusIndex) {
      return;
    }

    window.setTimeout(() => {
      box.revealed = true;
      renderBonusBoxes();
    }, 280 + index * 180);
  });

  const closeDelay = 280 + remainingIndexes.length * 220 + 520;
  window.setTimeout(() => {
    renderResult();
    bonusCloseBtn.classList.remove("hidden");
    bonusStatus.textContent = `${getBonusMessage(state.selectedBonusAmount)} Klik "Makasih Erlang" untuk lanjut.`;
    if (state.selectedBonusAmount > 0) {
      playCelebration();
    }
  }, closeDelay);
}

function handleBonusSelection(index) {
  if (state.bonusRevealLocked || state.selectedBonusIndex !== null) {
    return;
  }

  const selectedBox = state.bonusOptions[index];
  state.selectedBonusIndex = index;
  state.selectedBonusAmount = selectedBox.amount;
  state.bonusRevealLocked = true;
  state.bonusCompleted = true;

  selectedBox.selected = true;
  selectedBox.revealed = true;
  renderBonusBoxes();
  renderResult();

  bonusStatus.textContent = getBonusMessage(selectedBox.amount);

  revealRemainingBonusBoxes();
}

function openBonusModal() {
  bonusModal.classList.remove("hidden");
  bonusModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  bonusCloseBtn.classList.add("hidden");
  renderBonusBoxes();
}

function closeBonusModal() {
  bonusModal.classList.add("hidden");
  bonusModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function resizeCelebrationCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  celebrationCanvas.width = Math.floor(window.innerWidth * ratio);
  celebrationCanvas.height = Math.floor(window.innerHeight * ratio);
  celebrationCanvas.style.width = `${window.innerWidth}px`;
  celebrationCanvas.style.height = `${window.innerHeight}px`;
  celebrationContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function playCelebration() {
  if (!celebrationContext) {
    return;
  }

  if (celebrationFrame) {
    cancelAnimationFrame(celebrationFrame);
  }

  resizeCelebrationCanvas();

  const colors = ["#177245", "#d9b86a", "#20985c", "#ffffff"];
  const particles = Array.from({ length: 68 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.3,
    size: 4 + Math.random() * 6,
    speedY: 2.2 + Math.random() * 3.2,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.14 + Math.random() * 0.28,
    wobble: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.55 ? "rect" : "circle",
    alpha: 0.8 + Math.random() * 0.18,
  }));

  const duration = 1800;
  const start = performance.now();

  function drawParticle(particle) {
    celebrationContext.save();
    celebrationContext.translate(particle.x, particle.y);
    celebrationContext.rotate(particle.rotation);
    celebrationContext.globalAlpha = particle.alpha;
    celebrationContext.fillStyle = particle.color;

    if (particle.shape === "rect") {
      celebrationContext.fillRect(
        -particle.size * 0.45,
        -particle.size * 0.3,
        particle.size,
        particle.size * 0.6
      );
    } else {
      celebrationContext.beginPath();
      celebrationContext.arc(0, 0, particle.size * 0.42, 0, Math.PI * 2);
      celebrationContext.fill();
    }

    celebrationContext.restore();
  }

  function frame(now) {
    const elapsed = now - start;
    celebrationContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.x += particle.speedX + Math.sin(particle.wobble) * 0.7;
      particle.y += particle.speedY;
      particle.rotation += particle.rotationSpeed;
      particle.wobble += 0.08;
      drawParticle(particle);
    });

    if (elapsed < duration) {
      celebrationFrame = requestAnimationFrame(frame);
      return;
    }

    celebrationContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    celebrationFrame = null;
  }

  celebrationFrame = requestAnimationFrame(frame);
}

function updatePaymentFields() {
  const method = paymentMethod.value;
  const selectedBank = bankNameSelect.value;

  conditionalFields.forEach((field) => {
    const controls = field.querySelectorAll("input, select");
    const fieldType = field.dataset.method;
    const isEwalletField = fieldType === "ewallet" && (method === "dana" || method === "gopay");
    const isBankField = fieldType === "bank" && method === "bank";
    const isOtherBankField =
      fieldType === "bank-other" &&
      method === "bank" &&
      selectedBank === "Other / Bank Lainnya";
    const isActive = isEwalletField || isBankField || isOtherBankField;

    field.classList.toggle("active", isActive);

    controls.forEach((control) => {
      control.required = false;

      if (!isActive) {
        control.value = "";
      }
    });
  });

  phoneNumberInput.required = method === "dana" || method === "gopay";
  phoneNumberLabel.textContent =
    method === "gopay" ? "Nomor GoPay" : method === "dana" ? "Nomor DANA" : "Nomor HP";

  bankNameSelect.required = method === "bank";
  bankNumberInput.required = method === "bank";
  accountNameInput.required = method === "bank";
  customBankNameInput.required = method === "bank" && selectedBank === "Other / Bank Lainnya";
}

function resetExperience() {
  state.currentQuestionIndex = 0;
  state.visitorName = "";
  state.answers = new Array(quizQuestions.length).fill(null);
  state.bonusOptions = [];
  state.selectedBonusIndex = null;
  state.selectedBonusAmount = 0;
  state.bonusRevealLocked = false;
  state.bonusCompleted = false;

  if (greetingSequenceTimer) {
    window.clearTimeout(greetingSequenceTimer);
    greetingSequenceTimer = null;
  }

  nameForm.reset();
  claimForm.reset();
  setClaimFormStatus("");
  setClaimSubmissionState(false);
  openingSequence.classList.add("hidden");
  openingSequence.classList.remove("is-active");
  openingSequence.setAttribute("aria-hidden", "true");
  envelopeOpenSound.pause();
  envelopeOpenSound.currentTime = 0;
  stopResultSounds();
  closeBonusModal();
  updatePaymentFields();
  claimSuccess.classList.add("hidden");
  showScreen("welcomeScreen");
}

window.addEventListener("resize", () => {
  if (celebrationFrame) {
    resizeCelebrationCanvas();
  }
});

bonusBoxes.addEventListener("click", (event) => {
  const box = event.target.closest("[data-box-index]");

  if (!box) {
    return;
  }

  handleBonusSelection(Number(box.dataset.boxIndex));
});

resultClaimBtn.addEventListener("click", () => {
  if (!state.bonusCompleted) {
    openBonusModal();
    return;
  }

  showScreen("claimScreen");
});

bonusCloseBtn.addEventListener("click", () => {
  closeBonusModal();
  renderResult();
});

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.next;

    if (target === "welcomeScreen") {
      resetExperience();
      return;
    }

    showScreen(target);
  });
});

openGreetingBtn.addEventListener("click", () => {
  playGreetingOpeningSequence();
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nameValue = document.getElementById("visitorName").value.trim();

  if (!nameValue) {
    alert("Nama panggilan wajib diisi dulu ya.");
    return;
  }

  state.visitorName = nameValue;
  showScreen("quizScreen");
});

prevQuestionBtn.addEventListener("click", () => {
  if (state.currentQuestionIndex > 0) {
    const selectedOption = document.querySelector('input[name="questionOption"]:checked');
    if (selectedOption) {
      state.answers[state.currentQuestionIndex] = Number(selectedOption.value);
    }

    state.currentQuestionIndex -= 1;
    renderQuestion();
  }
});

nextQuestionBtn.addEventListener("click", () => {
  const isValid = saveSelectedAnswer();

  if (!isValid) {
    return;
  }

  if (state.currentQuestionIndex === quizQuestions.length - 1) {
    showScreen("resultScreen");
    return;
  }

  state.currentQuestionIndex += 1;
  renderQuestion();
});

paymentMethod.addEventListener("change", updatePaymentFields);
bankNameSelect.addEventListener("change", updatePaymentFields);

claimForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!claimForm.reportValidity()) {
    return;
  }

  const formData = new FormData(claimForm);
  const paymentChoice = formData.get("paymentMethod");

  if (!paymentChoice) {
    alert("Pilih metode pembayaran dulu ya.");
    return;
  }

  const payload = buildClaimPayload(formData);

  setClaimSubmissionState(true);
  setClaimFormStatus("Sedang mengirim data klaim kamu...", "loading");

  sendClaimToBackend(payload)
    .then(() => {
      saveClaimLocally(payload);
      setClaimFormStatus("");
      claimSuccess.classList.remove("hidden");
      claimForm.reset();
      updatePaymentFields();
      claimSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
    })
    .catch((error) => {
      console.error("Claim submission failed:", error);
      setClaimFormStatus("Gagal mengirim data, coba lagi ya", "error");
    })
    .finally(() => {
      setClaimSubmissionState(false);
    });
});

updatePaymentFields();
showScreen("welcomeScreen");
