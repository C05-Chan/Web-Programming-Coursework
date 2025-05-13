import { el, errorMessageDisplay, getClientID, getRunners } from './common.js';

const recordedRunners = [];

export async function addRunner() { // CHANGE FOR..OF LOOP AND CHANGE THE WAY IT DISPLATS THE LIST //
  el.error_message.textContent = '';
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
  const targetedRunner = runnersData.find(runner => runner[0] === idNumber);

  if (!targetedRunner) {
    errorMessageDisplay('Runner ID not found', 'error');
    return;
  }

  const runnerName = `${targetedRunner[1]} ${targetedRunner[2]}`;
  const runnersInfo = { id: idNumber, name: runnerName, position };

  recordedRunners.push(runnersInfo);

  updateRunnersList(recordedRunners);
}

function updateRunnersList(runners) {
  el.runners_list.innerHTML = '';

  for (const runner of runners) {
    const listItem = document.createElement('li');
    listItem.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;
    el.runners_list.prepend(listItem);
  }
}

export async function submitRunnersRecords() {
  errorMessageDisplay('', null);

  if (recordedRunners.length === 0) {
    errorMessageDisplay('No runners recorded to submit', 'error');
    return;
  }

  try {
    const response = await fetch('/submit-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'runners', data: recordedRunners, id: getClientID() }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessageDisplay(`Unable to submit time data. Error: ${result.error}`);
      localStorage.setItem('runners', JSON.stringify(recordedRunners));
      return;
    }

    console.log(`Runners submitted successfully: ${result}`);
    errorMessageDisplay('Runners submitted successfully:', 'success');

    // if (localStorage.getItem('runners')) {
    //   localStorage.removeItem('runners');
    // }
  } catch (error) {
    console.error(`Error: ${error}`);
    errorMessageDisplay('Error submitting runner, it is currently stored locally, please try again out of offline mode', 'error');
    localStorage.setItem('runners', JSON.stringify(recordedRunners));
  }
}
