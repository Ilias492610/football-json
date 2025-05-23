document.addEventListener('DOMContentLoaded', function() {
    
    const thumbsUp = document.querySelector('.bi-hand-thumbs-up');
    const thumbsDown = document.querySelector('.bi-hand-thumbs-down');
    
     if(thumbsUp) {
        thumbsUp.addEventListener('click', function() { 
            if(this.classList.contains('bi-hand-thumbs-up-fill')) {
                this.classList.remove('bi-hand-thumbs-up-fill');
                this.classList.add('bi-hand-thumbs-up');
            } else {
                this.classList.remove('bi-hand-thumbs-up');
                this.classList.add('bi-hand-thumbs-up-fill');

                if(thumbsDown.classList.contains('bi-hand-thumbs-down-fill')) {
                    thumbsDown.classList.remove('bi-hand-thumbs-down-fill');
                    thumbsDown.classList.add('bi-hand-thumbs-down');
                }
            }
        });
    }
     
    if(thumbsDown) {
        thumbsDown.addEventListener('click', function() {
            
            if(this.classList.contains('bi-hand-thumbs-down-fill')) {
                this.classList.remove('bi-hand-thumbs-down-fill');
                this.classList.add('bi-hand-thumbs-down');
            } else {
                this.classList.remove('bi-hand-thumbs-down');
                this.classList.add('bi-hand-thumbs-down-fill');
                
                if(thumbsUp.classList.contains('bi-hand-thumbs-up-fill')) {
                    thumbsUp.classList.remove('bi-hand-thumbs-up-fill');
                    thumbsUp.classList.add('bi-hand-thumbs-up');
                }
            }
        });
    }
});