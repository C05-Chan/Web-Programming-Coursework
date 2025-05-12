
export const el = {};
const allIdElements = document.querySelectorAll('[id]');

allIdElements.forEach(element => {
  const key = element.id.replace(/-/g, '_'); // the g allows all hyphen in the id have '_' rather than just the first hyphen
  el[key] = element;
});

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
  }
  return clientID;
}

export function errorMessageDisplay(message, type) {
  if (type === 'success') {
    message.classList.add('success');
  } else if (type === 'error') {
    message.classList.add('error');
  }
}
