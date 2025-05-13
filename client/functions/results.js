import { el, showElement, errorMessageDisplay, clearContent } from './common.js';

async function getResults() {
  try {
    const response = await fetch('/get-race-result');
    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      console.log(`Could not get the results. Error: ${result.message}`);
      errorMessageDisplay('Could not get the results', 'error');
      return { results: [], hasResults: false };
    }

    return result;
  } catch (error) {
    console.error(`Error getting results: ${error}`);
    errorMessageDisplay('Could not get the results', 'error');
    return { results: [], hasResults: false };
  }
}

export async function runnersResultsBtn() {
  clearContent();
  el.error_message.textContent = '';
  showElement(document.querySelector('#result-container'));

  const data = await getResults();
  const tbody = el.results_table.querySelector('tbody');
  tbody.innerHTML = '';

  if (!data.hasResults || !Array.isArray(data.results) || data.results.length === 0) {
    errorMessageDisplay('No results found', 'error');
    return;
  }

  data.results
    .sort((a, b) => a.position - b.position)
    .forEach(result => {
      const row = document.createElement('tr');

      const format = [result.position, result.name, result.time];

      for (const value of format) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });
}
