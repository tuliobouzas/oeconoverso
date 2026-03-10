function toggleMenu() {
  const links = document.getElementById("my-links");
  const burger = document.querySelector(".burger");

  if (links.style.display === "block") {
    links.style.display = "none";
    burger.classList.remove("activated");
  } else {
    links.style.display = "block";
    burger.classList.add("activated");
  }
}
