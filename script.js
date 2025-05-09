// Unsplash and Groq API Keys
const UNSPLASH_API_KEY = 'rNTCnVkwXWkPAi-kRT7kS6MdSmHfwKV9t8ldEcZR3fo';
const GROQ_API_URL = 'https://api.groq.com';

// DOM Elements
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const travelDescription = document.getElementById('travel-description');
const imageGallery = document.getElementById('image-gallery');
const imageDetails = document.getElementById('image-details');
const placeName = document.getElementById('place-name');
const placeCountry = document.getElementById('place-country');
const placeInfo = document.getElementById('place-info');
const downloadButton = document.getElementById('download-btn');
const shareButton = document.getElementById('share-btn');
const popover = document.getElementById('popover');

// Variables to store the image data
let currentImage = null;

// Event listener for the search button
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        // Clear gallery and description
        imageGallery.innerHTML = '';
        travelDescription.innerText = 'Loading images and descriptions...';

        // Fetch Groq description and Unsplash images
        const description = await getTravelDescription(query);
        const images = await getUnsplashImages(query);

        // Update UI with description and images
        travelDescription.innerText = description;
        renderImages(images);
    }
});

// Function to fetch a description from Groq API
async function getTravelDescription(query) {
    try {
        const response = await fetch(`${GROQ_API_URL}/generate?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.description || 'No description found for this destination.';
    } catch (error) {
        console.error('Error fetching description:', error);
        return 'Oops! Something went wrong with the description.';
    }
}

// Function to fetch images from Unsplash API
async function getUnsplashImages(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

// Function to render images in the gallery
function renderImages(images) {
    imageGallery.innerHTML = ''; // Clear previous images
    images.forEach((image) => {
        const imgElement = document.createElement('img');
        imgElement.src = image.urls.small;
        imgElement.alt = image.alt_description;
        imgElement.addEventListener('click', () => showImageDetails(image));
        imageGallery.appendChild(imgElement);
    });
}

// Function to show image details in the details section
function showImageDetails(image) {
    placeName.innerText = image.description || 'Unknown Place';
    placeCountry.innerText = `Location: ${image.location?.country || 'Unknown'}`;
    placeInfo.innerText = `Image by ${image.user.name}`;

    // Store the current image
    currentImage = image;

    // Show image details and popover with animation
    imageDetails.style.display = 'block';
    popover.style.display = 'block';
    setTimeout(() => {
        popover.style.opacity = 1;
    }, 300);
}

// Button actions for download and share

// Download functionality
downloadButton.addEventListener('click', () => {
    if (currentImage) {
        const imageUrl = currentImage.urls.full;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${currentImage.alt_description || 'image'}.jpg`; // Optional custom filename
        link.click();
    }
});

// Share functionality (Web Share API if available, fallback to copy link)
shareButton.addEventListener('click', () => {
    if (navigator.share) {
        // Web Share API: Share the image with the description and URL
        navigator.share({
            title: 'Travel Photo Explorer',
            text: `${placeName.innerText} - ${placeCountry.innerText}`,
            url: currentImage?.links?.html || window.location.href
        })
        .catch((error) => console.log('Error sharing image:', error));
    } else {
        // Fallback: Copy URL to clipboard
        const imageUrl = currentImage?.links?.html;
        if (imageUrl) {
            navigator.clipboard.writeText(imageUrl)
                .then(() => alert('Image URL copied to clipboard!'))
                .catch((err) => console.error('Failed to copy URL: ', err));
        } else {
            alert('No shareable URL available.');
        }
    }
});
