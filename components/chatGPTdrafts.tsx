import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";



const generateDrafts = (category: string) => {
    // API config
    const configuration = new Configuration({
        organization: 'org-TyXgxHtVwqteKe1cU3VSaW0E',
        apiKey: "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",   
      });
      const openai = new OpenAIApi(configuration);
    
      const prompt = `Suggest two titles for an article about ${category}.
      Return the titles on the following format (use single quotes): 'Title1', 'Title2'`
      
      // API prompt for titles
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

    return titles;
  
        for (let i = 0; i < titles.length; i++){
            const mutations = [{
              create: {
                _id: 'drafts.',
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
    }
}
      
  