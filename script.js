const choiceButtons = document.querySelectorAll('.choice-button');
const explainPanel = document.getElementById('explainPanel');
const reasonInput = document.getElementById('reasonInput');
const submitReason = document.getElementById('submitReason');
const responseCard = document.getElementById('responseCard');
const selectedAnswerText = document.getElementById('selectedAnswerText');
const reasonText = document.getElementById('reasonText');

let selectedAnswer = '';

function chooseAnswer(event) {
  const clickedButton = event.target;
  selectedAnswer = clickedButton.textContent;

  for (let i = 0; i < choiceButtons.length; i++) {
    choiceButtons[i].classList.remove('selected');
  }

  clickedButton.classList.add('selected');
  explainPanel.classList.remove('hidden');
  responseCard.classList.add('hidden');
  reasonInput.value = '';
  reasonInput.focus();
}

function submitAnswer() {
  const reason = reasonInput.value.trim();

  if (reason === '') {
    reasonInput.focus();
    return;
  }

  selectedAnswerText.textContent = selectedAnswer;
  reasonText.textContent = reason;
  responseCard.classList.remove('hidden');
  explainPanel.classList.add('hidden');
}

for (let i = 0; i < choiceButtons.length; i++) {
  choiceButtons[i].addEventListener('click', chooseAnswer);
}

submitReason.addEventListener('click', submitAnswer);

