import { useEffect } from "react";

const useArticleResponseEffect = (
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

    try{
      setJsonError(false);
      let responseObject = JSON.parse(articleResponse);
      let title = responseObject.title;
      let introduction = responseObject.introduction;
      let paragraphs = responseObject.body.map((body: { paragraph: any; }) => body.paragraph);
      let body = paragraphs.join('\n\n');
    
      setTitle(title);
      setIntroduction(introduction);
      setBody(body);

      setShowTopic(3);
      setRadio('');
    }
    catch (error) {
      console.error('Unable to parse JSON object.', error);
      setJsonError(true);
      setIntroduction('');
      setBody('');
    }
  }, [articleResponse, setTitle, setIntroduction, setBody, setShowTopic, setRadio, setLoadingArticle, setJsonError]);
};

export default useArticleResponseEffect;