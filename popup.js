document.getElementById('analyze').addEventListener('click', () => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: analyzePerformance
            }, (results) => {
                if (results && results[0]) {
                    displayResults(results[0].result);
                } else {
                    displayError("No results returned from the content script.");
                }
            });
        });
    } catch (error) {
        displayError(error.message);
    }
});

function analyzePerformance() {
    const performanceMetrics = performance.getEntriesByType("navigation")[0];
    if (performanceMetrics) {
        return {
            loadTime: performanceMetrics.loadEventEnd - performanceMetrics.startTime,
            firstContentfulPaint: performanceMetrics.responseStart,
            domContentLoaded: performanceMetrics.domContentLoadedEventEnd - performanceMetrics.startTime,
            resourcesCount: performance.getEntriesByType('resource').length
        };
    } else {
        return null;
    }
}

function displayResults(metrics) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (metrics) {
        resultsDiv.innerHTML = `
            <p><strong>Performance Metrics:</strong></p>
            <p>Load Time: ${metrics.loadTime.toFixed(2)} ms</p>
            <p>First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)} ms</p>
            <p>DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)} ms</p>
            <p>Resources Count: ${metrics.resourcesCount}</p>
        `;
    } else {
        resultsDiv.innerHTML = `<p>No performance metrics available.</p>`;
    }
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p><strong>Error:</strong> ${message}</p>`;
}
