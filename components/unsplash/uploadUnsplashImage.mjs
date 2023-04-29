//import fetch from 'node-fetch';
import sanityClient from '@sanity/client';
import { createClient } from '@sanity/client';


const client = createClient({
  projectId: '9mm9d4oe',
  dataset: 'production',
  token: 'sk8ANkrJ9EthuQbUNvXDbw4tgdWZQW1TM2VVJgkqZZL5Ck78KE3jyGPQQ7NGnNxo6uhbihb9nlNcR1JNWc7Ob3ThmxelcnUesXO2rzu88NvBvMy7yLbQSclYGrBJt195jT8XqhmgJ4lRf2rwXwop6axseITxTZwELrDeyo4cpboFdMH5VJZO', // Make sure you have the correct permissions to upload assets
  useCdn: false,
});


const unsplashAccessKey = 'TF4fmJTGOS4ZnMqNBz2qTc-LyPPddE_9BKcFNmCv-CI';

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
    console.log('Photo by ' + unsplashData.results[0].user.name);
    const description = unsplashData.results[0].description;
    

    const imageData = await downloadImageAsBuffer(imageUrl);

    const asset = await client.assets.upload('image', imageData, {
      filename: `${imageId}.jpg`,
    });

    return asset;
  } catch (error) {
    console.error('Error uploading Unsplash image:', error);
    throw error;
  }
}

export default uploadUnsplashImage;
