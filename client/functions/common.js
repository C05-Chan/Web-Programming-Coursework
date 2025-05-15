export const el = {};

const allIdElements = document.querySelectorAll('[id]');

for (const element of allIdElements) {
  const key = element.id.replace(/-/g, '_'); // the g allows all hyphens in the id to be replaced with '_'
  el[key] = element;
}

export async function getRunners() {
  const runnersData = [];

  try {
    const response = await fetch('/runnersDetails.csv');
    const csvText = await response.text();
    const rows = csvText.trim().split('\n');

    for (const row of rows) {
      runnersData.push(row.split(','));
    }

    return runnersData;
  } catch (error) {
    errorMessageDisplay('Error loading CSV', 'error');
    console.error('Error loading CSV:', error);
    return [];
  }
}


export function clearContent() {
  if (el.error_message) {
    el.error_message.textContent = '';
  }

  const contents = document.querySelectorAll('.section-container');
  for (const section of contents) {
    section.style.display = 'none';
  }
}

export function showElement(e) {
  e.style.display = 'block';
}

export function hideElement(e) {
  e.style.display = 'none';
}

export function getClientID() {
  let clientID = sessionStorage.getItem('clientID'); // Use session storage for testing on one device/browser. Otherwise, if multiple device/browser, use local storage //

  if (!clientID) {
    clientID = 'clientID-' + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem('clientID', clientID);
  }
  return clientID;
}

export function removeClientID() {
  const clientID = sessionStorage.getItem('clientID');

  if (clientID) {
    sessionStorage.removeItem('clientID');
  }
}

export function errorMessageDisplay(message, type) {
  el.error_message.classList.remove('success', 'error');

  el.error_message.textContent = message;
  if (type === 'success' || type === 'error') {
    el.error_message.classList.add(type);
  }
}

export function errorMessageReset() {
  el.error_message.textContent = '';
}
