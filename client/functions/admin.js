import { el, showElement, hideElement, errorMessageDisplay, clearContent, getRunners } from './common.js';
import { runnerResultView } from './results.js';

// Global Variable //
let updateList = []; // The list that is going to be changed//
let selectedClientId = null; // The client id the data was sent from //
let editItem = null; // The index of the item, used for checking if its adding or editing later //

async function getSubmission() {
  // get the submitted data from volunteers and display them //
  try {
    const response = await fetch('/get-all-data'); // gets the data from server //
    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      console.log(`Could not get the submissions. Error: ${result.error}`);
      errorMessageDisplay('Could not get the submissions', 'error');
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(`Error getting submission: ${error}`);
    errorMessageDisplay('Could not get the data', 'error');
  }
}

export async function admin() {
  // This is the admin view //

  const data = await getSubmission(); // get the data from the function //
  const tableBody = el.race_data_table.querySelector('tbody'); // gets the table body //
  tableBody.innerHTML = '';

  if (data.length === 0) {
    const row = document.createElement('tr'); // create table row //
    const cell = document.createElement('td'); // create table row //
    cell.textContent = 'No results found!';
    cell.colSpan = 4; // create table row //
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  showElement(el.create_results); // once there is data, the create button shows up //
  showElement(el.initial_message); // once there is data, the initial message shows up

  tableBody.innerHTML = ''; // clears the table //
  const headerRow = el.race_data_table.querySelector('thead tr'); // gets the table head's row //
  if (headerRow.lastChild.textContent === 'Select') { // check if the last table head column is called 'Select //
    headerRow.removeChild(headerRow.lastChild);
  }

  for (const item of data) {
    const row = document.createElement('tr'); // create a table row //

    const format = [item.client_id, item.data_type, item.data_array.length, item.time];
    // this will format the table so the the table will show in that order and those items //

    for (const value of format) { // creates and add the cell of value into the row for each item //
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    row.addEventListener('click', () => { // this makes every row clickable //
      hideElement(el.create_results); // once clicked, it hides the create result button //
      showElement(el.manage_back); // shows the back button //

      if (item.data_type === 'times') { // checks data type //
        clearContent();
        showElement(el.time_management_container);

        updateList = item.data_array.slice(); // it returns a new array that is a copy of the original array //
        selectedClientId = item.client_id;
        displayTimesList();
      } else {
        clearContent();
        showElement(el.runner_management_container);

        updateList = item.data_array.slice();
        selectedClientId = item.client_id;

        displayRunnersList();
      }
    });

    tableBody.appendChild(row);
  }
}


// ----------- Times Management ----------- //
export function displayTimesList() {
  // this displays the times list //

  el.times_management_list.innerHTML = '';

  for (const time of updateList) {
    const listItem = document.createElement('li');
    listItem.textContent = time;
    el.times_management_list.appendChild(listItem);
  }
}

export function editTimesList() {
  // this creates the list for the modify times section //
  el.times_management_list.innerHTML = '';
  const timesListItem = document.createElement('li');

  if (!updateList || updateList.length === 0) {
    timesListItem.textContent = '';
    return;
  }

  for (let i = 0; i < updateList.length; i++) { // it loops through the copy of the edit list //
    const time = updateList[i];

    const modifySpecificTime = document.createElement('div'); // Every item in the list get a div created //

    const timeShown = document.createElement('span'); // Every item in the list get a span created //
    timeShown.textContent = time;

    const editTime = document.createElement('button'); // Every item in the list get a edit button created //
    editTime.textContent = 'Edit';
    editTime.classList.add('edit-button'); // this is added for css styling //

    editTime.addEventListener('click', () => editSavedTime(time, i));

    const deleteTime = document.createElement('button'); // Every item in the list get a delete button created //
    deleteTime.textContent = 'Delete';
    deleteTime.classList.add('delete-button'); // this is added for css styling //

    deleteTime.addEventListener('click', () => deleteSavedTime(i));


    modifySpecificTime.appendChild(timeShown); // the span get added to the div //
    modifySpecificTime.appendChild(editTime); // the edit button get added to the div //
    modifySpecificTime.appendChild(deleteTime); // the delete button get added to the div //
    el.times_management_list.appendChild(modifySpecificTime); // the whole dive get added to the list //
  }
}

function editSavedTime(time, index) {
  // edit time function //
  editItem = index;
  el.time_input.value = time;
  showElement(el.time_popup);
}

function deleteSavedTime(index) {
  // delete time function //
  updateList.splice(index, 1);
  editTimesList();
}

export function addNewTime() {
  // add new time function //
  editItem = null;
  el.time_input.value = '';
  showElement(el.time_popup);
}

export function popupTimeDone() {
  // checks time format and add/update time to the array //
  const newTime = el.time_input.value.trim();
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:\d{3}$/.test(newTime)) { // Checks if new time input is in the HH:MM:SS:MMM format //
    errorMessageDisplay('Invalid format. Please use hh:mm:ss:ms', 'error');
    return;
  }


  if (editItem !== null) { // checks if the times are edited or added //
    updateList[editItem] = newTime; // edits the selected time //
    errorMessageDisplay('Time updated successfully', 'success');
    editItem = null;
  } else {
    updateList.push(newTime); // add the new time onto the array //
    errorMessageDisplay('Time added successfully', 'success');
  }

  updateList.sort(); // sorts the array based on the time //
  hideElement(el.time_popup);
  editTimesList();
}

export function popupTimeCancel() {
  // hides the popup //
  hideElement(el.time_popup);
  editItem = null;
}

export async function saveNewTimes() {
  // this updates the new time data to the server //
  try {
    const response = await fetch('/update-data', { // send the new times data to server //
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'times', data: updateList, id: selectedClientId }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to update times ${result.message}`);
      errorMessageDisplay('Unable to update times', 'error');
      localStorage.setItem('times', JSON.stringify(updateList));
      return;
    }

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

// ----------- Runners Management ----------- //
export function displayRunnersList() {
  // this displays the runners list //
  el.runners_management_list.innerHTML = '';

  for (const runner of updateList) {
    const listItem = document.createElement('li');
    listItem.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;
    el.runners_management_list.appendChild(listItem);
  }
}

export function editRunnersList() {
  // this creates the list for the modify runners section //

  el.runners_management_list.innerHTML = ''; // clears the list //
  const runnersListItem = document.createElement('li'); // creates a placeholder list item //

  if (!updateList || updateList.length === 0) {
    runnersListItem.textContent = ''; // sets empty content if list is empty //
    return;
  }

  for (let i = 0; i < updateList.length; i++) { // it loops through the copy of the edit list //
    const runner = updateList[i];

    const modifySpecificRunner = document.createElement('div'); // Every item in the list gets a div created //

    const runnerShown = document.createElement('span'); // Every item in the list gets a span created //
    runnerShown.textContent = `Position ${runner.position}: ${runner.name} (ID: ${runner.id})`;

    const editRunner = document.createElement('button'); // Every item in the list gets an edit button created //
    editRunner.textContent = 'Edit';
    editRunner.classList.add('edit-button'); // this is added for css styling //

    editRunner.addEventListener('click', () => editSavedRunner(runner, i));

    const deleteRunner = document.createElement('button'); // Every item in the list gets a delete button created //
    deleteRunner.textContent = 'Remove';
    deleteRunner.classList.add('delete-button'); // this is added for css styling //

    deleteRunner.addEventListener('click', () => deleteSavedRunner(i));

    modifySpecificRunner.appendChild(runnerShown); // the span gets added to the div //
    modifySpecificRunner.appendChild(editRunner); // the edit button gets added to the div //
    modifySpecificRunner.appendChild(deleteRunner); // the delete button gets added to the div //
    el.runners_management_list.appendChild(modifySpecificRunner); // the whole div gets added to the list //
  }
}


async function editSavedRunner(runner, index) {
  // edit runner function //
  editItem = index;
  let targetedRunner = null;

  const runnersData = await getRunners(); // gets runners data //
  for (let i = 0; i < runnersData.length; i++) { // loops through the runners data and tries to find a match on the runner id //
    if (runnersData[i][0] === runner.id && targetedRunner === null) {
      targetedRunner = runnersData[i];
    }
  }

  // this puts the selected edit time values in the input boxes //
  el.edit_runner_id.value = targetedRunner[0];
  el.edit_runner_position.value = runner.position;
  showElement(el.runner_popup);
}

function deleteSavedRunner(index) {
  // delete runner function //
  updateList.splice(index, 1);
  editRunnersList();
}

export function addNewRunner() {
  // add new runner function //
  el.edit_runner_position.value = '';
  el.edit_runner_id.value = '';
  showElement(el.runner_popup);
}

export async function popupRunnerDone() {
  // confirms the data is correct the changes the list //
  let targetedRunner = null;
  const newPosition = el.edit_runner_position.value.trim();
  const newID = el.edit_runner_id.value.trim();

  if (!newID || !newPosition) {
    errorMessageDisplay('Please enter both ID and Position', 'error');
    return;
  }
  const runnersData = await getRunners();
  for (let i = 0; i < runnersData.length; i++) { // checks if the runner id is in the csv file //
    if (runnersData[i][0] === newID && targetedRunner === null) {
      targetedRunner = runnersData[i];
    }
  }

  if (!targetedRunner) {
    errorMessageDisplay('Runner ID not found', 'error');
    return;
  }

  const runnerName = `${targetedRunner[1]} ${targetedRunner[2]}`;
  const newRunnersInfo = { id: newID, name: runnerName, position: newPosition };

  if (editItem !== null) { // checks if the runners are edited or added //
    updateList[editItem] = newRunnersInfo; // edits the selected runner
    errorMessageDisplay('Runner updated successfully', 'success');
    editItem = null;
  } else {
    updateList.push(newRunnersInfo); // add the new runner to the array //
    errorMessageDisplay('Runner added successfully', 'success');
  }

  updateList.sort((a, b) => a.position - b.position); // sorts the array based on the positions //
  hideElement(el.runner_popup);
  editRunnersList();
}

export function popupRunnersCancel() {
  // hides the popup
  hideElement(el.runner_popup);
  editItem = null;
}

export async function saveNewRunners() {
  // this updates the new runner data to the server //
  try {
    const response = await fetch('/update-data', { // send the new runner data to server //
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'runners', data: updateList, id: selectedClientId }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to update runner ${result.message}`);
      errorMessageDisplay('Unable to update times', 'error');
      localStorage.setItem('runners', JSON.stringify(updateList));
      return;
    }

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

// ----------- Result Creation ----------- //
export async function createResult() {
  // shows the creates results list and check boxes //
  const data = await getSubmission();// get the data from the function //
  const tableBody = el.race_data_table.querySelector('tbody'); // gets the table body //
  const headerRow = el.race_data_table.querySelector('thead tr'); // gets the table header row //

  if (data.length === 0) {
    const row = document.createElement('tr'); // create table row //
    const cell = document.createElement('td'); // create table row //
    cell.textContent = 'No results found!';
    cell.colSpan = 4; // create table row //
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  tableBody.innerHTML = '';

  const selectHeader = document.createElement('th'); // creates table head cell //
  selectHeader.textContent = 'Select';
  headerRow.appendChild(selectHeader); // adds the cell to the table header row //

  for (const item of data) {
    const row = document.createElement('tr');

    const format = [item.client_id, item.data_type, item.data_array.length, item.time];
    // this will format the table so the the table will show in that order and those items //

    for (const value of format) { // creates and add the cell of value into the row for each item //
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input'); // creates and input element //
    checkbox.type = 'checkbox'; // the input type is checkbox //
    checkbox.dataset.type = item.data_type; // this makes custom data attribute and assign data type//
    checkbox.dataset.data = JSON.stringify(item.data_array); // this makes custom data attribute and assign data array//
    checkbox.value = item.client_id; // this makes custom data attribute and assign client id//

    checkboxCell.appendChild(checkbox); // add the checkbox into the table data //
    row.appendChild(checkboxCell); // add the table data into the row //
    tableBody.appendChild(row); // add the row into table body //
  }
}

export async function generateResults() {
  // this sends the results to the server //
  const timesArrays = [];
  const runnersArrays = [];
  const results = [];

  const tableBody = el.race_data_table.querySelector('tbody');
  const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]'); // gets all the checkboxes //

  for (const checkbox of checkboxes) { // loops through all the checkbox //
    if (checkbox.checked) { // see if the check box is checked //
      const dataType = checkbox.dataset.type;
      const dataArray = JSON.parse(checkbox.dataset.data); // this turns the data_array into a json object //


      if (dataType === 'times') { // pushes the array into their list based on the type //
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

  timesArrays.sort();
  runnersArrays.sort((a, b) => a.position - b.position); // This sorts the runner array based on the inputted position by comparing //

  const minLength = Math.min(timesArrays.length, runnersArrays.length); // this gets the length of the shorted array //

  for (let i = 0; i < minLength; i++) { // this assign the time to the runner after their data has been sorted //
    results.push({
      position: runnersArrays[i].position,
      name: runnersArrays[i].name,
      time: timesArrays[i],
      id: runnersArrays[i].id,
    });
  }

  try {
    const response = await fetch('/add-race-result', { // sends the data to the server and database //
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      errorMessageDisplay(result.message, 'error');
      localStorage.setItem('results', JSON.stringify(results));
      return;
    }
    errorMessageDisplay('Results created successfully!', 'success');
    runnerResultView();
    showElement(el.manage_back);
    hideElement(el.create_results_buttons);
  } catch (error) {
    console.error('Error creating results:', error);
    errorMessageDisplay('Error submitting times, it is currently stored locally, please try again out of offline mode', 'error');
    localStorage.setItem('results', JSON.stringify(results));
  }
}
