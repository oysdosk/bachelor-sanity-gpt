import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Select,  Card,  TextArea, Inline, Checkbox, Flex, Text, Radio, Label, Stack } from '@sanity/ui';
import { Configuration, OpenAIApi } from "openai";
import uploadUnsplashImage from './unsplash/uploadUnsplashImage.mjs';

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

  // React hooks to hold values
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [showTopic, setShowTopic] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [ingress, setIngress] = useState('');
  const [body, setBody] = useState('');
  const [radio, setRadio] = useState('');
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setRadio(event.currentTarget.value);
  };

  let titlesSplit = Array(5);
  
  const [titles, setTitles] = useState(['', '', '','','']);

  const handleGenerateTitles = async () => {
    setLoadingTitle(true);
  
    //const systemPrompt = 'Whatever questions you receive, only respond with a list of titles.'
    //const titlePrompt = `Suggest five titles for an article about ${prompt}. Separate each title only by a comma and space, and wrap them in single quotes.`
    //const titleAssistant =  `Example: 'Title1', 'Title2', 'Title3', 'Title4', 'Title5'`;
    const titlePrompt = `Suggest five titles for an article about ${prompt}. Separate each title only by a triple $ mark and a space. Important: Do not use any quotation marks around the titles.`
    const titleAssistant =  `Example: $$$Title1 $$$Title2 $$$Title3 $$$Title4 $$$Title5`;
    const titleSystem = `You are a news editor looking for captivating titles for your articles. Your purpose here is to only answer with titles. Important: Do not use any quotation marks around the titles.`
    
    // API prompt for titles
    openai.createChatCompletion({
      messages: [
       {role: 'user', content: titlePrompt},
       {role: 'assistant', content: titleAssistant },
       {role: 'user', content: titlePrompt},
       {role: 'system', content: titleSystem},
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
      //const removeLines = msg.replace("\n\n","");
      //titlesSplit = removeLines.split(", ");
      titlesSplit = msg.split('$$$');
      console.log(titlesSplit);
      for (let i = 0; i < titlesSplit.length; i++){
        //console.log(titlesSplit[i]);
      }
      const newTitles = titles.map((t,  i) => {
        t = titlesSplit[i+1];
        console.log(t);
        return t;
      }); 

      setTitles(newTitles);
      setLoadingTitle(false);
      setShowTopic(2);
      console.log(titles);
    }
    return true;
  }


  const handleGenerateArticle = async (title: string) => {
    setLoadingArticle(true);

    const articlePrompt = `Write an ingress and a body for the following article titled ${title}.
      Prefix each section (Title, Ingress and Body) with a triple $ mark.`
    const articleResponse = `$$$Title: '...'\n $$$Ingress: ...\n $$$Body: ...`
    const articleSystem = `Your job is to write an article based on the title you receive. You write in a tabloid and engaging style desperate to captivate the reader.`

    // API prompt for titles
    openai.createChatCompletion({
      messages: [
      {role: 'user', content: articlePrompt},
      {role: 'assistant', content: articleResponse},
      {role: 'system', content: articleSystem}
      ],
      model: 'gpt-3.5-turbo-0301',
      temperature: 0.8,
      max_tokens: 2048,
    })
    .then(response => {
      console.log(response)
      const res = response.data.choices[0].message?.content;
      getArticle(res);
    })
    .catch(error => console.error(error));

    const getArticle = async (msg) => {
      const removeLines = msg.replace("\n","");
      const article = removeLines.split("$$$");
      console.log(article);
      const ingress = article[2];
      const body = article[3];
      console.log(title);
      const cleanIngress = ingress.split('Ingress:').pop().split('Body')[0];
      const cleanBody = body.split('Body:').pop();


      /*const ingresses = [];
      const bodies = [];
      for (let i = 1; i < articles.length; i++){
        if ((i-2)%3 == 0) { ingresses.push(articles[i]); console.log(articles[i]) }
        if (i%3 == 0) { bodies.push(articles[i]); console.log(articles[i])}
      }*/
      
      console.log(article);

      setTitle(title);
      //setIngress(article[2]);
      setIngress(cleanIngress);
      setBody(cleanBody);
      //setBody(article[3]);
      setLoadingArticle(false);
      setShowTopic(3);
    }
  }

  const handleSaveArticle = async () => {
    
    setSavingArticle(true);  
    const queryPrompt = `Suggest two keywords based on the following ingress: ${ingress}. Your response should only consist of those two words.`
    const queryAssistant =  `keyword1 keyword2`;
    
    // API prompt for Unsplash query
    openai.createChatCompletion({
      messages: [
       {role: 'user', content: queryPrompt},
       {role: 'assistant', content: queryAssistant }
      ],
      model: 'gpt-3.5-turbo-0301',
      temperature: 0.8,
      max_tokens: 128,
    })
    .then(response => {
      console.log(response);
      const res = response.data.choices[0].message?.content;
      console.log(res);
      if (res != undefined) setQuery(res);
    })
    .catch(error => console.error(error));
  }
    useEffect(() => {

      (async () => {
        console.log(query);
        const asset = (await uploadUnsplashImage(query)).asset;
        const caption = (await uploadUnsplashImage(query)).caption;
        console.log(caption);
        console.log(asset.description);
  
      
        const mutations = [{
          create: {
            _id: 'drafts.',
            _type: 'article',
            title: title,
            ingress: ingress,
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
  
  
    fetch(`https://9mm9d4oe.api.sanity.io/v2021-06-07/data/mutate/production`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer skJ78olbMh27rRg2cxOeeG1iyTPzukQiLhbcb99svE685auLmN1MgYb76uJUQFd3lQx99jKssgNoROjh8Gr1AGr7tGwQnYX718zYaEn3vHnYlmINT3AGr3DqszpQ4clmJb5j8MRDSjhVeZRKidQ1vnq5xDwaHekwCtYt5eS6d6iXA2mGYtEA`
      },
      body: JSON.stringify({mutations})
    })
    .then(response => {
      response.json();
      setTitle('');
      setIngress('');
      setBody('');
      setSavingArticle(false);
    })
    .then(result => console.log(result))
    .catch(error => console.error(error))

    console.log('Unsplash image asset:', asset);
  })();
}, [query]);

  


  return (
  <Box>
    <Box style={{ display : showTopic==1 ? "block" : "none" }}>
      <Card padding={4}>
        <Text size={4}>ChatGPT Article Generator</Text>
      </Card>
      <Card padding={4}>
        <TextArea id="input"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setPrompt(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          radius={3}
          placeholder="Give me a topic ..."
          value={prompt}
        />
      </Card>
      <Card padding={4}>
        <Button onClick={handleGenerateTitles}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Create titles"
          />
      </Card>
      <Card padding={4}>
        {loadingTitle && <h3>Loading titles...</h3>}
      </Card>
    </Box>
    <Box style={{ display : showTopic==2 ? "block" : "none" }}>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio1" style={{display: 'block'}} 
          checked={radio === titles[0]}
          name="titles"
          onChange={handleChange}
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
          checked={radio === titles[1]}
          name="titles"
          onChange={handleChange}
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
          checked={radio === titles[2]}
          name="titles"
          onChange={handleChange}
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
          checked={radio === titles[3]}
          name="titles"
          onChange={handleChange}
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
          checked={radio === titles[4]}
          name="titles"
          onChange={handleChange}
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
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Try again"
        />
      </Card>
      <Card padding={4}>
        <Button onClick={(e:any) => handleGenerateArticle(radio)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Generate article"
        />
      </Card>
      <Card padding={4}>
        {loadingTitle && <h3>Loading titles...</h3>}
        {loadingArticle && <h3>Loading article...</h3>}
      </Card>
    </Box>
    <Stack padding={4} space={[5,5,5,5]} style={{ display : showTopic==3 ? "block" : "none" }}>
      <Card padding={4}>
        <Label size={4}>Title</Label>
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <TextArea id="title"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setTitle(event.currentTarget.value)
          }
          rows={2}
          padding={[3, 3, 4]}
          radius={3}
          value={title}
        />
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <Label size={4}>Ingress</Label>
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <TextArea id="ingress"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setIngress(event.currentTarget.value)
          }
          rows={5}
          padding={[3, 3, 4]}
          radius={3}
          value={ingress}
        />
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <Label size={4}>Body</Label>
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <TextArea id="body"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setBody(event.currentTarget.value)
          }
          rows={20}
          padding={[3, 3, 4,]}
          radius={3}
          value={body}
        />
      </Card>
      <Card padding={4}>
      <Button onClick={(e:any) => handleGenerateArticle(radio)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Try again"
        />
      </Card>
      <Card padding={4}>
        <Button onClick={(e:any) => handleSaveArticle()}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Save article"
        />
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        {savingArticle && <h3>Saving article...</h3>}
        {loadingArticle && <h3>Loading article...</h3>}
      </Card>
    </Stack>
  </Box>
);
}

export default ChatGptPlugin;