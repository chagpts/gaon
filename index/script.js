const heroImage = document.getElementById("heroImage");

if (heroImage) {
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const maxScroll = 420;

    const progress = Math.min(scrollY / maxScroll, 1);

    const borderRadius = 32 + progress * 12;

    heroImage.style.borderRadius = `${borderRadius}px`;
  });
}
