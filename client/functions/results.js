import { el, showElement, errorMessageDisplay, clearContent, hideElement } from './common.js';

export async function getResults() {
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

export function createCsv(data) {
  if (!data || !data.length) {
    console.log('no data to convert');
    return '';
  }

  let csv = '';
  const headers = Object.keys(data[0]);
  csv += headers.join(',') + '\n';

  for (let i = 0; i < data.length; i++) {
    const row = [];
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      row.push(data[i][key]);
    }
    csv += row.join(',') + '\n';
  }

  return csv;
}

export function downloadCsv(csv, filename = 'race-results.csv') {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


export async function runnersResultsBtn() {
  clearContent();
  el.error_message.textContent = '';
  showElement(el.result_container);

  const data = await getResults();
  const tableBody = el.results_table.querySelector('tbody');
  tableBody.innerHTML = '';

  if (!data || data.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.textContent = 'No results found!';
    cell.colSpan = 3;
    row.appendChild(cell);
    tableBody.appendChild(row);
    hideElement(el.export_csv);
    return null;
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

    tableBody.appendChild(row);
  }

  showElement(el.export_csv);
  return sortedResults;
}
