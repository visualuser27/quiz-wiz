const questions = [
    {
        question: "What is the capital of France?",
        answers: ["Berlin", "Madrid", "Paris", "Rome"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Earth", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "Who wrote 'To Kill a Mockingbird'?",
        answers: ["Harper Lee", "Mark Twain", "J.K. Rowling", "Ernest Hemingway"],
        correct: 0
    }
];

let currentQuestion = 0;
let score = 0;
let quizStarted = false;
let timer;
const TIME_LIMIT = 15; // Time limit for each question in seconds

document.getElementById('start-button').onclick = function() {
    quizStarted = true;
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    loadQuestion();
    enterFullScreen(); // Enter full-screen mode
};

document.getElementById('next-button').onclick = function() {
    checkAnswer();
    loadNextQuestion();
};

document.getElementById('restart-button').onclick = function() {
    currentQuestion = 0;
    score = 0;
    quizStarted = false;
    document.getElementById('result').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
    exitFullScreen(); // Exit full-screen mode when restarting
};

// Add event listener for full-screen change
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
        
    }
});

function loadQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question').innerText = question.question;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    question.answers.forEach((answer, index) => {
        answersDiv.innerHTML += `
            <div>
                <input type="radio" name="answer" value="${index}" id="answer${index}">
                <label for="answer${index}">${answer}</label>
            </div>
        `;
    });
    startTimer();
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up!");
            checkAnswer();
            loadNextQuestion();
        }
    }, 1000);
}

function checkAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const answerIndex = parseInt(selectedAnswer.value);
        if (answerIndex === questions[currentQuestion].correct) {
            score++;
        }
    }
}

function loadNextQuestion() {
    currentQuestion++;
    clearInterval(timer);
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    exitFullScreen(); // Exit full-screen mode
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('score').innerText = score + "/" + questions.length;
}

function enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}