
document.querySelector('#start').addEventListener('click', startTimer);
document.querySelector('#record').addEventListener('click', recordTimer);
document.querySelector('#reset').addEventListener('click', resetTimer);
document.querySelector('#submit-btn')?.addEventListener('click', submitRecord);

let timerInterval;
let position = 0;

function startTimer() {
    let milliseconds = 0;

    if (!timerInterval)
        timerInterval = setInterval(function() {
            milliseconds ++;
            updateTimer(milliseconds);
        });

    (document.querySelector('#start')).style.display = 'none';
    (document.querySelector('#reset')).style.display = 'block';

}

function updateTimer(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    document.querySelector('#timer').textContent =
    `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}:${ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms}`;
}

function recordTimer(){
    const tableBody = document.querySelector('#position-times tbody');
    const placement = position++;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${placement}</td><td>${document.querySelector('#timer').textContent}</td>`;
    tableBody.appendChild(newRow);
}

function resetTimer(){
    (document.querySelector('#start')).style.display = 'block';
    (document.querySelector('#reset')).style.display = 'none';  
    
    
    clearInterval(timerInterval);
    timerInterval = null;
    position = 0;
    document.querySelector('#timer').textContent = '00:00:00:000';
    document.querySelector('#position-times tbody').innerHTML = '';
}


async function submitRecord(){
    const id = document.querySelector('#ID-No').value;
    console.log(id)

    const fullname = document.querySelector('#Name').value;
    console.log(fullname)
    
    const response = await fetch('submit', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ ID:id, name:fullname}),
    });
}