document.addEventListener("DOMContentLoaded", () => {
  const components = document.querySelectorAll("[data-component]");

  components.forEach(async (component) => {
    const file = component.getAttribute("data-component");
    const response = await fetch(file);
    const html = await response.text();

    component.innerHTML = html;
  });
});
