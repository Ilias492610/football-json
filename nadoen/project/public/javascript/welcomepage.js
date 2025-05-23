document.addEventListener("DOMContentLoaded", () => {
  const infoButton = document.getElementById("info-button");
  const welcomeContainer = document.querySelector(".welcome-container");

  
  welcomeContainer.style.display = "block";
  
  
  infoButton.addEventListener("click", (e) => {
    e.preventDefault();
    welcomeContainer.scrollIntoView({ behavior: "smooth" });
  });
});