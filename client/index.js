import { el, showElement, hideElement, clearContent, errorMessageReset, errorMessageDisplay } from './functions/common.js';
import { admin, editTimesList, addNewTime, popupTimeDone, popupTimeCancel, saveNewTimes, editRunnersList, addNewRunner, popupRunnerDone, popupRunnersCancel, saveNewRunners, createResult, generateResults } from './functions/admin.js';
import { startTimer, stopTimer, resumeTimer, resetTimer, addTime, submitTimeRecords, clearTimes, displayRecordedTimes, checkTimesSubmission } from './functions/timer.js';
import { addRunner, submitRunnersRecords, clearRunners, displayRecordedRunners, checkRunnersSubmission } from './functions/runners.js';
import { createCsv, downloadCsv, runnerResultView, getResults } from './functions/results.js';

function handleNavChange() {
  const selected = el.nav_dropdown.value;
  sessionStorage.setItem('selectedView', el.nav_dropdown.value);

  if (selected === '') {
    clearContent();
    showElement(el.info);
    hideElement(el.volunteer_nav);
    hideElement(el.manage_back);
  } else if (selected === 'runners-results') {
    clearContent();
    hideElement(el.volunteer_nav);
    hideElement(el.create_results);
    runnerResultView();
    hideElement(el.manage_back);
  } else if (selected === 'admin-view') {
    clearContent();
    showElement(el.admin_container);
    hideElement(el.volunteer_nav);
    admin();
    hideElement(el.manage_back);
  } else if (selected === 'volunteer-view') {
    clearContent();
    showElement(el.volunteer_nav);
    hideElement(el.create_results);
    hideElement(el.manage_back);
  }
}

el.nav_dropdown.addEventListener('change', handleNavChange);

el.admin_reload.addEventListener('click', () => {
  window.location.reload();
});

el.create_results.addEventListener('click', () => {
  clearContent();
  showElement(el.admin_container);
  hideElement(el.create_results);
  showElement(el.create_results_buttons);
  hideElement(el.initial_message);
  showElement(el.create_message);

  createResult();
});

el.submit_results.addEventListener('click', generateResults);

el.cancel_create_results.addEventListener('click', () => {
  hideElement(el.create_results_buttons);
  showElement(el.initial_message);
  hideElement(el.create_message);
  errorMessageReset();
  admin();
});

el.manage_back.addEventListener('click', () => {
  hideElement(el.manage_back);
  clearContent();
  showElement(el.admin_container);
  hideElement(el.volunteer_nav);

  hideElement(el.modify_runner_container);
  hideElement(el.modify_times_container);

  showElement(el.modify_runners);
  showElement(el.modify_times);
  admin();
});

el.modify_times.addEventListener('click', () => {
  showElement(el.modify_times_container);
  hideElement(el.modify_times);
  editTimesList();
});


el.add_time.addEventListener('click', addNewTime);
el.times_popup_done.addEventListener('click', popupTimeDone);

el.time_input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    popupTimeDone();
  }
});

el.times_popup_cancel.addEventListener('click', popupTimeCancel);
el.save_times.addEventListener('click', saveNewTimes);
el.clear_times.addEventListener('click', clearTimes);

el.modify_runners.addEventListener('click', () => {
  showElement(el.modify_runner_container);
  hideElement(el.modify_runners);
  editRunnersList();
});

el.add_runner.addEventListener('click', addNewRunner);

el.runner_position.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    el.runner_ID.focus();
  }
});

el.runner_ID.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addRunner();
  }
});

el.runner_popup_done.addEventListener('click', popupRunnerDone);

el.edit_runner_position.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    el.edit_runner_id.focus();
  }
});

el.edit_runner_id.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    popupRunnerDone();
  }
});

el.runner_popup_cancel.addEventListener('click', popupRunnersCancel);
el.save_runners.addEventListener('click', saveNewRunners);
el.clear_runners.addEventListener('click', clearRunners);


el.timer.addEventListener('click', () => {
  clearContent();
  showElement(el.timer_container);
  checkTimesSubmission();
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
  checkRunnersSubmission();
});

el.record_runner.addEventListener('click', addRunner);
el.submit_runners.addEventListener('click', submitRunnersRecords);


el.results_reload.addEventListener('click', () => {
  window.location.reload();
});

el.export_csv.addEventListener('click', async () => {
  const data = await getResults();
  if (!data || data.length === 0) {
    errorMessageDisplay('No data available to export', 'error');
    return;
  }

  const sortedResults = data.sort((a, b) => a.position - b.position);
  const csvData = createCsv(sortedResults);
  downloadCsv(csvData);
});

async function registerServiceWorker() {
  if (navigator.serviceWorker) {
    await navigator.serviceWorker.register('./sw.js');
  }
}


function loadLocalStorageData() {
  const savedTimes = localStorage.getItem('times');
  const savedRunners = localStorage.getItem('runners');
  const isTimeSubmitted = localStorage.getItem('submitted-times');
  const isRunnerSubmitted = localStorage.getItem('submitted-runners');

  if (savedTimes && isTimeSubmitted) {
    const list = JSON.parse(localStorage.getItem('times'));
    displayRecordedTimes(list);
    checkTimesSubmission();
  }

  if (savedRunners && isRunnerSubmitted) {
    const list = JSON.parse(localStorage.getItem('runners'));
    displayRecordedRunners(list);
    checkRunnersSubmission();
  }
}


async function isApplicationOffline() {
  if (!navigator.onLine) { // Check for internet connection //
    return 'offline';
  }

  try {
    const response = await fetch('http://localhost:8080', { method: 'HEAD' });
    if (response.ok) {
      await syncLocalStorageData(); // This would return true if the status code is 200 //
      return 'online';
    }
  } catch (error) {
    return 'offline';
  }
}

async function syncLocalStorageData() {
  const localTime = localStorage.getItem('server-times');
  const localTimeId = localStorage.getItem('server-times-client');

  const localRunners = localStorage.getItem('server-runners');
  const localRunnersId = localStorage.getItem('server-runners-client');

  const localResult = localStorage.getItem('results');

  try {
    if (localTime && localTimeId) {
      const times = JSON.parse(localTime);

      const response = await fetch('/submit-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'times', data: times, id: localTimeId }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        localStorage.removeItem('server-times');
        localStorage.removeItem('server-times-client');
      } else {
        console.error(`Failed to sync times ${result.message}`);
      }
    }

    if (localRunners && localRunnersId) {
      const runners = JSON.parse(localRunners);

      const response = await fetch('/submit-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'runners', data: runners, id: localRunnersId }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        localStorage.removeItem('server-runners');
        localStorage.removeItem('server-runners-client');
      } else {
        console.error(`Failed to sync times ${result.message}`);
      }
    }

    if (localResult) {
      const raceResult = JSON.parse(localResult);

      const response = await fetch('/add-race-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: raceResult }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        localStorage.removeItem('results');
      } else {
        console.error(`Failed to sync results: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

window.addEventListener('load', () => {
  registerServiceWorker();
  isApplicationOffline();
  loadLocalStorageData();

  const savedView = sessionStorage.getItem('selectedView');
  if (savedView) {
    el.nav_dropdown.value = savedView;
    handleNavChange();
  }
});
