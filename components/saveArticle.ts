import { configuration } from '../api/openAi';
import { OpenAIApi } from 'openai';
import * as literal from './literalConstants';

const saveArticle = async (
  introduction: string,
  setSavingArticle: (value: boolean) => void,
  setSaveArticleError: (value: boolean) => void,
  setUnsplashQuery: (value: string) => void
) => {
  const openai = new OpenAIApi(configuration);
  setSavingArticle(true);  
  setSaveArticleError(false);

  // API request to ChatGPT for keywords to prompt for Unsplash query
  openai.createChatCompletion({
    messages: [
      {role: 'user', content: literal.unsplashPrompt(introduction)},
      {role: 'assistant', content: literal.unsplashAssistant}
    ],
    model: 'gpt-3.5-turbo-0301',
    temperature: 0.3,
    max_tokens: 16,
  })
  // Update useState variable `unsplashQuery` to initiate useEffect hook
  .then(response => {
    const res = response.data.choices[0].message?.content;
    if (res !== undefined) setUnsplashQuery(res);
  })
  // API request failed
  .catch(error => {
    setUnsplashQuery('  ');    // Sends empty query to Unsplash
    console.error(error)
  });
};

export default saveArticle;