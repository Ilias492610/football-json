// Importeer Quote interface van types.ts
import { Quote } from '../../types';

// Lijst van geblackliste quotes
let blacklistedQuotes: Quote[] = [];

// Lijst van favoriete quotes
let favoriteQuotes: Quote[] = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verwijder quotes van blacklist
    let removeIcons: NodeListOf<Element> = document.querySelectorAll('.bi-x-circle-fill');
    
    for(let i: number = 0; i < removeIcons.length; i++) {
        removeIcons[i].addEventListener('click', function(this: Element) {
            let quoteItem: Element | null = this.closest('li');
            if (!quoteItem) return;
            
            let quoteText: string = quoteItem.textContent?.trim() || "";
            
            // Verwijder uit array
            for(let j: number = 0; j < blacklistedQuotes.length; j++) {
                if(quoteText.includes(blacklistedQuotes[j].dialog)) {
                    blacklistedQuotes.splice(j, 1);
                    break;
                }
            }
            
            // Verwijder alleen quote
            let quoteList: ParentNode | null = quoteItem.parentElement;
            
            // Zoek reden
            let nextElement: Element | null = quoteItem.nextElementSibling;
            let pencilIcon: Element | null = null;
            let reasonItem: Element | null = null;
            
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
    function setupDislikeButton(): void {
        // Alleen op quiz pagina's
        if(window.location.pathname.includes('10-rounds') || 
           window.location.pathname.includes('sudden-death') || 
           window.location.pathname.includes('timed-quiz')) {
            
            let dislikeButton: Element | null = document.querySelector('.bi-hand-thumbs-down');
            
            if(dislikeButton) {
                dislikeButton.addEventListener('click', function(this: Element) {
                    // Haal de quote informatie op
                    let quoteElement: Element | null = this.closest('h2');
                    if (!quoteElement) return;
                    
                    let quoteText: string = quoteElement.textContent?.trim() || "";
                    let character: string = document.querySelector('figcaption')?.textContent?.trim() || "";
                    let movie: string = document.querySelector('.movie-title') ? 
                        (document.querySelector('.movie-title')?.textContent?.trim() || "") : 
                        "Onbekende film";
                        
                    // Nieuwe _id maken
                    let newId: string = "1";
                    if (blacklistedQuotes.length > 0) {
                        let highestId: number = 0;
                        for (let i: number = 0; i < blacklistedQuotes.length; i++) {
                            let idNum: number = parseInt(blacklistedQuotes[i]._id, 10);
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
                        character: character,
                        id: "1"
                    });
                    alert('Quote geblacklist!');
                });
            }
        }
    }
    
    setupDislikeButton();
    setupLikeButton();

    // Favorieten functionaliteit voor de favorites pagina (voorbeeld)
    // Aan favorites pagina toevoegen??
    function setupRemoveFavoriteButton(): void {
        let removeIcons: NodeListOf<Element> = document.querySelectorAll('.remove-favorite');
        for(let i: number = 0; i < removeIcons.length; i++) {
            removeIcons[i].addEventListener('click', function(this: Element) {
                let quoteItem: Element | null = this.closest('li');
                if (!quoteItem) return;
                
                let quoteText: string = quoteItem.textContent?.trim() || "";
                for(let j: number = 0; j < favoriteQuotes.length; j++) {
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

    // Functie aanroepen aan favorites pagina?
    // setupRemoveFavoriteButton();

    // Like button functionaliteit - voeg toe aan favorieten
    function setupLikeButton(): void {
        // Alleen op quotes pagina's waar een like button is
        let likeButton: Element | null = document.querySelector('.bi-hand-thumbs-up');
        if(likeButton) {
            likeButton.addEventListener('click', function(this: Element) {
                let quoteElement: Element | null = this.closest('h2');
                if (!quoteElement) return;
                
                let quoteText: string = quoteElement.textContent?.trim() || "";
                let character: string = document.querySelector('figcaption')?.textContent?.trim() || "";
                let movie: string = document.querySelector('.movie-title') ? 
                    (document.querySelector('.movie-title')?.textContent?.trim() || "") : 
                    "Onbekende film";
                    
                // Controleer of deze quote al in favorieten zit
                let alreadyFavorite: boolean = favoriteQuotes.some(q => q.dialog === quoteText && q.character === character);
                if (alreadyFavorite) {
                    alert('Deze quote staat al in je favorieten!');
                    return;
                }
                // Nieuwe _id maken
                let newId: string = "1";
                if (favoriteQuotes.length > 0) {
                    let highestId: number = 0;
                    for (let i: number = 0; i < favoriteQuotes.length; i++) {
                        let idNum: number = parseInt(favoriteQuotes[i]._id, 10);
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
                    character: character,
                    id: "1"
                });
                alert('Quote toegevoegd aan favorieten!');
            });
        }
    }
});
