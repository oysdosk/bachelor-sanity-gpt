import { useEffect } from "react";
import uploadUnsplashImage from "../unsplash/uploadUnsplashImage.mjs"; // replace with your actual function file
import client from "../api/sanity";

const useUnsplashQueryEffect = (
  unsplashQuery: string,
  setTitle: (value: string) => void,
  setIntroduction: (value: string) => void,
  setBody: (value: string) => void,
  setUnsplashQuery: (value: string) => void,
  setSavingArticle: (value: boolean) => void,
  setPostSuccess: (value: boolean) => void,
  setSaveArticleError: (value: boolean) => void,
  sanityProjectId: string,
  sanityDataset: string,
  sanityToken: string,
  title: string,
  introduction: string,
  body: string,
  imgIdQuery: string
) => {
  useEffect(() => {
    if (unsplashQuery === '') return;
    let mutations;

    (async () => {
      const unsplashResponse = await uploadUnsplashImage(unsplashQuery);
      
      if (unsplashResponse !== null) {
        const asset = unsplashResponse.asset;
        const caption = unsplashResponse.caption;
        setUnsplashQuery('');

        mutations = [{
          create: {
            _id: 'drafts.',
            _type: 'article',
            title: title,
            introduction: introduction,
            body: body,
            image: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id,
              },
              caption: caption,
              description: asset.description,
            }
          }
        }]
      }
      else{
        setUnsplashQuery('');

        mutations = [{
          create: {
            _id: 'drafts.',
            _type: 'article',
            title: title,
            introduction: introduction,
            body: body,
          }
        }]
      }

      const currentDate = new Date().toISOString().split('T')[0];   
      
      fetch(`https://${sanityProjectId}.api.sanity.io/v${currentDate}/data/mutate/${sanityDataset}`, {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${sanityToken}`
        },
        body: JSON.stringify({mutations})
      })
      .then(response => {
        setTitle('');
        setIntroduction('');
        setBody('');
        setUnsplashQuery('');
        setSavingArticle(false);
        setPostSuccess(true);
      })
      .catch(error => {
        console.error(error);

        client.fetch(imgIdQuery)
          .then(imageAsset => {
            client.delete(imageAsset._id)
              .then(res => {
                console.log('Image asset deleted', res)
              })
              .catch(err => {
                console.log('Error deleting image asset', err)
              })
          })
          .catch(err => {
            console.log('Error fetching image asset', err)
          })

        setUnsplashQuery('');
        setSaveArticleError(true);
        setSavingArticle(false);
      });
    })();
  }, [unsplashQuery]);
};

export default useUnsplashQueryEffect;