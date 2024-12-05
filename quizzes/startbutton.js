document.getElementById('confirm-rules').addEventListener('change', function () {
    const startButton = document.getElementById('start-quiz-btn');
    if (this.checked) {
        // Enable the link by removing the disabled class and onclick handler
        startButton.classList.remove('disabled');
        startButton.onclick = null; // Remove the onclick handler
    } else {
        // Disable the link by adding the disabled class and onclick handler
        startButton.classList.add('disabled');
        startButton.onclick = function () { return false; }; // Prevent navigation
    }
});
