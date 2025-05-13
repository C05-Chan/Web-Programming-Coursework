import { el, showElement, hideElement, clearContent } from './functions/common.js';
import { adminBtn, editTimesList, addNewTime, popupTimeDone, popupTimeCancel, saveNewTimes, editRunnersList, addNewRunner, popupRunnerDone, popupRunnersCancel, saveNewRunners } from './functions/admin.js';
import { startTimer, stopTimer, resumeTimer, resetTimer, addTime, submitTimeRecords } from './functions/timer.js';
import { addRunner, submitRunnersRecords } from './functions/runners.js';

// el.runners_results.addEventListener('click', showResults);

el.admin_view.addEventListener('click', () => {
  console.log('el.admin_nav:', el.admin_nav);
  clearContent();

  showElement(el.admin_container);
  showElement(el.admin_nav);
  hideElement(el.volunteer_nav);
  adminBtn();
});

el.modify_times.addEventListener('click', () => {
  showElement(el.modify_times_container);
  hideElement(el.modify_times);
  editTimesList();
});

el.add_time.addEventListener('click', addNewTime);
el.times_popup_done.addEventListener('click', popupTimeDone);
el.times_popup_cancel.addEventListener('click', popupTimeCancel);
el.save_times.addEventListener('click', saveNewTimes);

el.modify_runners.addEventListener('click', () => {
  showElement(el.modify_runner_container);
  hideElement(el.modify_runners);
  editRunnersList();
});

el.add_runner.addEventListener('click', addNewRunner);
el.runner_popup_done.addEventListener('click', popupRunnerDone);
el.runner_popup_cancel.addEventListener('click', popupRunnersCancel);
el.save_runners.addEventListener('click', saveNewRunners);


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
