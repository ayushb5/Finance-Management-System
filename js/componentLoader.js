import { initAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const components = document.querySelectorAll("[data-component]");

  const promises = [...components].map(async (component) => {
    const file = component.getAttribute("data-component");
    const response = await fetch(file);
    const html = await response.text();

    component.innerHTML = html;
  });

  await Promise.all(promises);

  updateNavbar();
  initAuth();
});
