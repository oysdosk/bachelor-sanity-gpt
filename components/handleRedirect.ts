import client from '../api/sanity';
import * as literal from './literalConstants';

const handleRedirect = async (setPostSuccess: (value: boolean) => void) => {
  setPostSuccess(false);

  client
    .fetch(literal.docIdQuery)
    .then(data => {
      const articleId = data._id;
      console.log('Article ID: ' + articleId);
      console.log(`http://localhost:3333/desk/article;${articleId}`);
      window.location.href = `http://localhost:3333/desk/article;${articleId}`;
      //window.location.href = `https://sanity-oys-2.sanity.studio/desk/article;${articleId}`;
    })
    .catch(error => console.error(error));
};

export default handleRedirect;