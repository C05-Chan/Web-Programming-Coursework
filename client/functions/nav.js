import { el, showElement, hideElement, clearContent } from './common-functions';

export function nav() {
  el.volunteer.addEventListener('click', () => {
    showElement(document.querySelector('.volunteer-nav'));
    hideElement(document.querySelector('.admin-nav'));
  });

  el.timer.addEventListener('click', () => {
    clearContent();
    showElement(el.timer_container);
  });

  el.positions.addEventListener('click', () => {
    clearContent();
    showElement(el.runners_container);
  });
}
