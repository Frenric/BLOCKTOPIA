const choiceButtons = document.querySelectorAll('.choice-button');
const explainPanel = document.getElementById('explainPanel');
const nameInput = document.getElementById('nameInput');
const reasonInput = document.getElementById('reasonInput');
const submitReason = document.getElementById('submitReason');
const responseCard = document.getElementById('responseCard');
const responsesList = document.getElementById('responsesList');

let selectedAnswer = '';

function chooseAnswer(event) {
  const clickedButton = event.target;
  selectedAnswer = clickedButton.textContent;

  for (let i = 0; i < choiceButtons.length; i++) {
    choiceButtons[i].classList.remove('selected');
  }

  clickedButton.classList.add('selected');
  explainPanel.classList.remove('hidden');
  nameInput.value = '';
  reasonInput.value = '';
  reasonInput.focus();
}

function submitAnswer() {
  const name = nameInput.value.trim() || 'Anonymous';
  const reason = reasonInput.value.trim();

  if (reason === '') {
    reasonInput.focus();
    return;
  }

  const response = document.createElement('article');
  response.classList.add('response-entry');

  const respondent = document.createElement('p');
  respondent.classList.add('respondent-name');
  respondent.textContent = name;

  const answer = document.createElement('h3');
  answer.textContent = selectedAnswer;

  const reasonLabel = document.createElement('p');
  reasonLabel.classList.add('reason-label');
  reasonLabel.textContent = 'Why I chose it';

  const responseReason = document.createElement('p');
  responseReason.classList.add('response-reason');
  responseReason.textContent = reason;

  response.append(respondent, answer, reasonLabel, responseReason);
  responsesList.append(response);
  responseCard.classList.remove('hidden');
  explainPanel.classList.add('hidden');
}

for (let i = 0; i < choiceButtons.length; i++) {
  choiceButtons[i].addEventListener('click', chooseAnswer);
}

submitReason.addEventListener('click', submitAnswer);

