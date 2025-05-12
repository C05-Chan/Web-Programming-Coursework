import { el, showElement, hideElement, clearContent } from './functions/common-functions';
import { adminBtn } from './functions/admin.js';
import { startTimer, stopTimer, resumeTimer, resetTimer, addTime, submitTimeRecords } from './functions/timer';
import { addRunner, submitRunnersRecords } from './functions/runners';

el.runners_results.addEventListener('click', showResults);

el.admin_view.addEventListener('click', adminBtn);

el.modify_times.addEventListener('click', () => {
  showElement(document.querySelector('.modify-times-container'));
  hideElement(el.modify_times);
  hideElement(el.times_list);
  editTimesList();
});


el.volunteer_view.addEventListener('click', () => {
  showElement(document.querySelector('.volunteer-nav'));
  hideElement(document.querySelector('.admin-nav'));
});

el.timer.addEventListener('click', () => {
  clearContent();
  showElement(el.timer_container);
});

el.start.addEventListener('click', startTimer);
el.stop.addEventListener('click', stopTimer);
el.resume.addEventListener('click', resumeTimer);
el.reset.addEventListener('click', resetTimer);
el.record_time.addEventListener('click', addTime);
el.submit_times.addEventListener('click', submitTimeRecords);

el.positions.addEventListener('click', () => {
  clearContent();
  showElement(el.runners_container);
});

el.record_runner.addEventListener('click', addRunner);
el.submit_runners.addEventListener('click', submitRunnersRecords);
