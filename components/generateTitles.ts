import { configuration } from '../api/openAi';
import { OpenAIApi } from 'openai';
import * as literal from './literalConstants';

const generateTitles = async (inTopic: string, 
    setLoadingTitle: (value: boolean) => void, 
    setJsonError: (value: boolean) => void, 
    setTitles: (value: string[]) => void, 
    setShowTopic: (value: number) => void, 
    setOpenAiError: (value: boolean) => void
) => {

  const openai = new OpenAIApi(configuration);
    
  setLoadingTitle(true);
  setJsonError(false);
  setOpenAiError(false);

  // API prompt for titles
  openai.createChatCompletion({
    messages: [
      {role: 'user', content: literal.titlePrompt(inTopic)},
      {role: 'assistant', content: literal.titleAssistant},
      {role: 'user', content: literal.titlePrompt(inTopic)},
      {role: 'system', content: literal.titleSystem},
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.9,
    max_tokens: 2048,
  })
  .then(response => {
    const res = response.data.choices[0].message?.content || '';
    // Tries to convert to JSON and map to `titles` array
    try {
      let responseObject = JSON.parse(res); 
      setTitles(Object.values(responseObject));
      setLoadingTitle(false);
      setShowTopic(2);
    // Unable to convert to JSON or map to `titles` array
    } catch (error) {
      console.error('Unable to parse JSON object.', error);
      setJsonError(true);
      setLoadingTitle(false);
    }
  })
  // API request failed
  .catch((error: any) => {
    setOpenAiError(true);
    setLoadingTitle(false);
    console.error(error);
  });  
};

export default generateTitles;