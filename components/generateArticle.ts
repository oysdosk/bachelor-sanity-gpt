import { configuration } from '../api/openAi';
import { OpenAIApi } from 'openai';
import * as literal from './literalConstants';

const generateArticle = async (
  title: string,
  style: string,
  setLoadingArticle: (value: boolean) => void,
  setJsonError: (value: boolean) => void,
  setArticleResponse: (value: string) => void,
  setOpenAiError: (value: boolean) => void
) => {

  const openai = new OpenAIApi(configuration)

  setLoadingArticle(true);
  setJsonError(false);
  setOpenAiError(false);

  // API prompt for article generation
  openai.createChatCompletion({
    messages: [
      {role: 'user', content: literal.articlePrompt(title)},
      {role: 'assistant', content: literal.articleAssistant},
      {role: 'system', content: `literal.articleSystem${style}`},
      {role: 'user', content: literal.articlePrompt(title)}
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    max_tokens: 2048,
  })
  // Update useState variable `articleResponse` to initiate useEffect hook
  .then(response => {
    const res = response.data.choices[0].message?.content || '';
    setArticleResponse(res);
  })
  // API request failed
  .catch(error => {
    setOpenAiError(true);
    setLoadingArticle(false);
    console.error(error);
  });
};

export default generateArticle;