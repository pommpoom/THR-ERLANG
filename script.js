// Quiz data is kept in one place so the owner can replace the placeholder
// content easily without touching the rest of the application logic.
const quizQuestions = [
  {
    question: "Apa makanan favoritku saat momen Lebaran?",
    options: ["Rendang", "Ketupat sayur", "Sate ayam", "Bakso"],
    answer: 0,
  },
  {
    question: "Kalau aku sedang santai, biasanya aku paling suka...",
    options: ["Pergi ke mall", "Nonton film", "Tidur siang", "Olahraga pagi"],
    answer: 1,
  },
  {
    question: "Warna yang paling menggambarkan kepribadianku adalah...",
    options: ["Hijau", "Merah", "Hitam", "Biru"],
    answer: 0,
  },
  {
    question: "Kalau diajak liburan, aku lebih pilih...",
    options: ["Gunung", "Pantai", "Kota besar", "Staycation di rumah"],
    answer: 1,
  },
  {
    question: "Minuman yang paling sering aku pilih adalah...",
    options: ["Kopi", "Teh manis", "Matcha", "Air mineral"],
    answer: 2,
  },
  {
    question: "Kalau mendengar lagu, genre yang paling aku suka biasanya...",
    options: ["Pop", "Jazz", "Rock", "Dangdut"],
    answer: 0,
  },
  {
    question: "Sifat yang paling sering orang lihat dariku adalah...",
    options: ["Kalem", "Kocak", "Serius", "Impulsif"],
    answer: 0,
  },
  {
    question: "Aku paling suka waktu Lebaran karena...",
    options: [
      "Bisa makan enak",
      "Bisa kumpul keluarga",
      "Bisa dapat THR",
      "Bisa libur panjang",
    ],
    answer: 1,
  },
  {
    question: "Kalau aku punya waktu kosong, aku biasanya akan...",
    options: ["Scroll media sosial", "Merapikan sesuatu", "Main game", "Menulis ide"],
    answer: 3,
  },
  {
    question: "Kalimat yang paling cocok buat menggambarkan gaya hidupku adalah...",
    options: [
      "Simple tapi hangat",
      "Sibuk dan spontan",
      "Sangat terjadwal",
      "Selalu di luar rumah",
    ],
    answer: 0,
  },
];

const state = {
  currentScreen: "welcomeScreen",
  currentQuestionIndex: 0,
  visitorName: "",
  answers: new Array(quizQuestions.length).fill(null),
};

const screens = document.querySelectorAll(".screen");
const topProgress = document.getElementById("topProgress");
const nameForm = document.getElementById("nameForm");
const claimForm = document.getElementById("claimForm");
const paymentMethod = document.getElementById("paymentMethod");
const conditionalFields = document.querySelectorAll(".conditional-field");
const quizContent = document.getElementById("quizContent");
const questionProgress = document.getElementById("questionProgress");
const quizProgressBar = document.getElementById("quizProgressBar");
const prevQuestionBtn = document.getElementById("prevQuestionBtn");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const claimSuccess = document.getElementById("claimSuccess");
const claimNameInput = document.getElementById("claimName");
const resultName = document.getElementById("resultName");
const resultScore = document.getElementById("resultScore");
const resultReward = document.getElementById("resultReward");
const resultGreeting = document.getElementById("resultGreeting");
const resultDetail = document.getElementById("resultDetail");

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
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
    renderResult();
  }

  if (screenId === "claimScreen") {
    claimNameInput.value = state.visitorName;
  }
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
    <h2 class="question-title">${currentQuestion.question}</h2>
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
                <span class="option-text">${option}</span>
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

function renderResult() {
  const score = calculateScore();
  const reward = score * 1000;

  resultName.textContent = state.visitorName;
  resultScore.textContent = `${score} jawaban benar dari ${quizQuestions.length}`;
  resultReward.textContent = formatRupiah(reward);
  resultDetail.textContent = `${score} x Rp1.000 = ${formatRupiah(reward)}`;

  if (score === quizQuestions.length) {
    resultGreeting.textContent = "MasyaAllah, sempurna sekali!";
  } else if (score >= 7) {
    resultGreeting.textContent = "Selamat, kamu mengenalku dengan baik!";
  } else if (score >= 4) {
    resultGreeting.textContent = "Lumayan dekat, THR tetap jalan!";
  } else {
    resultGreeting.textContent = "Tetap manis, tetap dapat THR!";
  }
}

function updatePaymentFields() {
  const method = paymentMethod.value;

  conditionalFields.forEach((field) => {
    const input = field.querySelector("input");
    const isActive = field.dataset.method === method;

    field.classList.toggle("active", isActive);
    input.required = isActive;

    if (!isActive) {
      input.value = "";
    }
  });
}

function resetExperience() {
  state.currentQuestionIndex = 0;
  state.visitorName = "";
  state.answers = new Array(quizQuestions.length).fill(null);

  nameForm.reset();
  claimForm.reset();
  updatePaymentFields();
  claimSuccess.classList.add("hidden");
  showScreen("welcomeScreen");
}

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

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nameValue = document.getElementById("visitorName").value.trim();

  if (!nameValue) {
    alert("Nama lengkap wajib diisi dulu ya.");
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

claimForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(claimForm);
  const paymentChoice = formData.get("paymentMethod");

  if (!paymentChoice) {
    alert("Pilih metode pembayaran dulu ya.");
    return;
  }

  const claimData = {
    submittedAt: new Date().toISOString(),
    visitorName: state.visitorName,
    score: calculateScore(),
    reward: calculateScore() * 1000,
    paymentMethod: paymentChoice,
    claimName: formData.get("claimName"),
    danaNumber: formData.get("danaNumber"),
    gopayNumber: formData.get("gopayNumber"),
    bankNumber: formData.get("bankNumber"),
    accountName: formData.get("accountName"),
    notes: formData.get("notes"),
  };

  const existingClaims = JSON.parse(localStorage.getItem("eid-thr-claims") || "[]");
  existingClaims.push(claimData);
  localStorage.setItem("eid-thr-claims", JSON.stringify(existingClaims));

  claimSuccess.classList.remove("hidden");
  claimForm.reset();
  updatePaymentFields();
  claimNameInput.value = state.visitorName;
  claimSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

updatePaymentFields();
showScreen("welcomeScreen");
