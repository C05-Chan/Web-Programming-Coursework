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

    if (!result.times || !result.runners || result.times.length === 0 || result.runners.length === 0) {
      return { results: [], hasResults: false };
    }


    const combinedResults = [];
    const minLength = Math.min(result.times.length, result.runners.length);

    for (let i = 0; i < minLength; i++) {
      combinedResults.push({
        position: result.runners[i].position,
        name: result.runners[i].name,
        time: result.times[i],
        id: result.runners[i].id,
      });
    }

    return { results: combinedResults, hasResults: combinedResults.length > 0 };
  } catch (error) {
    console.error(`Error getting results: ${error}`);
    errorMessageDisplay('Could not get the results', 'error');
    return { results: [], hasResults: false };
  }
}

export async function runnersResultsBtn() {
  clearContent();
  el.error_message.textContent = '';
  showElement(el.result_container);

  const data = await getResults();
  const tbody = el.results_table.querySelector('tbody');
  tbody.innerHTML = '';

  if (!data.hasResults || data.results.length === 0) {
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
