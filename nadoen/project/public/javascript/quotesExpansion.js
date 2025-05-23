function toggleClass(event) {
  event.preventDefault();

  const button = event.currentTarget;
  let container = button.previousElementSibling; // Get the element before the button

  // Ensure the correct container is selected (either a <ul> or a <section>)
  if (
    !container ||
    (!container.matches("ul") && !container.matches("section"))
  ) {
    return;
  }

  const listItems = container.querySelectorAll("li, .hidden-quote, .expanded"); // Select <li> and hidden quotes

  let hasHiddenQuotes = true;

  listItems.forEach((li) => {
    if (li.classList.contains("hidden-quote")) {
      li.classList.remove("hidden-quote");
      li.classList.add("expanded");
      hasHiddenQuotes = false;
    } else if (li.classList.contains("expanded")) {
      li.classList.remove("expanded");
      li.classList.add("hidden-quote");
    }
  });

  if (!hasHiddenQuotes){
      button.textContent = "Toon minder quotes"
    } else {
      button.textContent = "Toon alle quotes"
    }
}

// Apply to both pages
document.querySelectorAll(".toggle-quotes").forEach((button) => {
  button.addEventListener("click", toggleClass);
});
