

export const el = {};

const allIdElements = document.querySelectorAll('[id]');

allIdElements.forEach(element => {
  const key = element.id.replace(/-/g, '_'); // the g allows all hyphen in the id have '_' rather than just the first hyphen
  el[key] = element;
});


export function getRunners() {
  const runnersData = [];
  return fetch('/runnersDetails.csv')
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n');
      rows.forEach(row => {
        runnersData.push(row.split(','));
      });

      return runnersData;
    })
    .catch(err => {
      errorMessageDisplay('Error loading CSV', 'error');
      console.error('Error loading CSV:', err);
      return [];
    });
}

export function clearContent() {
  if (el.error_message) el.error_message.textContent = '';
  document.querySelectorAll('.section').forEach((content) => {
    content.style.display = 'none';
  });
}

export function showElement(e) {
  e.style.display = 'block';
}

export function hideElement(e) {
  e.style.display = 'none';
}

export function getClientID() {
  let clientID = sessionStorage.getItem('clientID');

  if (!clientID) {
    clientID = 'clientID-' + Math.random().toString(36).substring(2, 14);
    sessionStorage.setItem('clientID', clientID);
  }
  return clientID;
}

export function errorMessageDisplay(message, type) {
  el.error_message.classList.remove('success', 'error');

  el.error_message.textContent = message;
  if (type === 'success' || type === 'error') {
    el.error_message.classList.add(type);
  }
}
