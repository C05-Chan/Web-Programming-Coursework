import { el, showElement, hideElement, errorMessageDisplay, clearContent } from './common-functions';

let updateList = [];
let selectedClientId = null;

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
  clearContent();

  showElement(el.admin_view);
  showElement(document.querySelector('.admin-nav'));
  hideElement(document.querySelector('.volunteer-nav'));

  const data = await getSubmission();
  const tableBody = el.race_data_table('tbody');

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
      <td colspan="4">No results available</td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = '';

  for (const item of data) {
    const row = document.createElement('tr');

    for (const value of Object.values(item)) {
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

        showElement(el.modify_times);
        editTimesList();
      } else {
        clearContent();
        showElement(el.runner_management);

        updateList = [...item.data_array];
        selectedClientId = item.client_id;

        showElement(el.modify_runners);
        editRunnersList();
      }
    });

    tableBody.appendChild(row);
  }
}

// Modify Times //

export async function displayTimesList() {
  try {
    const listItem = document.createElement('li');
    const response = await fetch('/get-times');

    if (!response.ok) {
      listItem.textContent = 'No times available!';
      el.times.management.list.appendChild(listItem);
      return;
    }

    const times = await response.json();

    listItem.textContent('');
    el.time_management_container.appendChild(listItem);

    for (const time of times) {
      listItem.textContent = time;
      el.times.management.list.appendChild(listItem);
    }

    errorMessageDisplay('Times loaded successfully', 'success');
  } catch (error) {
    errorMessageDisplay('Failed to load times', 'error');
    console.error('Error fetching times:', error);
  }
}

export async function editTimesList() {
  const timesListItem = document.createElement('li');

  showElement(el.save_times);
  showElement(el.add_time);

  if (!updateList || updateList.length === 0) {
    timesListItem.textContent('');
    return;
  }

  updateList.forEach((time, index) => {
    const wrapper = document.createElement('section');
    wrapper.className = 'time-entry';

    const span = document.createElement('span');
    span.textContent = time;

    const editTime = document.createElement('button');
    editTime.textContent = 'Edit';
    editTime.addEventListener('click', () => {
      editItem = index;
      el.time_input.value = time;
      showElement(document.querySelector('.popup'));
    });

    const deleteTime = document.createElement('button');
    deleteTime.textContent = 'Delete';
    deleteTime.addEventListener('click', () => {
      updateList.splice(index, 1);
      editTimesList(); // Refresh the list
    });

    wrapper.appendChild(span);
    wrapper.appendChild(editTime);
    wrapper.appendChild(deleteTime);
    el.times_management_list.appendChild(wrapper);
  });
}