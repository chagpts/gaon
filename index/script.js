const heroImage = document.getElementById("heroImage");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const maxScroll = 420;

  const progress = Math.min(scrollY / maxScroll, 1);

  const scale = 1 - progress * 0.22;
  const borderRadius = 0 + progress * 32;
  const width = 100 - progress * 18;

  heroImage.style.transform = `scale(${scale})`;
  heroImage.style.borderRadius = `${borderRadius}px`;
  heroImage.style.width = `${width}%`;
});
