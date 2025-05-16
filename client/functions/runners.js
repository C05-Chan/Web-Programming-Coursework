import { el, errorMessageDisplay, getClientID, getRunners, hideElement, removeClientID, showElement, errorMessageReset } from './common.js';

// Global Variable//
let recordedRunners = []; // array to hold runners recorded in this session //

export async function addRunner() {
  // add runners to the list //
  el.error_message.textContent = ''; // clear any existing error message //
  let targetedRunner = null;
  const idNumber = el.runner_ID.value; // get runner ID from input //
  const position = el.runner_position.value; // get runner position from input //

  if (!position || !idNumber) {
    errorMessageDisplay('Please enter both position and ID number', 'error');
    return;
  }

  if (position <= 0 || idNumber <= 0) {
    errorMessageDisplay('Position and ID Number must be a positive number', 'error');
    return;
  }

  const runnersData = await getRunners(); // fetch all runners data //

  for (let i = 0; i < runnersData.length; i++) {
    // look for the runner with the matching ID
    if (runnersData[i][0] === idNumber && targetedRunner === null) {
      targetedRunner = runnersData[i];
    }
  }

  if (!targetedRunner) {
    // if no runner found, show error and exit
    errorMessageDisplay('Runner ID not found', 'error');
    return;
  }


  const runnerName = `${targetedRunner[1]} ${targetedRunner[2]}`; // build runner name //
  const runnersInfo = { id: idNumber, name: runnerName, position }; // add its to the runner info object //

  recordedRunners.push(runnersInfo); // add runner info to local array
  localStorage.setItem('runners', JSON.stringify(recordedRunners)); // save updated list to local storage //

  const list = JSON.parse(localStorage.getItem('runners')); // get updated list from local storage //
  displayRecordedRunners(list); // update the displayed list //
}

export function displayRecordedRunners(list) {
  // updates the list of recorded runners
  el.runners_list.innerHTML = ''; // clear current list //

  // add each runner as a new list item at the top //
  for (const runner of list) {
    const listItem = document.createElement('li');
    listItem.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;
    el.runners_list.prepend(listItem);
  }
}

export async function submitRunnersRecords() {
  // submits recorded runners to the server //
  errorMessageReset(); // clear any previous error messages //


  if (recordedRunners.length === 0) {
    errorMessageDisplay('No runners recorded to submit', 'error');
    return;
  }

  const clientId = getClientID(); // get client ID for submission //

  try {
    // send data to server//
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
  // mark runners as submitted in localStorage //
  localStorage.setItem('submitted-runners', 'true');
}

export function clearRunners() {
  // clears recorded runners and resets UI/input fields //
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
  // checks if runners have been submitted previously //
  const isRunnersSubmitted = localStorage.getItem('submitted-runners');

  if (isRunnersSubmitted) {
    // if submitted, hide inputs and show clear button
    hideElement(document.querySelector('.runners-input-container'));
    showElement(el.clear_runners);
    // display the previously recorded runners
    displayRecordedRunners(JSON.parse(localStorage.getItem('runners')));
  }
}
