import { el, showElement, hideElement, errorMessageDisplay, clearContent, getRunners } from './common.js';

let updateList = [];
let selectedClientId = null;
let editItem = null;

async function getSubmission() {
  try {
    const response = await fetch('get-all-data');

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      console.log(`Could not get the submissions. Error: ${result.error}`);
      errorMessageDisplay('Could not get the data', 'error');
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(`Error getting submission: ${error}`);
    errorMessageDisplay('Could not get the data', 'error');
  }
}

export async function adminBtn() {
  const data = await getSubmission();
  const tableBody = el.race_data_table.querySelector('tbody');

  if (data.length === 0) {
    errorMessageDisplay('No data available to create results', 'error');
    return;
  }

  tableBody.innerHTML = '';

  for (const item of data) {
    const row = document.createElement('tr');

    const format = [item.client_id, item.data_type, item.data_array.length, item.time];

    for (const value of format) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    row.addEventListener('click', () => {
      if (item.data_type === 'times') {
        clearContent();
        showElement(el.time_management_container);

        updateList = [...item.data_array];
        selectedClientId = item.client_id;
        displayTimesList();
      } else {
        clearContent();
        showElement(el.runner_management_container);

        updateList = [...item.data_array];
        selectedClientId = item.client_id;

        displayRunnersList();
      }
    });

    tableBody.appendChild(row);
  }
}
// Modify Times //

export function displayTimesList() {
  el.times_management_list.innerHTML = '';

  updateList.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    el.times_management_list.appendChild(listItem);
  });
}

export function editTimesList() {
  el.times_management_list.innerHTML = '';
  const timesListItem = document.createElement('li');

  if (!updateList || updateList.length === 0) {
    timesListItem.textContent = '';
    return;
  }

  for (let i = 0; i < updateList.length; i++) {
    const time = updateList[i];

    const modifySpecificTime = document.createElement('div');

    const timeShown = document.createElement('span');
    timeShown.textContent = time;

    const editTime = document.createElement('button');
    editTime.textContent = 'Edit';

    editTime.addEventListener('click', () => editSavedTime(time, i));

    const deleteTime = document.createElement('button');
    deleteTime.textContent = 'Delete';

    deleteTime.addEventListener('click', () => deleteSavedTime(i));


    modifySpecificTime.appendChild(timeShown);
    modifySpecificTime.appendChild(editTime);
    modifySpecificTime.appendChild(deleteTime);

    el.times_management_list.appendChild(modifySpecificTime);
  }
}

function editSavedTime(time, index) {
  editItem = index;
  el.time_input.value = time;
  showElement(el.time_popup);
}

function deleteSavedTime(index) {
  updateList.splice(index, 1);
  editTimesList();
}

export function addNewTime() {
  editItem = null;
  el.time_input.value = '';
  showElement(el.time_popup);
}

export function popupTimeDone() {
  const newTime = el.time_input.value.trim();
  if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d):(\d{1,3})$/.test(newTime)) { // Checks if new time input is in the HH:MM:SS:MMM format //
    errorMessageDisplay('Invalid format. Please use hh:mm:ss:ms', 'error');
    return;
  }

  if (editItem !== null) {
    updateList[editItem] = newTime;
    errorMessageDisplay('Time updated successfully', 'success');
    editItem = null;
  } else {
    updateList.push(newTime);
    updateList.sort();
    errorMessageDisplay('Time added successfully', 'success');
  }

  updateList.sort();
  hideElement(el.time_popup);
  editTimesList();
}

export function popupTimeCancel() {
  hideElement(el.time_popup);
  editItem = null;
}

export async function saveNewTimes() {
  try {
    const response = await fetch('/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'times', data: updateList, id: selectedClientId }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.log(`Failed to update times ${result.message}`);
      errorMessageDisplay('Unable to update times', 'error');
      localStorage.setItem('times', JSON.stringify(updateList));
      return;
    }

    console.log('Update to new times!');
    errorMessageDisplay('Times updated successfully', 'success');

    hideElement(el.modify_times_container);
    showElement(el.modify_times);

    displayTimesList();
  } catch (error) {
    console.error('Error updating times:', error);
    errorMessageDisplay('Error updating times.', 'error');
    localStorage.setItem('times', JSON.stringify(updateList));
  }
}

// Runners modify //
export function displayRunnersList() {
  el.runners_management_list.innerHTML = '';

  updateList.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `Position ${item.position}: ${item.name} (ID: ${item.id})`;
    el.runners_management_list.appendChild(listItem);
  });
}

