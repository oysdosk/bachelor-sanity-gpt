import { client } from '../api/sanity';

// Get the Unsplash access key from environment variables
const unsplashAccessKey = `${process.env.SANITY_STUDIO_UNSPLASH_ACCESS_KEY}`;

// Function to download an image as a buffer
async function downloadImageAsBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching image: ${response.statusText}`);
  }

  // Convert the response data into an array buffer
  const imageDataArrayBuffer = await response.arrayBuffer();

  // Create a Blob from the array buffer
  const blob = new Blob([imageDataArrayBuffer], { type: 'image/jpeg' });

  // Create a File object from the Blob
  const file = new File([blob], 'unsplash-image.jpg', { type: 'image/jpeg' });

  return file;
}

// Function to search for an image on Unsplash and upload it to Sanity
async function uploadUnsplashImage(query) {
  try {
    // Fetch the image data from Unsplash
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?client_id=${unsplashAccessKey}&query=${query}&per_page=1`,
    );
    const unsplashData = await unsplashResponse.json();

    // If no results were returned, log an error and return null
    if (unsplashData.results.length === 0) {
      console.log(new Error('No images found for the given query'));
      return null;
    }

    // Get the URL, ID, caption, and description of the first result
    const imageUrl = unsplashData.results[0].urls.regular;
    const imageId = unsplashData.results[0].id;
    const caption = 'Photo by ' + unsplashData.results[0].user.name;
    const description = unsplashData.results[0].description;
    
    // Download the image as a buffer
    const imageData = await downloadImageAsBuffer(imageUrl);

    // Upload the image to Sanity
    const asset = await client.assets.upload('image', imageData, {
      filename: `${imageId}.jpg`,
      description: description
    });

    // Return the asset ID and the caption
    return {
      asset: asset,
      caption: caption
    };

  } 
  catch (error) {
    console.error('Error uploading Unsplash image:', error);
    throw error;
  }
}

export default uploadUnsplashImage;