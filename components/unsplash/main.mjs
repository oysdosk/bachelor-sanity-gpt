import uploadUnsplashImage from './uploadUnsplashImage.mjs';

(async () => {
  const query = 'nature';
  const asset = await uploadUnsplashImage(query);

  console.log('Unsplash image asset:', asset);
})();