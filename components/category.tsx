import React, { useState, useCallback } from 'react';
import { Box, Button, Select,  Card,  TextArea, Inline, Checkbox, Flex, Text, Radio, Label, Stack } from '@sanity/ui';
import { Configuration, OpenAIApi } from "openai";
//import { Unsplash } from "./unsplash/unsplash.js";

interface Props {
  onClose: () => void;
}

const ChatGptPlugin = (props: Props) => {
  // API config
  const configuration = new Configuration({
    organization: 'org-TyXgxHtVwqteKe1cU3VSaW0E',
    apiKey: "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",   
  });
  const openai = new OpenAIApi(configuration);

  // State to hold the selected category
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [ingress, setIngress] = useState('');
  const [body, setBody] = useState('');
  const [radio, setRadio] = useState('a')

  const handleChange = useCallback((event) => {
    setRadio(event.currentTarget.value)
  }, [])

  let category = document.getElementById('input')?.innerHTML;
  let titlesSplit = Array(5);
  
  const [titles, setTitles] = useState(['', '', '','','']);

  const handleGenerateTitles = async () => {
    setLoading(true);
  
    //const systemPrompt = 'Whatever questions you receive, only respond with a list of titles.'
    const titlePrompt = `Suggest five titles for an article about ${value}. Separate each title only by a comma and space, and wrap them in single quotes.`
    const titleAssistant =  `Example: 'Title1', 'Title2', 'Title3', 'Title4', 'Title5'`;
    
    // API prompt for titles
    openai.createChatCompletion({
      messages: [
       {role: 'user', content: titlePrompt},
       {role: 'assistant', content: titleAssistant },
       //{role: 'system', content:systemPrompt}
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
      titlesSplit = removeLines.split(", ");
      for (let i = 0; i < titlesSplit.length; i++){
        console.log(titlesSplit[i]);
      }
      const newTitles = titles.map((t,  i) => {
        t = titlesSplit[i];
        console.log(t);
        return t;
      }); 

      setTitles(newTitles);
      setLoading(false);
      console.log(titles);

      



      // Set loading state back to false and close the plugin
      //props.onClose();
    }
  }


  const handleGenerateArticle = async () => {
    //let title = 
    const articlePrompt = `Write an ingress and a body for the following article titled ${title}.
      Prefix each section with a $ mark.`
    
      const articleResponse = `$Title: ... $Ingress: ... $Body: ...`

      // API prompt for titles
      openai.createChatCompletion({
        messages: [
        {role: 'user', content: articlePrompt},
        {role: 'assistant', content: articleResponse}
        ],
        model: 'gpt-3.5-turbo-0301',
        temperature: 0.8,
        max_tokens: 2048,
      })
      .then(response => {
        console.log(response)
        const res = response.data.choices[0].message?.content;
        getArticles(res);
      })
      .catch(error => console.error(error));

    const getArticles = async (msg) => {
      const removeLines = msg.replace("\n","");
      const articles = removeLines.split("$");
      const ingresses = [];
      const bodies = [];
      for (let i = 1; i < articles.length; i++){
        if ((i-2)%3 == 0) { ingresses.push(articles[i]); console.log(articles[i]) }
        if (i%3 == 0) { bodies.push(articles[i]); console.log(articles[i])}
      }
      console.log(articles);



      for (let i = 0; i < titles.length; i++){
        //const unsplash = new Unsplash('TF4fmJTGOS4ZnMqNBz2qTc-LyPPddE_9BKcFNmCv-CI');
        //await unsplash.getPhoto('file', titles[i]);

          const mutations = [{
            create: {
              _id: 'drafts.',
              _type: 'article',
              title: titles[i],
              ingress: ingresses[i],
              body: bodies[i],
              //image: `./images/${titles[i]}.jpg`
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




  return (
  <Box>
    <Box>
      <Card padding={4}>
        <TextArea id="input"
          fontSize={[2, 2, 3, 4]}
          onChange={(event) =>
            setPrompt(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          placeholder="TextArea"
          value={prompt}
        />
        <Button onClick={handleGenerateTitles}
        fontSize={[2, 2, 3]}
        //icon={AddIcon}
        mode="ghost"
        padding={[3, 3, 4]}
        text="Create"
      />
      </Card>
    </Box>
    <Box>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio1" style={{display: 'block'}} 
          //checked={radio === 'a'}
          name="foo"
          //onChange={handleChange}
          value={titles[0]}/>
          
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="radio1">{titles[0]}</label>
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio2" style={{display: 'block'}} 
          //checked={radio === 'b'}
          name="foo"
          //onChange={handleChange}
          value={titles[1]}/>
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="radio2">{titles[1]}</label>
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio3" style={{display: 'block'}} 
          //checked={radio === 'c'}
          name="foo"
          //onChange={handleChange}
          value={titles[2]}/>
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="radio3">{titles[2]}</label>
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio4" style={{display: 'block'}} 
          //checked={radio === 'd'}
          name="foo"
          //onChange={handleChange}
          value={titles[3]}/>
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="radio4">{titles[3]}</label>
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio5" style={{display: 'block'}} 
          //checked={radio === 'e'}
          name="foo"
          //onChange={handleChange}
          value={titles[4]}/>
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="radio5">{titles[4]}</label>
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card padding={4}>
      <Button onClick={handleGenerateTitles}
        fontSize={[2, 2, 3]}
        //icon={AddIcon}
        mode="ghost"
        padding={[3, 3, 4]}
        text="Try again"
      />
      </Card>
      <Card padding={4}>
        {loading && <h3>Loading ...</h3>}
      </Card>
      <Card padding={4}>
      <Button onClick={handleGenerateArticle}
        fontSize={[2, 2, 3]}
        //icon={AddIcon}
        mode="ghost"
        padding={[3, 3, 4]}
        text="Submit"
      />
      </Card>
  </Box>
  <Stack padding={4} space={[5,5,5,5]}>
  <Card>
        <Label size={4}>Title</Label>
      </Card>
    <Card>
        <TextArea id="title"
          fontSize={[2, 2, 3, 4]}
          onChange={(event) =>
            setTitle(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          value={title}
        />
      </Card>
      <Card>
        <Label size={4}>Ingress</Label>
      </Card>
      <Card>
        <TextArea id="ingress"
          fontSize={[2, 2, 3, 4]}
          onChange={(event) =>
            setIngress(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          value={ingress}
        />
      </Card>
      <Card>
        <Label size={4}>Body</Label>
      </Card>
      <Card>
        <TextArea id="body"
          fontSize={[2, 2, 3, 4]}
          onChange={(event) =>
            setBody(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          value={body}
        />
      </Card>
    </Stack>
  </Box>
  );
}


export default ChatGptPlugin;