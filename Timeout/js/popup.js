let hoursInp = document.querySelector('.hours')
let minutesInp = document.querySelector('.minutes')
let secondsInp = document.querySelector('.seconds')
let intervalsInp = document.getElementById('intervals')

let progressBar = document.querySelector('.progress-bar')
let bar = document.querySelector('.bar')

let startBtn = document.querySelector('.start')
let stopBtn = document.querySelector('.stop')
let pauseBtn = document.querySelector('.pause')
let resumeBtn = document.querySelector('.resume')
let restartBtn = document.querySelector('.restart')

let bgPage, progressWorker, state, mode

init()

async function init() {
    bgPage = await getBackgroundPage()
    syncState()
    console.log(state)

    validateInputs()

    let inputs = [hoursInp, minutesInp, secondsInp, intervalsInp]
    
    inputs.forEach(el => {
        el.addEventListener('change', validateInputs)
        el.addEventListener('keyup', validateInputs)
    })

    startBtn.addEventListener('click', startClicked)
    stopBtn.addEventListener('click', stopClicked)
    pauseBtn.addEventListener('click', pauseClicked)
    resumeBtn.addEventListener('click', resumeClicked)
    restartBtn.addEventListener('click', restartClicked)

    if(mode == 'RUNNING') {
        hide(startBtn, resumeBtn)
        startProgressWorker()
    }
    else if(mode == 'STOPPED') {
        hide(stopBtn, pauseBtn, restartBtn, resumeBtn)
    }
    else if(mode == 'PAUSED') {
        hide(pauseBtn, startBtn)
    }
}

function startClicked() {
    let hours = hoursInp.value * 1
    let minutes = minutesInp.value * 1
    let seconds = secondsInp.value * 1
    let intervals = intervalsInp.value * 1

    bgPage.start(hours, minutes, seconds, intervals)

    hide(startBtn)
    show(stopBtn, pauseBtn, restartBtn)
    startProgressWorker()
}

function stopClicked() {
    bgPage.stop()

    hide(stopBtn, pauseBtn, restartBtn, resumeBtn)
    show(startBtn)
    stopProgressWorker()
}

function pauseClicked() {
    bgPage.pause()

    hide(pauseBtn, startBtn)
    show(stopBtn, resumeBtn, restartBtn)
    stopProgressWorker()
}

function resumeClicked() {
    bgPage.resume()

    hide(resumeBtn, startBtn)
    show(stopBtn, pauseBtn, restartBtn)
    startProgressWorker()
}

function restartClicked() {
    bgPage.restart()
    syncState()

    hide(resumeBtn, startBtn)
    show(stopBtn, pauseBtn)
    startProgressWorker()
}

function startProgressWorker() {
    clearInterval(progressWorker)
    updateProgress()
    show(progressBar)
    progressWorker = setInterval(updateProgress, 500)
}

function stopProgressWorker() {
    clearInterval(progressWorker)
    hide(progressBar)
}

function updateProgress() {
    let statusUpdate = bgPage.getStatusUpdate()
    mode = statusUpdate.mode
    let percent = statusUpdate.percent
    
    if(mode == 'PAUSED') {
        stopProgressWorker()

        hide(pauseBtn, startBtn)
        show(stopBtn, resumeBtn, restartBtn)
    }

    bar.style.width = `${percent}%`
    bar.firstElementChild.innerText = `${percent}%`
    
    if(percent == 0) completed()
}

function completed() {
    clearInterval(progressWorker)

    setTimeout(() => {
        hide(progressBar, stopBtn, pauseBtn, resumeBtn)
        show(startBtn)
    }, 500)
}

function syncState() {
    state = bgPage.getState()
    mode = state.mode

    hoursInp.value = state.hours
    minutesInp.value = state.minutes
    secondsInp.value = state.seconds
    intervalsInp.value = state.totalIntervals
}

function validateInputs() {
    let inputs = [hoursInp, minutesInp, secondsInp, intervalsInp]
    let disableBtn = false

    inputs.forEach(el => {
        if(el.id == 'intervals' && el.value == '') {
            disableBtn = true
        }
        else {
            let min = el.min * 1
            let max = el.max * 1
            let value = el.value * 1
    
            if(value < min) el.value = min
            if(value > max) el.value = max
        }
    })

    let hours = hoursInp.value * 1
    let minutes = minutesInp.value * 1
    let seconds = secondsInp.value * 1

    startBtn.disabled = (hours == 0 && minutes == 0 && seconds == 0) || disableBtn
}

function show() {
    Array.from(arguments).forEach(el => el.classList.remove('hidden'))
}

function hide() {
    Array.from(arguments).forEach(el => el.classList.add('hidden'))
}

function getBackgroundPage() {
    return new Promise((resolve, reject) => chrome.runtime.getBackgroundPage(resolve))
}