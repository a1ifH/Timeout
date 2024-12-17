const pinkBadge = '#f70776'
const orangeBadge = '#f96d00'
const agent = chrome

let timer = null
let mode = 'STOPPED'

let hours = 0
let minutes = 0
let seconds = 0

let totalIntervals = 1
let intervalsLeft = 0
let secondsLeft = 0
let totalSeconds = 0
let intervalSeconds = 0


function getState() {
    return {mode, hours, minutes, seconds, totalIntervals, totalSeconds}
}

function start(h, m, s, intervals) {
    console.log('started')

    hours = h
    minutes = m
    seconds = s
    totalIntervals = intervals
    intervalsLeft = totalIntervals

    intervalSeconds = (hours * 3600 + minutes * 60 + seconds)
    totalSeconds = intervalSeconds * totalIntervals
    secondsLeft = totalSeconds

    setBadgeColor(pinkBadge)
    setBadgeText(getTimeForBadge())

    mode = 'RUNNING'
    timer = setInterval(worker, 1000)
}

function pause() {
    console.log('paused')

    mode = 'PAUSED'
    clearInterval(timer)

    setBadgeColor(orangeBadge)
}

function stop() {
    console.log('stopped')

    mode = 'STOPPED'

    secondsLeft = 0
    // totalSeconds = 0
    intervalsLeft = 0
    intervalSeconds = 0

    clearInterval(timer)

    setBadgeText('')
}

function resume() {
    console.log('resumed')

    mode = 'RUNNING'

    timer = setInterval(worker, 1000)
    setBadgeColor(pinkBadge)
}

function restart() {
    console.log('restarted')

    mode = 'RUNNING'
    secondsLeft = totalSeconds

    intervalsLeft = totalIntervals
    timer = setInterval(worker, 1000)

    setBadgeText(getTimeForBadge())
    setBadgeColor(pinkBadge)
}

function worker() {
    secondsLeft--

    setBadgeText(getTimeForBadge())

    if((secondsLeft % intervalSeconds) == 0) {
        intervalsLeft--

        showNotification()
        console.log('show notification')
        
        if(intervalsLeft == 0) {
            stop()
            console.log('stopped after all intervals end')
            requestModelFor('show')
        }
        else if(intervalsLeft > 0) {
            pause()
            console.log('paused after interval end')
            requestModelFor('show')
        }
    }
}

function setBadgeColor(color) {
    agent.browserAction.setBadgeBackgroundColor({color})
}

function setBadgeText(txt) {
    agent.browserAction.setBadgeText({text: txt})
}

function getTimeForBadge() {
    let h = Math.floor(secondsLeft / 3600)
    let m = Math.floor(secondsLeft % 3600 / 60)
    let s = Math.floor(secondsLeft % 3600 % 60)

    let hDisplay = h > 0 ? h.toString().padStart(2, '0') : ''
    let mDisplay = (h > 0 ? ':' : '') + (m > 0 ? m.toString().padStart(2, '0') : '')
    let sDisplay = (m > 0 ? ':' : '') + (s >= 0 ? s.toString().padStart(2, '0') : '')
    
    return hDisplay + mDisplay + sDisplay
}

function getTimeForPopup() {
    let h = Math.floor(secondsLeft / 3600)
    let m = Math.floor(secondsLeft % 3600 / 60)
    let s = Math.floor(secondsLeft % 3600 % 60)

    let hDisplay = h.toString().padStart(2, '0') + ':'
    let mDisplay = m.toString().padStart(2, '0') + ':'
    let sDisplay = s.toString().padStart(2, '0')
    
    return hDisplay + mDisplay + sDisplay
}

function requestModelFor(action) {
    agent.tabs.query({}, tabs => {
        tabs.forEach(tab => {
            agent.tabs.sendMessage(tab.id, {
                action: `${action}Model`, 
                time: intervalSeconds
            })
        })
    })
}

function getStatusUpdate() {
    return {
        mode,
        percent: percentage(secondsLeft, totalSeconds)
    }
    // return parseInt(((totalIntervals - intervalsLeft) / totalIntervals) * 100)
}

function percentage(partialValue, totalValue) {
    return parseInt((partialValue * 100) / totalValue)
}

function showNotification() {
    agent.notifications.create(null, {
        type: 'basic',
        iconUrl: 'icons/128.png',
        title: 'Your time is up!!!',
        message: 'Please take a break!!!',
        requireInteraction: true,
    })
}

agent.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.command == 'closeModel') {
        requestModelFor('close')
    }
    else if(request.command == 'ignoreBreak') {
        resume()
    }
})