export function editRunnersList() {
  el.runners_management_list.innerHTML = '';
  const runnersListItem = document.createElement('li');

  if (!updateList || updateList.length === 0) {
    runnersListItem.textContent = '';
    return;
  }

  for (let i = 0; i < updateList.length; i++) {
    const runner = updateList[i];

    const modifySpecificRunner = document.createElement('div');

    const runnerShown = document.createElement('span');
    runnerShown.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;

    const editRunner = document.createElement('button');
    editRunner.textContent = 'Edit Position';

    editRunner.addEventListener('click', () => editSavedRunner(runner, i));

    const deleteRunner = document.createElement('button');
    deleteRunner.textContent = 'Remove';

    deleteRunner.addEventListener('click', () => deleteSavedRunner(i));

    modifySpecificRunner.appendChild(runnerShown);
    modifySpecificRunner.appendChild(editRunner);
    modifySpecificRunner.appendChild(deleteRunner);

    el.runners_management_list.appendChild(modifySpecificRunner);
  }
}

async function editSavedRunner(runner, index) {
  editItem = index;

  const runnersData = await getRunners();
  console.log(runnersData);
  const targetedRunner = runnersData.find(r => r[0] === runner.id);

  el.edit_runner_id.value = targetedRunner[0];
  el.edit_runner_position.value = runner.position;
  showElement(el.runner_popup);
}

function deleteSavedRunner(index) {
  updateList.splice(index, 1);
  editRunnersList();
}

export function addNewRunner() {
  el.edit_runner_position.value = '';
  el.edit_runner_id.value = '';
  showElement(el.runner_popup);
}

export async function popupRunnerDone() {
  const newPosition = el.edit_runner_position.value.trim();
  const newID = el.edit_runner_id.value.trim();

  if (!newID || !newPosition) {
    errorMessageDisplay('Please enter both ID and Position', 'error');
    return;
  }
  const runnersData = await getRunners();
  const targetedRunner = runnersData.find(runner => runner[0] === newID);

  if (!targetedRunner) {
    errorMessageDisplay('Runner ID not found', 'error');
    return;
  }


  const runnerName = `${targetedRunner[1]} ${targetedRunner[2]}`;
  const newRunnersInfo = { id: newID, name: runnerName, position: newPosition };

  if (editItem !== null) {
    updateList[editItem] = newRunnersInfo;
    errorMessageDisplay('Runner updated successfully', 'success');
    editItem = null;
  } else {
    updateList.push(newRunnersInfo);
    updateList.sort();
    errorMessageDisplay('Runner added successfully', 'success');
  }

  updateList.sort((a, b) => a.position - b.position);
  hideElement(el.runner_popup);
  editRunnersList();
}

export function popupRunnersCancel() {
  hideElement(el.runner_popup);
  editItem = null;
}

export async function saveNewRunners() {
  try {
    const response = await fetch('/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'runners', data: updateList, id: selectedClientId }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.log(`Failed to update runner ${result.message}`);
      errorMessageDisplay('Unable to update times', 'error');
      localStorage.setItem('runners', JSON.stringify(updateList));
      return;
    }

    console.log('Update to new runners!');
    errorMessageDisplay('Runners updated successfully', 'success');

    hideElement(el.modify_runner_container);
    showElement(el.modify_runners);

    displayRunnersList();
  } catch (error) {
    console.error('Error updating runners:', error);
    errorMessageDisplay('Error updating runners.', 'error');
    localStorage.setItem('runners', JSON.stringify(updateList));
  }
}


export async function createResult() {
  const data = await getSubmission();
  const tableBody = el.race_data_table.querySelector('tbody');

  if (data.length === 0) {
    errorMessageDisplay('No data available to create results', 'error');
    return;
  }

  tableBody.innerHTML = '';

  for (const item of data) {
    const row = document.createElement('tr');

    const format = [item.client_id, item.data_type, item.data_array.length, item.time];

    for (const value of format) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.type = item.data_type;
    checkbox.dataset.data = JSON.stringify(item.data_array);
    checkbox.value = item.client_id;

    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    tableBody.appendChild(row);
  }
}

export async function generateResults() {
  const timesArrays = [];
  const runnersArrays = [];
  const results = [];

  const tableBody = el.race_data_table.querySelector('tbody');
  const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');

  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      const dataType = checkbox.dataset.type;
      const dataArray = JSON.parse(checkbox.dataset.data);


      if (dataType === 'times') {
        timesArrays.push(...dataArray);
      } else if (dataType === 'runners') {
        runnersArrays.push(...dataArray);
      }
    }
  }

  if (timesArrays.length === 0 || runnersArrays.length === 0) {
    errorMessageDisplay('You need both times and runners data to create results', 'error');
    return;
  }


  for (let i = 0; i < timesArrays.length; i++) {
    if (i < runnersArrays.length) {
      results.push({
        position: runnersArrays[i].position,
        name: runnersArrays[i].name,
        time: timesArrays[i],
        id: runnersArrays[i].id,
      });
    }
  }

  try {
    const response = await fetch('/add-race-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });

    const result = await response.json();

    if (response.ok) {
      errorMessageDisplay('Results created successfully!', 'success');
      el.runners_results.click();
    } else {
      errorMessageDisplay(result.message, 'error');
    }
  } catch (error) {
    console.error('Error creating results:', error);
    errorMessageDisplay('Error creating results', 'error');
  }
}
