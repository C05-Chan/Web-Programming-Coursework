import { el, errorMessageDisplay, getClientID, getRunners, hideElement, removeClientID, showElement, errorMessageReset } from './common.js';

let recordedRunners = [];

export async function addRunner() {
  el.error_message.textContent = '';
  let targetedRunner = null;
  const idNumber = el.runner_ID.value;
  const position = el.runner_position.value;

  if (!position || !idNumber) {
    errorMessageDisplay('Please enter both position and ID number', 'error');
    return;
  }

  if (position <= 0 || idNumber <= 0) {
    errorMessageDisplay('Position and ID Number must be a positive number', 'error');
    return;
  }

  const runnersData = await getRunners();

  for (let i = 0; i < runnersData.length; i++) {
    if (runnersData[i][0] === idNumber && targetedRunner === null) {
      targetedRunner = runnersData[i];
    }
  }


  if (!targetedRunner) {
    errorMessageDisplay('Runner ID not found', 'error');
    return;
  }

  const runnerName = `${targetedRunner[1]} ${targetedRunner[2]}`;
  const runnersInfo = { id: idNumber, name: runnerName, position };

  recordedRunners.push(runnersInfo);
  localStorage.setItem('runners', JSON.stringify(recordedRunners));

  const list = JSON.parse(localStorage.getItem('runners'));
  displayRecordedRunners(list);
}

export function displayRecordedRunners(list) {
  el.runners_list.innerHTML = '';

  for (const runner of list) {
    const listItem = document.createElement('li');
    listItem.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;
    el.runners_list.prepend(listItem);
  }
}

export async function submitRunnersRecords() {
  errorMessageReset();


  if (recordedRunners.length === 0) {
    errorMessageDisplay('No runners recorded to submit', 'error');
    return;
  }

  const clientId = getClientID();

  try {
    const response = await fetch('/submit-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'runners', data: recordedRunners, id: clientId }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessageDisplay(`Unable to submit time data. Error: ${result.error}`);
      localStorage.setItem('server-runners', JSON.stringify(recordedRunners));
      localStorage.setItem('server-runners-client', clientId);
      return;
    }

    console.log(`Runners submitted successfully: ${result}`);
    errorMessageDisplay('Runners submitted successfully:', 'success');
    localStorage.setItem('runners', JSON.stringify(recordedRunners));

    hideElement(document.querySelector('.runners-input-container'));
    showElement(el.clear_runners);
  } catch (error) {
    console.error(`Error: ${error}`);
    errorMessageDisplay('Error submitting runner, it is currently stored locally, please try again out of offline mode', 'error');
    localStorage.setItem('server-runners', JSON.stringify(recordedRunners));
    localStorage.setItem('server-runners-client', clientId);
  }
  localStorage.setItem('submitted-runners', 'true');
}

export function clearRunners() {
  recordedRunners = [];
  el.runners_list.innerHTML = '';
  localStorage.removeItem('runners');
  localStorage.removeItem('submitted-runners');
  errorMessageReset();
  removeClientID();
  el.runner_ID.value = '';
  el.runner_position.value = '';

  document.querySelector('.runners-input-container').style.display = 'grid';
  hideElement(el.clear_runners);
}

export function checkRunnersSubmission() {
  const isRunnersSubmitted = localStorage.getItem('submitted-runners');

  if (isRunnersSubmitted) {
    hideElement(document.querySelector('.runners-input-container'));
    showElement(el.clear_runners);
    displayRecordedRunners(JSON.parse(localStorage.getItem('runners')));
  }
}
