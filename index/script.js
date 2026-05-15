const mockupImages = document.querySelectorAll(".mockup img");

function animateMockupImages() {
  const windowHeight = window.innerHeight;

  mockupImages.forEach((image) => {
    const rect = image.getBoundingClientRect();

    const imageCenter = rect.top + rect.height / 2;
    const screenCenter = windowHeight / 2;

    const distance = Math.abs(screenCenter - imageCenter);
    const maxDistance = windowHeight * 0.75;

    const progress = 1 - Math.min(distance / maxDistance, 1);

    const scale = 0.75 + progress * 0.35;
    const opacity = 0.75 + progress * 0.25;

    image.style.transform = `scale(${scale})`;
    image.style.opacity = opacity;
  });
}

window.addEventListener("scroll", animateMockupImages);
window.addEventListener("resize", animateMockupImages);
window.addEventListener("load", animateMockupImages);

animateMockupImages();
