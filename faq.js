document.querySelectorAll('.faq-item h3').forEach(item => {
    item.addEventListener('click', () => {
        const faqItem = item.parentElement; // Get the parent faq-item
        faqItem.classList.toggle('active'); // Toggle the active class
        
        const answer = faqItem.querySelector('.faq-answer'); // Get the answer element
        
        // Adjust the max-height based on whether it's active
        if (faqItem.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px"; // Set max-height to scrollHeight
        } else {
            answer.style.maxHeight = "0"; // Reset max-height
        }
    });
});
