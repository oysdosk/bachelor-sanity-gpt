import { useEffect } from "react";

const useEffectArticleResponse = (
  articleResponse: string,
  setTitle: (value: string) => void,
  setIntroduction: (value: string) => void,
  setBody: (value: string) => void,
  setShowTopic: (value: number) => void,
  setRadio: (value: string) => void,
  setLoadingArticle: (value: boolean) => void,
  setJsonError: (value: boolean) => void
) => {
  useEffect(() => {
    if (articleResponse === '') return;
    setLoadingArticle(false);
    console.log(articleResponse);

    // Tries to convert to JSON and fill each part of the article into into their respective fields
    try{
      setJsonError(false);
      let responseObject = JSON.parse(articleResponse);
      let title = responseObject.title;
      let introduction = responseObject.introduction;
      // Adds two newlines between each paragraph inside the body
      let paragraphs = responseObject.body.map((body: { paragraph: any; }) => body.paragraph);
      let body = paragraphs.join('\n\n');
    
      setTitle(title);
      setIntroduction(introduction);
      setBody(body);

      setShowTopic(3);
      setRadio('');
    }
    // Unable to convert to JSON or map to `body` array
    catch (error) {
      setJsonError(true);
      setIntroduction('');
      setBody('');
      console.error('Unable to parse JSON object.', error);
    }
  }, [articleResponse, setTitle, setIntroduction, setBody, setShowTopic, setRadio, setLoadingArticle, setJsonError]);
};

export default useEffectArticleResponse;