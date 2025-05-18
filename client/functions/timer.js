import { el, showElement, hideElement, errorMessageDisplay, getClientID, removeClientID, errorMessageReset } from './common.js';

// Global variable //
let timerInterval; // holds the setInterval ID for updating the timer //
let startTime; // stores the timestamp when timer starts or resumes //
let currentMilliseconds = 0;
let recordedTimes = [];
let isRunning = false; // flag to track if timer is currently running //

function updateTimer() {
  // updates the stopwatch display based on current milliseconds  //
  const currentTime = Date.now();
  currentMilliseconds = currentTime - startTime;

  // calculate hours, minutes, seconds, milliseconds from current milliseconds  //
  let hours = Math.floor(currentMilliseconds / 3600000);
  let minutes = Math.floor((currentMilliseconds % 3600000) / 60000);
  let seconds = Math.floor((currentMilliseconds % 60000) / 1000);
  let ms = currentMilliseconds % 1000;

  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');
  ms = String(ms).padStart(3, '0');


  el.stopwatch_display.textContent = `${hours}:${minutes}:${seconds}:${ms}`;

  // automatically stop timer after 24 hours (86400000 ms) //
  if (currentMilliseconds >= 86400000) {
    stopTimer();
  }
}


function initialTimerButtonState() {
  // sets initial visibility of buttons when timer resets or page loads //
  showElement(el.start);
  hideElement(el.stop);
  hideElement(el.resume);
  hideElement(el.reset);
  hideElement(el.record_time);
  hideElement(el.submit_times);
  hideElement(el.clear_times);
}

// starts the timer if it’s not already running //
export function startTimer() {
  if (!timerInterval && !isRunning) {
    timerInterval = setInterval(updateTimer, 10); // update every 10 ms //
    startTime = Date.now() - currentMilliseconds; // adjust start time if resuming //
    isRunning = true;
  }

  hideElement(el.start);
  showElement(el.stop);
  showElement(el.record_time);
  showElement(el.submit_times);
}

// stops the timer but keeps the current millisecond //
export function stopTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    currentMilliseconds = Date.now() - startTime; // save current millisecond //
    timerInterval = null;
    isRunning = false;
  }

  hideElement(el.stop);
  hideElement(el.record_time);
  showElement(el.resume);
  showElement(el.reset);
}


export function resumeTimer() {
  // resumes the timer from where it left off //
  if (!timerInterval && !isRunning) {
    startTime = Date.now() - currentMilliseconds; // adjust start time for resumed session //
    timerInterval = setInterval(updateTimer, 10);
    isRunning = true;
  }


  hideElement(el.resume);
  hideElement(el.reset);
  showElement(el.stop);
  showElement(el.record_time);
}

export function resetTimer() {
  // resets the timer and clears recorded times and display //
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  recordedTimes = [];
  currentMilliseconds = 0;
  isRunning = false;

  el.stopwatch_display.textContent = '00:00:00:000';
  el.times_list.innerHTML = '';

  initialTimerButtonState(); // reset buttons to initial state //
}

export function addTime() {
// records the current displayed time and saves it locally //
  const time = el.stopwatch_display.textContent;
  recordedTimes.push(time);

  localStorage.setItem('times', JSON.stringify(recordedTimes));
  errorMessageDisplay('Time recorded successfully!', 'success');

  const list = JSON.parse(localStorage.getItem('times'));
  displayRecordedTimes(list);
}


export function displayRecordedTimes(list) {
  // updates the list of recorded times displayed on the page //
  el.times_list.innerHTML = '';

  for (const item of list) {
    const timesListItem = document.createElement('li');
    timesListItem.textContent = item;
    el.times_list.prepend(timesListItem);
  }
}


export async function submitTimeRecords() {
  // submits recorded times to the server //
  errorMessageDisplay('', null); // clear any previous messages //

  if (recordedTimes.length === 0) {
    errorMessageDisplay('No times recorded to submit', 'error');
    return;
  }

  el.stop.click(); // stop timer before submitting //
  const clientId = getClientID();

  try {
    const response = await fetch('/submit-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'times', data: recordedTimes, id: clientId }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessageDisplay(`Unable to submit time data. Error: ${result.error}`, 'error');
      localStorage.setItem('server-times', JSON.stringify(recordedTimes));
      localStorage.setItem('server-times-client', clientId);
      return;
    }

    errorMessageDisplay('Times submitted successfully:', 'success');
    localStorage.setItem('times', JSON.stringify(recordedTimes));

    hideElement(document.querySelector('.stopwatch-container'));
    showElement(el.clear_times);
  } catch (error) {
    console.error(`Error: ${error}`);
    errorMessageDisplay('Error submitting times, it is currently stored locally, please try again out of offline mode', 'error');
    localStorage.setItem('server-times', JSON.stringify(recordedTimes));
    localStorage.setItem('server-times-client', clientId);
  }

  localStorage.setItem('submitted-times', 'true'); // mark as submitted //
}


export function clearTimes() {
  // clears all recorded times and resets timer and UI //
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  recordedTimes = [];
  el.stopwatch_display.textContent = '00:00:00:000';

  el.times_list.innerHTML = '';
  localStorage.removeItem('times');
  localStorage.removeItem('submitted-times');

  errorMessageReset();
  initialTimerButtonState();
  removeClientID();

  document.querySelector('.stopwatch-container').style.display = 'grid';
  hideElement(el.clear_times);
}

export function checkTimesSubmission() {
  // checks if times have been submitted previously and updates UI accordingly //
  const isTimeSubmitted = localStorage.getItem('submitted-times');

  if (isTimeSubmitted) {
    hideElement(document.querySelector('.stopwatch-container'));
    showElement(el.clear_times);
    displayRecordedTimes(JSON.parse(localStorage.getItem('times')));
  }
}
