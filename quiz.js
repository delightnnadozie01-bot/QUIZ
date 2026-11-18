const quizStorageKey = "quickWebDevQuizState";
const correctAnswers = { q1: 1, q2: 0, q3: 0 };
const questionId = document.body.dataset.questionId;
const correctAnswer = correctAnswers[questionId];
const answerButtons = Array.from(document.querySelectorAll("[data-answer]"));
const scoreDisplay = document.getElementById("score-display");
const quizBox = document.getElementById("quiz-box");
const nextButton = document.getElementById("next-btn");
const finishButton = document.getElementById("finish-btn");
const resultBox = document.getElementById("result-box");

let quizState;

const queryParams = new URLSearchParams(window.location.search);
if (queryParams.has("new")) {
    quizState = { answers: {}, completed: false };
    queryParams.delete("new");
    const updatedSearch = queryParams.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${updatedSearch ? `?${updatedSearch}` : ""}`);
} else {
    const savedState = sessionStorage.getItem(quizStorageKey);
    quizState = savedState ? JSON.parse(savedState) : { answers: {}, completed: false };
}

function saveQuizState() {
    sessionStorage.setItem(quizStorageKey, JSON.stringify(quizState));
}

function getScore() {
    return Object.entries(quizState.answers).filter(([id, answer]) => {
        return answer === correctAnswers[id];
    }).length;
}

function showResult() {
    quizState.completed = true;
    saveQuizState();
    quizBox.hidden = true;
    if (nextButton) {
        nextButton.hidden = true;
    }
    if (finishButton) {
        finishButton.hidden = true;
    }
    resultBox.hidden = false;
    resultBox.querySelector("#final-score").textContent = `${getScore()} / 3`;
}

function showAnswer(selectedAnswer) {
    answerButtons.forEach((button) => {
        const answer = Number(button.dataset.answer);
        const isSelected = answer === selectedAnswer;
        const isCorrect = answer === correctAnswer;

        button.classList.toggle("answer-correct", isCorrect);
        button.classList.toggle("answer-incorrect", isSelected && !isCorrect);
        button.setAttribute("aria-pressed", String(isSelected));
    });

    if (nextButton) {
        nextButton.classList.remove("disabled");
        nextButton.setAttribute("aria-disabled", "false");
        nextButton.removeAttribute("tabindex");
    }

    if (finishButton) {
        finishButton.disabled = false;
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${getScore()} / 3`;
}

answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
        quizState.answers[questionId] = Number(button.dataset.answer);
        quizState.completed = false;
        saveQuizState();
        showAnswer(quizState.answers[questionId]);
        updateScore();
    });
});

if (quizState.answers[questionId] !== undefined) {
    showAnswer(quizState.answers[questionId]);
}
updateScore();

if (nextButton) {
    nextButton.addEventListener("click", (event) => {
        if (quizState.answers[questionId] === undefined) {
            event.preventDefault();
        }
    });
}

if (finishButton) {
    finishButton.addEventListener("click", showResult);
}

if (quizState.completed) {
    showResult();
}
