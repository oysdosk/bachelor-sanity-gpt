import React, { useState } from 'react';
import { Box, Button, Select } from '@sanity/ui';
import { SanityDocument } from '@sanity/types';
import { Configuration, OpenAIApi } from "openai";
import CheckboxForm from './checkboxForm';
import checkboxModal from './checkboxModal'
import Modal from './checkboxModal';
import article from '../schemas/article';

/*
const configuration = new Configuration({
    organization: 'org-TyXgxHtVwqteKe1cU3VSaW0E',
    apiKey: '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',   
});
const openai = new OpenAIApi(configuration);

const prompt = 'Write two articles about food. The articles should consist of a title, an ingress and a body. Max 150 words per article'
const model = "gpt-3.5-turbo-0301";
const temperature = 0.8;
const maxTokens = 2048;

openai.createChatCompletion({
  messages: [
    {role: 'user', content: prompt}
  ],
  model: model,
  temperature: temperature,
  max_tokens: maxTokens,
})
.then(response => console.log(response))
.catch(error => console.error(error));
*/

interface Props {
  onClose: () => void;
}

const ChatGptPlugin = (props: Props) => {

  // State to hold the selected category
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    // API config
    const configuration = new Configuration({
      organization: 'org-TyXgxHtVwqteKe1cU3VSaW0E',
      apiKey: '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',   
    });
    const openai = new OpenAIApi(configuration);
  
    const prompt = `Suggest two titles for an article about ${category}.
    Return the titles on the following format (use single quotes): 'Title1', 'Title2'`
    
    // API promt for titles
    openai.createChatCompletion({
      messages: [
       {role: 'user', content: prompt}
      ],
      model: 'gpt-3.5-turbo-0301',
      temperature: 0.8,
      max_tokens: 2048,
    })
    .then(response => {
      console.log(response)
      const res = response.data.choices[0].message?.content;
      getTitles(res);
    })
    .catch(error => console.error(error));

    const getTitles = (msg) => {
        const removeLines = msg.replace("\n\n","");
        const titles = removeLines.split(", ");
        console.log(titles);

        for (let i = 0; i < titles.length; i++){
          const mutations = [{
            create: {
              _type: 'article',
              title: titles[i],
            }
          }]
        
        fetch(`https://9mm9d4oe.api.sanity.io/v2021-06-07/data/mutate/production`, {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer skJ78olbMh27rRg2cxOeeG1iyTPzukQiLhbcb99svE685auLmN1MgYb76uJUQFd3lQx99jKssgNoROjh8Gr1AGr7tGwQnYX718zYaEn3vHnYlmINT3AGr3DqszpQ4clmJb5j8MRDSjhVeZRKidQ1vnq5xDwaHekwCtYt5eS6d6iXA2mGYtEA`
          },
          body: JSON.stringify({mutations})
        })
          .then(response => response.json())
          .then(result => console.log(result))
          .catch(error => console.error(error))
      }
       
       
       /* // Map generated articles to Sanity document format
    const articles = titles.map((choice: { text: string }) => ({
      _type: 'article',
      title: choice.text.split('\n')[0],
      excerpt: choice.text.split('\n')[1],
      body: choice.text.split('\n').slice(2).join('\n'),
    }));

    // Create new documents in Sanity Studio with generated articles
    articles.forEach(async (article: SanityDocument) => {
      await fetch(`https://sanity-test-2.api.sanity.io`, { ///v1/documents
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SANITY_API_TOKEN}`, // Replace with your Sanity API token
        },
        body: JSON.stringify(article),
      });
    });*/


    }


    // Set loading state back to false and close the plugin
    setLoading(false);
    props.onClose();
  };

  return (
    <Box padding={4}>
      <h2>Select a category</h2>
      <Select
        value={category}
        onChange={(e) => setCategory(e.currentTarget.value)}>
          <option value ="Renovation">Renovation</option>
          <option value ="Food">Food</option>
          <option value ="Ice Hockey">Ice Hockey</option>
          <option value ="Jazz">Jazz</option>
      </Select>
      <Button disabled={!category || loading} onClick={handleGenerate}>
        {loading ? 'Generating...' : 'Generate'}
      </Button>
      <div id="checkBox"></div>
    </Box>
  );
};

export default ChatGptPlugin;







/* API call: Articles

const prompt_article = `Write two articles about ${category}. 
The articles should consist of a title, an ingress and a body. 
Max 150 words per article.
Start the first article with "Article 1", the second with "Article 2" and so on. 
Specify each time a new section ("Title", "Ingress" og "Body") occurs.
Always add a new line after each section.`


openai.createChatCompletion({
  messages: [
   {role: 'user', content: prompt}
  ],
  model: 'gpt-3.5-turbo-0301',
  temperature: 0.8,
  max_tokens: 2048,
})
.then(response => {
  console.log(response)
  const res = response.data.choices[0].message?.content;
  console.log(res)
})
.catch(error => console.error(error)); 
*/