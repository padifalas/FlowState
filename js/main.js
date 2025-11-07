
document.addEventListener("DOMContentLoaded", () => {
  const SCROLL_THRESHOLD = 400; 
  const btn = document.createElement("button");

  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.setAttribute("title", "Back to top");



  // relative path for svg so it works on github pages
  fetch("/FlowState/assets/back-to-top.svg")
    .then((res) => res.text())
    .then((svg) => {
      btn.innerHTML = svg;
      document.body.appendChild(btn);
    })
    .catch((err) => console.error("Error loading back-to-top.svg:", err));

 
  window.addEventListener("scroll", () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

 
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  });
});
