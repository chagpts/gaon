const scrollImages = document.querySelectorAll(".scroll-image");

function animateImagesOnScroll() {
  const windowHeight = window.innerHeight;

  scrollImages.forEach((image) => {
    const rect = image.getBoundingClientRect();

    const imageCenter = rect.top + rect.height / 2;
    const screenCenter = windowHeight / 2;

    const distance = Math.abs(screenCenter - imageCenter);
    const maxDistance = windowHeight * 0.75;

    const progress = 1 - Math.min(distance / maxDistance, 1);

    const scale = 0.86 + progress * 0.18;
    const opacity = 0.85 + progress * 0.15;

    image.style.transform = `scale(${scale})`;
    image.style.opacity = opacity;
  });
}

window.addEventListener("scroll", animateImagesOnScroll);
window.addEventListener("resize", animateImagesOnScroll);
window.addEventListener("load", animateImagesOnScroll);

animateImagesOnScroll();
