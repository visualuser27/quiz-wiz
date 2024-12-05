// Function to load questions from localStorage
function loadQuestions() {
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';  // Clear the current list
    questions.forEach((question, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${question.question}</strong><br>
        Options: ${question.options.join(', ')}<br>
        Correct Answer: Option ${question.correctAnswer}
      `;
      questionsList.appendChild(li);
    });
  }

  // Function to handle form submission
  document.getElementById('question-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const questionText = document.getElementById('question').value;
    const options = Array.from(document.querySelectorAll('.option')).map(o => o.value);
    const correctAnswer = parseInt(document.getElementById('correct-answer').value);

    // Get questions from localStorage or initialize an empty array
    const questions = JSON.parse(localStorage.getItem('questions')) || [];

    // Add the new question to the list
    questions.push({ question: questionText, options, correctAnswer });

    // Save questions back to localStorage
    localStorage.setItem('questions', JSON.stringify(questions));

    // Clear the form
    document.getElementById('question-form').reset();

    // Reload the questions list
    loadQuestions();
  });

  // Load questions when the page loads
  window.onload = loadQuestions;

  // Quiz logic
  document.getElementById('start-quiz').addEventListener('click', function() {
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    let currentQuestionIndex = 0;
    let score = 0; // Track score

    // Show the first question
    showQuestion(questions[currentQuestionIndex]);

    // Function to display a question
    function showQuestion(question) {
      document.getElementById('quiz-question').textContent = question.question;
      const optionsDiv = document.getElementById('quiz-options');
      optionsDiv.innerHTML = ''; // Clear previous options
      question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="radio" name="option" value="${index + 1}"> ${option}
        `;
        optionsDiv.appendChild(label);
        optionsDiv.appendChild(document.createElement('br'));
      });
    }

    // Handle submit answer
    document.getElementById('submit-answer').addEventListener('click', function() {
      const selectedOption = document.querySelector('input[name="option"]:checked');
      if (selectedOption) {
        const isCorrect = parseInt(selectedOption.value) === questions[currentQuestionIndex].correctAnswer;
        document.getElementById('quiz-feedback').textContent = isCorrect ? 'Correct!' : 'Wrong answer.';

        // Update score
        if (isCorrect) {
          score++;
        }

        // Move to the next question
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          showQuestion(questions[currentQuestionIndex]);
        } else {
          document.getElementById('quiz-feedback').textContent = 'Quiz completed!';
          document.getElementById('quiz-score').textContent = `Your Score: ${score} / ${questions.length}`;
          document.getElementById('submit-answer').disabled = true; // Disable submit after quiz is done
        }
      } else {
        alert('Please select an option!');
      }
    });

    // Show the quiz container and hide the start button
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('start-quiz').style.display = 'none';
  });