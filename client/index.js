import { el, showElement, hideElement, clearContent } from './functions/common.js';
import { adminBtn, editTimesList, addNewTime, popupTimeDone, popupTimeCancel, saveNewTimes, editRunnersList, addNewRunner, popupRunnerDone, popupRunnersCancel, saveNewRunners, createResult, generateResults } from './functions/admin.js';
import { startTimer, stopTimer, resumeTimer, resetTimer, addTime, submitTimeRecords, clearTimes, displayRecordedTimes, checkTimesSubmission } from './functions/timer.js';
import { addRunner, submitRunnersRecords, clearRunners, displayRecordedRunners, checkRunnersSubmission } from './functions/runners.js';
import { runnersResultsBtn } from './functions/results.js';


el.runners_results.addEventListener('click', () => {
  clearContent();
  hideElement(el.volunteer_nav);
  hideElement(el.create_results);
  runnersResultsBtn();
});

el.admin_view.addEventListener('click', () => {
  clearContent();

  showElement(el.admin_container);
  hideElement(el.volunteer_nav);
  adminBtn();
});

el.create_results.addEventListener('click', () => {
  clearContent();
  showElement(el.admin_container);
  hideElement(el.create_results);
  showElement(el.create_results_buttons);

  createResult();
});

el.submit_results.addEventListener('click', generateResults);

el.cancel_create_results.addEventListener('click', () => {
  hideElement(el.create_results_buttons);

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
el.clear_times.addEventListener('click', clearTimes);

el.modify_runners.addEventListener('click', () => {
  showElement(el.modify_runner_container);
  hideElement(el.modify_runners);
  editRunnersList();
});

el.add_runner.addEventListener('click', addNewRunner);
el.runner_popup_done.addEventListener('click', popupRunnerDone);
el.runner_popup_cancel.addEventListener('click', popupRunnersCancel);
el.save_runners.addEventListener('click', saveNewRunners);
el.clear_runners.addEventListener('click', clearRunners);


el.volunteer_view.addEventListener('click', () => {
  showElement(el.volunteer_nav);
  hideElement(el.create_results);
});

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


async function registerServiceWorker() {
  if (navigator.serviceWorker) {
    await navigator.serviceWorker.register('./sw.js');
  }
}


function loadLocalStorageData() {
  const savedTimes = localStorage.getItem('times');
  const savedRunners = localStorage.getItem('runners');
  const savedTimerDisplay = localStorage.getItem('timerDisplay');

  if (savedTimes) {
    const list = JSON.parse(localStorage.getItem('times'));
    displayRecordedTimes(list);
    checkTimesSubmission();
  }

  if (savedRunners) {
    const list = JSON.parse(localStorage.getItem('runners'));
    displayRecordedRunners(list);
    checkRunnersSubmission();
  }

  if (savedTimerDisplay) {
    el.stopwatch_display.textContent = savedTimerDisplay;
    hideElement(el.start);
    showElement(el.resume);
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
        console.log('Successfully synced times to server');
      } else {
        console.log(`Failed to sync times ${result.message}`);
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
        console.log('Successfully synced runners to server');
      } else {
        console.log(`Failed to sync times ${result.message}`);
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
        console.log('Successfully synced results to server');
      } else {
        console.log(`Failed to sync results: ${result.message}`);
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
});
