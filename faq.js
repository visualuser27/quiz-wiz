document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-item h3').forEach((question) => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling; // Get the answer (next sibling)
            
            // Toggle the 'active' class to show/hide the answer
            answer.classList.toggle('active');
            
            // Check the display status and change it accordingly
            if (answer.classList.contains('active')) {
                answer.style.display = 'block'; // Show answer
            } else {
                answer.style.display = 'none'; // Hide answer
            }
        });
    });
});
