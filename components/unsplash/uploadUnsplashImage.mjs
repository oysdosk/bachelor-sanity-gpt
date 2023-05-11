import { createClient } from '@sanity/client';


const client = createClient({
  projectId: `${process.env.SANITY_STUDIO_PROJECT_ID}`,
  dataset: `${process.env.SANITY_STUDIO_DATASET}`,
  apiVersion: new Date().toISOString().split('T')[0],
  token: `${process.env.SANITY_STUDIO_WRITE_ACCESS}`, 
  useCdn: false,
});
const unsplashAccessKey = `${process.env.SANITY_STUDIO_UNSPLASH_ACCESS_KEY}`;

async function downloadImageAsBuffer(url) {
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.statusText}`);
    }
  
    const imageDataArrayBuffer = await response.arrayBuffer();
    const blob = new Blob([imageDataArrayBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'unsplash-image.jpg', { type: 'image/jpeg' });
    return file;
  }

async function uploadUnsplashImage(query) {
  try {
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?client_id=${unsplashAccessKey}&query=${query}&per_page=1`,
    );
    const unsplashData = await unsplashResponse.json();

    if (unsplashData.results.length === 0) {
      throw new Error('No images found for the given query');
    }

    const imageUrl = unsplashData.results[0].urls.regular;
    const imageId = unsplashData.results[0].id;
    const caption = 'Photo by ' + unsplashData.results[0].user.name;
    console.log(caption);
    const description = unsplashData.results[0].description;
    console.log(description);
    
    const imageData = await downloadImageAsBuffer(imageUrl);

    const asset = await client.assets.upload('image', imageData, {
      filename: `${imageId}.jpg`,
      description: description
    });

    return {
      asset: asset,
      caption: caption
    }
  } 
  catch (error) {
    console.error('Error uploading Unsplash image:', error);
    throw error;
  }
}

export default uploadUnsplashImage;