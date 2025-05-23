// Lijst van geblackliste quotes
let blacklistedQuotes = [
    { _id: "1", dialog: "We set out to save the Shire, Sam, and it has been saved. But not for me.", movie: "The Lord of the Rings: The Return of the King", character: "Frodo" },
    { _id: "2", dialog: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", movie: "The Lord of the Rings: The Two Towers", character: "Legolas" },
    { _id: "3", dialog: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.", movie: "The Lord of the Rings: The Fellowship of the Ring", character: "Gandalf" }
];

// Lijst van favoriete quotes
let favoriteQuotes = [];


document.addEventListener('DOMContentLoaded', function() {
    // Verwijder quotes van blacklist
    let removeIcons = document.querySelectorAll('.bi-x-circle-fill');
    
    for(let i = 0; i < removeIcons.length; i++) {
        removeIcons[i].addEventListener('click', function() {
            let quoteItem = this.closest('li');
            let quoteText = quoteItem.textContent.trim();
            
            // Verwijder uit array
            for(let j = 0; j < blacklistedQuotes.length; j++) {
                if(quoteText.includes(blacklistedQuotes[j].dialog)) {
                    blacklistedQuotes.splice(j, 1);
                    break;
                }
            }
            
            // Verwijder alleen quote
            let quoteList = quoteItem.parentElement;
            
            // Zoek reden
            let nextElement = quoteItem.nextElementSibling;
            let pencilIcon = null;
            let reasonItem = null;
            
            if(nextElement && nextElement.classList.contains('bi-pencil-square')) {
                pencilIcon = nextElement;
                reasonItem = pencilIcon.nextElementSibling;
            }
            
            // Verwijder de items
            quoteItem.remove();
            if(pencilIcon) pencilIcon.remove();
            if(reasonItem) reasonItem.remove();
            
            alert('Quote verwijdert!');
        });
    }
    
    // Voeg blacklist functie toe aan dislike knop
    function setupDislikeButton() {
        // Alleen op quiz pagina's
        if(window.location.pathname.includes('10-rounds') || 
           window.location.pathname.includes('sudden-death') || 
           window.location.pathname.includes('timed-quiz')) {
            
            let dislikeButton = document.querySelector('.bi-hand-thumbs-down');
            
            if(dislikeButton) {
                dislikeButton.addEventListener('click', function() {
                    // Haal de quote informatie op
                    let quoteElement = this.closest('h2');
                    let quoteText = quoteElement.textContent.trim();
                    let character = document.querySelector('figcaption').textContent.trim();
                    let movie = document.querySelector('.movie-title') ? document.querySelector('.movie-title').textContent.trim() : "Onbekende film";
                    // Nieuwe _id maken
                    let newId = "1";
                    if (blacklistedQuotes.length > 0) {
                        let highestId = 0;
                        for (let i = 0; i < blacklistedQuotes.length; i++) {
                            let idNum = parseInt(blacklistedQuotes[i]._id, 10);
                            if (idNum > highestId) {
                                highestId = idNum;
                            }
                        }
                        newId = (highestId + 1).toString();
                    }
                    // Quote toevoegen aan blacklist
                    blacklistedQuotes.push({
                        _id: newId,
                        dialog: quoteText,
                        movie: movie,
                        character: character
                    });
                    alert('Quote geblacklist!');
                });
            }
        }
    }
    
    setupDislikeButton();
    setupLikeButton();

    // Favorieten functionaliteit voor de favorites pagina (voorbeeld)
    // Gebruik deze functie op de favorites pagina om quotes te verwijderen
    function setupRemoveFavoriteButton() {
        let removeIcons = document.querySelectorAll('.remove-favorite');
        for(let i = 0; i < removeIcons.length; i++) {
            removeIcons[i].addEventListener('click', function() {
                let quoteItem = this.closest('li');
                let quoteText = quoteItem.textContent.trim();
                for(let j = 0; j < favoriteQuotes.length; j++) {
                    if(quoteText.includes(favoriteQuotes[j].dialog)) {
                        favoriteQuotes.splice(j, 1);
                        break;
                    }
                }
                quoteItem.remove();
                alert('Quote verwijderd uit favorieten!');
            });
        }
    }

    
    // setupRemoveFavoriteButton();

    // Like button functionaliteit - voeg toe aan favorieten
    function setupLikeButton() {
        // Alleen op quotes pagina's waar een like button is
        let likeButton = document.querySelector('.bi-hand-thumbs-up');
        if(likeButton) {
            likeButton.addEventListener('click', function() {
                let quoteElement = this.closest('h2');
                let quoteText = quoteElement.textContent.trim();
                let character = document.querySelector('figcaption').textContent.trim();
                let movie = document.querySelector('.movie-title') ? document.querySelector('.movie-title').textContent.trim() : "Onbekende film";
                // Controleer of deze quote al in favorieten zit
                let alreadyFavorite = favoriteQuotes.some(q => q.dialog === quoteText && q.character === character);
                if (alreadyFavorite) {
                    alert('Deze quote staat al in je favorieten!');
                    return;
                }
                // Nieuwe _id maken
                let newId = "1";
                if (favoriteQuotes.length > 0) {
                    let highestId = 0;
                    for (let i = 0; i < favoriteQuotes.length; i++) {
                        let idNum = parseInt(favoriteQuotes[i]._id, 10);
                        if (idNum > highestId) {
                            highestId = idNum;
                        }
                    }
                    newId = (highestId + 1).toString();
                }
                favoriteQuotes.push({
                    _id: newId,
                    dialog: quoteText,
                    movie: movie,
                    character: character
                });
                alert('Quote toegevoegd aan favorieten!');
            });
        }
    }


});