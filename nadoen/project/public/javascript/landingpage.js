document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelectorAll(".project");
  const noAccessMessage = document.createElement("div");
  noAccessMessage.classList.add("no-access");
  noAccessMessage.textContent = "Geen toegang";
  document.body.appendChild(noAccessMessage);

  projects.forEach((project) => {
    project.addEventListener("click", () => {
      if (project.dataset.project === "lotr") {
        window.location.href = "login";
      } else {
        noAccessMessage.style.display = "block";
        setTimeout(() => {
          noAccessMessage.style.display = "none";
        }, 2000);
      }
    });
  });
});
