import { el, showElement, hideElement, errorMessageDisplay, getClientID } from './common.js';

let timerInterval;
let currentMilliseconds = 0;
let recordedTimes = [];

function updateTimer() {
  currentMilliseconds++;
  const hours = Math.floor(currentMilliseconds / 3600000);
  const minutes = Math.floor((currentMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((currentMilliseconds % 60000) / 1000);
  const ms = currentMilliseconds % 1000;

  el.stopwatch_display.textContent = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}:${ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms}`;
}

export function startTimer() {
  if (!timerInterval) {
    currentMilliseconds = 0;
    timerInterval = setInterval(updateTimer, 1);
  }
  hideElement(el.start);
  showElement(el.stop);
  showElement(el.record_time);
  showElement(el.submit_times);
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  hideElement(el.stop);
  hideElement(el.record_time);
  showElement(el.resume);
  showElement(el.reset);
}

export function resumeTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1);
  }

  hideElement(el.resume);
  hideElement(el.reset);
  showElement(el.stop);
}

export function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  currentMilliseconds = 0;
  recordedTimes = [];

  el.stopwatch_display.textContent = '00:00:00:000';
  el.times_list.innerHTML = '';

  showElement(el.start);
  hideElement(el.stop);
  hideElement(el.resume);
  hideElement(el.reset);
  hideElement(el.record_time);
  hideElement(el.submit_times);
}

export function addTime() {
  const timesListItem = document.createElement('li');
  const time = el.stopwatch_display.textContent;

  timesListItem.textContent = time;
  el.times_list.prepend(timesListItem);

  recordedTimes.push(time);

  errorMessageDisplay('Time recorded successfully', 'success');
  console.log('Recorded times:', recordedTimes);
}

export async function submitTimeRecords() {
  errorMessageDisplay('', null);

  if (recordedTimes.length === 0) {
    errorMessageDisplay('No times recorded to submit', 'error');
    return;
  }

  el.stop.click();

  try {
    const response = await fetch('/submit-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'times', data: recordedTimes, id: getClientID() }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessageDisplay(`Unable to submit time data. Error: ${result.error}`);
      localStorage.setItem('times', JSON.stringify(recordedTimes));
      return;
    }

    console.log(`Times submitted successfully: ${result}`);
    errorMessageDisplay('Times submitted successfully:', 'success');

    // if (localStorage.getItem('times')) {
    //   localStorage.removeItem('times');
    // }

    hideElement(document.querySelector('.stopwatch'));
  } catch (error) {
    console.log(`Error: ${error}`);
    errorMessageDisplay('Error submitting times, it is currently stored locally, please try again out of offline mode', 'error');
    localStorage.setItem('times', JSON.stringify(recordedTimes));
  }
}
