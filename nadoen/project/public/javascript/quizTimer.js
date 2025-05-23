document.addEventListener('DOMContentLoaded', function() {
    const timerElement = document.createElement('div');
    timerElement.id = 'quiz-timer';
    timerElement.classList.add('quiz-timer');
    
    let timeLeft = 30;
    timerElement.textContent = timeLeft;
    
    const quizContainer = document.querySelector('.quiz');
    quizContainer.appendChild(timerElement);
    
    const countdownTimer = setInterval(function() {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerElement.classList.add('time-warning');
        }
        if (timeLeft <= 5) {
            timerElement.classList.add('time-critical');
        }
        
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            timerElement.textContent = '0';
        }
    }, 1000);
});