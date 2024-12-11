import { createOptimizedPicture } from '../../scripts/aem.js';

function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('dynamic-card');

  const imgUrl = data.image.includes('/default')
    ? '../../icons/getinTouch.png'
    : data.image;
  const img = createOptimizedPicture(imgUrl, data.title || 'Image', false, [{ width: '750' }]);

  const header = document.createElement('h3');
  header.textContent = data.title;

  const description = document.createElement('p');
  description.textContent = data.description || 'No description available';

  const price = document.createElement('h3');
  price.textContent = data.price || 'No description available';

  const viewDetails = document.createElement('a');
  viewDetails.classList.add('view-details');
  viewDetails.href = data?.path ? `${data.path}` : '/';
  viewDetails.textContent = 'View Details';
  viewDetails.setAttribute('role', 'button'); // For accessibility
  viewDetails.setAttribute('tabindex', '0');

  card.append(img, header, viewDetails);
  return card;
}

async function fetchJsonData(jsonURL) {
  const resp = await fetch(jsonURL);
  if (!resp.ok) throw new Error(`Failed to fetch JSON from ${jsonURL}`);
  return resp.json();
}

function createCardsCarousel(data) {
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('dynamic-cards-carousel');

  const cardsWrapper = document.createElement('div');
  cardsWrapper.classList.add('dynamic-cards-wrapper');

  // Create card elements
  const cardElements = data.filter((idx) => idx.path.includes('/topsellers/')).map(createCard);

  cardsWrapper.append(...cardElements);

  // Create dots navigation
  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('carousel-dots');

  const totalCards = cardElements.length;
  const cardsPerView = 4;
  const totalViews = Math.ceil(totalCards / cardsPerView);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < totalViews; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active'); // first dot highlight

    // Add click event to scroll to the corresponding position
    dot.addEventListener('click', () => {
      cardsWrapper.scrollTo({
        left: i * cardsWrapper.clientWidth,
        behavior: 'smooth',
      });

      // Update active dot
      document.querySelectorAll('.carousel-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
    });

    dotsContainer.appendChild(dot);
  }

  carouselContainer.append(cardsWrapper, dotsContainer);
  return carouselContainer;
}

export default async function decorate(block) {
  const cardCarouselLink = block.querySelector('a[href$=".json"]');
  if (!cardCarouselLink) return;

  const parentDiv = document.createElement('div');
  parentDiv.classList.add('dynamic-card-block');

  try {
    const jsonURL = cardCarouselLink.href;
    const jsonData = await fetchJsonData(jsonURL);
    // Pass data to carousel creation
    const cardsCarousel = createCardsCarousel(jsonData.data);
    parentDiv.append(cardsCarousel);
    cardCarouselLink.replaceWith(parentDiv);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating dynamic card carousel block:', error);
  }
}
