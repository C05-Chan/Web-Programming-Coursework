import { el, showElement, hideElement, errorMessageDisplay, clearContent } from './common-functions';

let updateList = [];
let selectedClientId = null;

async function getSubmission() {
  const response = await fetch('/get-all-data');
  const result = await response.json();

  if (!response.ok || result.status !== 'success') {
    errorMessageDisplay(result.message || 'Failed to fetch data', 'error');
    return [];
  }

  return result.data || [];
}

el.admin.addEventListener('click', async () => {
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
  }

  tableBody.innerHTML = '';

  data.forEach(item => {
    const row = document.createElement('tr');

    Object.values(item).forEach(value => {
      const resultCell = document.createElement('td');
      resultCell.textContent = value;
      row.appendChild(resultCell);
    });

    row.addEventListener('click', () => {
      if (item.data_type === 'times') {
        clearContent();
        showElement(el.time_management_container);

        updateList = [...item.data_array];
        selectedClientId = item.client_id;

        showElement(el.modify_times);
        editTimesList();
      }

      clearContent();
      showElement(el.runner_management);
      updateList = [...item.data_array];
      selectedClientId = item.client_id;
      showElement(document.querySelector('.runner-management-container'));
      editRunnersList();
    });

    tableBody.appendChild(row);
  });
},
);
