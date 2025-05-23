function boxSelector() {
    let character_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".character_choices");
    let movie_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".movie_choices");
    let like_button: HTMLElement | null = document.querySelector(".bi-hand-thumbs-up");
    let dislike_button: HTMLElement | null= document.querySelector(".bi-hand-thumbs-down");
    let character_id : HTMLInputElement | null= document.getElementById("profile_picture") as HTMLInputElement
    let movie_id : HTMLInputElement | null = document.getElementById("movie_id") as HTMLInputElement
    let quote_choice : HTMLInputElement | null = document.getElementById("quote_id") as HTMLInputElement
    let blacklist_reason : HTMLInputElement | null = document.getElementById("blacklist_reason") as HTMLInputElement

    let likeClicked: boolean = false;
    let dislikeClicked: boolean = false;

    quote_choice.value = "";
    movie_id.value = "";
    character_id.value = "";
    if(dislike_button || like_button) {
        like_button!.addEventListener("click", (e) => {
            if (!likeClicked || dislikeClicked) {
                quote_choice.value = "favorited"
                alert('Quote toegevoegd aan favorieten!');
                likeClicked = true;
                dislikeClicked = false;
                blacklist_reason.value = ""
            } else {
                quote_choice.value = "";
                alert('Quote terug verwijdert uit favorieten!');
                likeClicked = false;
            }
        })
        dislike_button!.addEventListener("click", (e) => {
            if (likeClicked || !dislikeClicked) {
                quote_choice.value = "blacklist"
                const reason = prompt('Geef hier de reden in waarom u de quote wilt blacklisten.') //deze check is omdat je op annuleren kunt drukken waardoor het null is.
                if (reason !== null) {
                    blacklist_reason.value = reason
                    alert("Quote toegvoegd aan de blacklist!")
                } else {
                    blacklist_reason.value = "U heeft geen reden ingegeven."
                }
                dislikeClicked = true;
                likeClicked = false;
            } else {
                blacklist_reason.value = "";
                quote_choice.value = ""
                alert('Quote terug verwijdert uit blackilist!');
                dislikeClicked = false;
            }
        })
    }

    console.log(character_choices, movie_choices)
    if (character_choices) {
        character_choices.forEach((option) => {
            option.addEventListener("click", () => {
                character_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
                character_id.value = option.getAttribute("name")!
            });
        });
    }

    if (movie_choices) {
        movie_choices.forEach((option) => {
            option.addEventListener("click", (e) => {
                movie_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
                movie_id.value = option.getAttribute("name")!
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    boxSelector();
});
