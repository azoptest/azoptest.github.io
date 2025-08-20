document.addEventListener('DOMContentLoaded', function() {
    console.log("start script.")

    function getBrowserUA() {
        return navigator.userAgent
    }

    function getScreenResolution() {
        return {
            width:window.screen.width,
            height:window.screen.height
        }
    }

    function collectData() {
        const uaPromise = new Promise((resolve) => {
            startTime = performance.now()
            result = getBrowserUA()
            endTime = performance.now()
            resolve("UA: " + result + " cost: " + (endTime - startTime) + "ms")
        })
        const screenPromise = new Promise((resolve) => {
            startTime = performance.now()
            result = getScreenResolution()
            endTime = performance.now()
            resolve("Screen: " + result + " cost: " + (endTime - startTime) + "ms")
        })

        const timeoutPromise = new Promise((resolve) => {
            setTimeout(resolve, 100)
        })

        Promise.race([Promise.allSettled([uaPromise, screenPromise]), timeoutPromise]).then((results) => {
            if (Array.isArray(results)) {
                const fulFilledResults= results.filter(result => result.status ==='fulfilled')
                .map(result => result.value);
                fullstr = fulFilledResults.join('\n')
                console.log("full str " + fullstr)
                const displayElement = document.getElementById('visitor-id-display')
                displayElement.textContent = "Collect Result: \n" + fullstr
            }
        })
    }

    collectData()
})