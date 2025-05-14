import { el, showElement, errorMessageDisplay, clearContent } from './common.js';

async function getResults() {
  try {
    const response = await fetch('/get-race-result');
    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      console.log(`Could not get the results. Error: ${data.message}`);
      errorMessageDisplay('Could not get the results', 'error');
      return [];
    }

    return data.results;
  } catch (error) {
    console.error(`Error getting results: ${error}`);
    errorMessageDisplay('Could not get the results', 'error');
    return [];
  }
}

export async function runnersResultsBtn() {
  clearContent();
  el.error_message.textContent = '';
  showElement(el.result_container);

  const data = await getResults();
  const tbody = el.results_table.querySelector('tbody');
  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    errorMessageDisplay('No results found', 'error');
    return;
  }

  const sortedResults = data.sort((a, b) => a.position - b.position);

  for (const result of sortedResults) {
    const row = document.createElement('tr');

    const columns = [result.position, result.name, result.time];

    for (const value of columns) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }
}
