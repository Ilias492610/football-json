function boxSelector() {
    var character_choices = document.querySelectorAll(".character_choices");
    var movie_choices = document.querySelectorAll(".movie_choices");
    var like_button = document.querySelector(".bi-hand-thumbs-up");
    var dislike_button = document.querySelector(".bi-hand-thumbs-down");
    var character_id = document.getElementById("profile_picture");
    var movie_id = document.getElementById("movie_id");
    var quote_choice = document.getElementById("quote_id");
    var blacklist_reason = document.getElementById("blacklist_reason");
    var likeClicked = false;
    var dislikeClicked = false;
    quote_choice.value = "";
    movie_id.value = "";
    character_id.value = "";
    if (dislike_button || like_button) {
        like_button.addEventListener("click", function (e) {
            if (!likeClicked || dislikeClicked) {
                quote_choice.value = "favorited";
                alert('Quote toegevoegd aan favorieten!');
                likeClicked = true;
                dislikeClicked = false;
                blacklist_reason.value = "";
            }
            else {
                quote_choice.value = "";
                alert('Quote terug verwijdert uit favorieten!');
                likeClicked = false;
            }
        });
        dislike_button.addEventListener("click", function (e) {
            if (likeClicked || !dislikeClicked) {
                quote_choice.value = "blacklist";
                var reason = prompt('Geef hier de reden in waarom u de quote wilt blacklisten.'); //deze check is omdat je op annuleren kunt drukken waardoor het null is.
                if (reason !== null) {
                    blacklist_reason.value = reason;
                    alert("Quote toegvoegd aan de blacklist!");
                }
                else {
                    blacklist_reason.value = "U heeft geen reden ingegeven.";
                }
                dislikeClicked = true;
                likeClicked = false;
            }
            else {
                blacklist_reason.value = "";
                quote_choice.value = "";
                alert('Quote terug verwijdert uit blackilist!');
                dislikeClicked = false;
            }
        });
    }
    console.log(character_choices, movie_choices);
    if (character_choices) {
        character_choices.forEach(function (option) {
            option.addEventListener("click", function () {
                character_choices.forEach(function (e) {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"));
                character_id.value = option.getAttribute("name");
            });
        });
    }
    if (movie_choices) {
        movie_choices.forEach(function (option) {
            option.addEventListener("click", function (e) {
                movie_choices.forEach(function (e) {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"));
                movie_id.value = option.getAttribute("name");
            });
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    boxSelector();
});
