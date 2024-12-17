chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == 'showModel') {
        showModel(request.time)
    }
    else if(request.action == 'closeModel') {
        closeModel()
    }
})

function showModel(time) {
    let overlay = document.createElement('div')
    overlay.id = 'time-out-time-overlay'

    let shadow = overlay.attachShadow({mode: 'open'})

    let container = document.createElement('div')
    container.classList.add('popup-container', 'scale-in-center')

    container.innerHTML = `
        <link rel="stylesheet" href="${chrome.runtime.getURL('css/model.css')}">
        <div class="bell-icon-container">
            <img src="${chrome.runtime.getURL('./icons/notification.png')}" style="width: 150px;" class="shake-top">
        </div>
        <div class="popup-content">
            <div class="popup-header">
                <h1 class="popup-title">Hello !!!</h1>
            </div>
            <div class="popup-body">
                <p>You have spent ${formatTime(time)} please take a break and come back later.</p>
            </div>
            <div class="popup-footer">
                <button class="btn take-break">Take a Break</button>
                <button class="btn ignore-break">Later, Busy at the Moment</button>
            </div>
        </div>
    `

    shadow.appendChild(container)

    shadow.querySelector('.btn.take-break').addEventListener('click', () => {
        chrome.runtime.sendMessage({command: 'closeModel'})
    })

    shadow.querySelector('.btn.ignore-break').addEventListener('click', () => {
        chrome.runtime.sendMessage({command: 'closeModel'})
        chrome.runtime.sendMessage({command: 'ignoreBreak'})
    })

    document.body.appendChild(overlay)
}

function closeModel() {
    document.getElementById('time-out-time-overlay')?.remove()
}

function formatTime(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}