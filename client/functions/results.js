import { el, showElement, errorMessageDisplay, clearContent, hideElement } from './common.js';

export async function getResults() {
  // get results from the server that was created by the admin //
  try {
    const response = await fetch('/get-race-result'); // get results from the server //
    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
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
  // this creates the CSV file  //

  if (!data || !data.length) {
    errorMessageDisplay('No data to convert', 'error');
    return '';
  }

  let csv = '';
  const headers = Object.keys(data[0]); // get the object keys from the first data item to use as headers //
  csv += headers.join(',') + '\n'; // join the headers with commas and add a newline //

  for (let i = 0; i < data.length; i++) {
    const row = [];
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j]; // current header key //
      row.push(data[i][key]); // push the corresponding value from the data object //
    }
    csv += row.join(',') + '\n'; // join the row values with commas and add newline //
  }

  return csv;
}

export function downloadCsv(csv, filename = 'race-results.csv') {
  // starts downloading the CSV as a file  //

  const blob = new Blob([csv], { type: 'text/csv' }); // wraps the CSV data in a blob object //
  const url = URL.createObjectURL(blob); // makes a temporary link for that blob //
  const a = document.createElement('a'); // creates a fake link element //
  a.href = url; // points the link to the blob URL //
  a.download = filename; // tells the browser what to name the downloaded file //
  a.click(); // clicks the link automatically to start download //
  URL.revokeObjectURL(url); // cleans up by getting rid of the blob link //
}

export async function runnerResultView() {
  // display the runners results

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

  const sortedResults = data.sort((a, b) => a.position - b.position); // sorts the data based on position by comparing the numbers //

  for (const result of sortedResults) {
    const row = document.createElement('tr');

    const columns = [result.position, result.name, result.time];
    // this will format the table so the the table will show in that order and those items //

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
