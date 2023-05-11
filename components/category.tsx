import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Card,  TextArea, Flex, Text, Radio, Label, Stack } from '@sanity/ui';
import { Configuration, OpenAIApi } from "openai";
import uploadUnsplashImage from './unsplash/uploadUnsplashImage.mjs';

const sanityProjectId = `${process.env.SANITY_STUDIO_PROJECT_ID}`;
const sanityDataset = `${process.env.SANITY_STUDIO_DATASET}`;
const sanityToken = `${process.env.SANITY_STUDIO_WRITE_ACCESS}`;
const apiUrl = `https://${sanityProjectId}.api.sanity.io/v1/data/query/${sanityDataset}`;
interface Props {
  onClose: () => void;
}

const ChatGptPlugin = (props: Props) => {
  // API config
  const configuration = new Configuration({
    organization: `${process.env.SANITY_STUDIO_OPENAI_ORG_ID}`,
    apiKey: `${process.env.SANITY_STUDIO_OPENAI_API_KEY}`,   
  });
  const openai = new OpenAIApi(configuration);

  // React hooks to hold values
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [showTopic, setShowTopic] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [title, setTitle] = useState('');
  const [ingress, setIngress] = useState('');
  const [body, setBody] = useState('');
  const [radio, setRadio] = useState('');
  const [query, setQuery] = useState('');
  const [transactionId, setTransactionId] = useState(null);

  const handleChange = (event) => {
    setRadio(event.currentTarget.value);
  };

  let titlesSplit = Array(5);
  const currentDate = new Date().toISOString().split('T')[0];
  
  const [titles, setTitles] = useState(['', '', '','','']);

  const handleGenerateTitles = async () => {
    setLoadingTitle(true);
  
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
      titlesSplit = msg.split('$$$');
      console.log(titlesSplit);

      const newTitles = titles.map((t,  i) => {
        t = titlesSplit[i+1];
        console.log(t);
        return t;
      }); 

      setTitles(newTitles);
      
      setLoadingTitle(false);
      setShowTopic(2);
    }
  }

  const handleGenerateArticle = async (title: string) => {
    setLoadingArticle(true);

    const articlePrompt = `Write an ingress and a body for the following article titled ${title}.
      Return the article ONLY in JSON format with three elements: title, ingress and body."`
    const articleSystem = `Your job is to write an article based on the title you receive. You write in a tabloid and engaging style desperate to captivate the reader.`

    // API prompt for titles
    openai.createChatCompletion({
      messages: [
      {role: 'user', content: articlePrompt},
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
      let title = msg.split(`\"title\": \"`).pop().split(`\",\n`)[0];
      let ingress = msg.split(`"ingress\": \"`).pop().split(`\",\n`)[0];
      let body = msg.split(`"body\": \"`).pop().split(`\" \n}`)[0].replace(/\\n/g, '\n').split(`\"\n}`)[0];

      console.log("TITTEL: " + title);
      console.log("INGRESS: " + ingress);
      console.log("BODY: " + body);
      
      setTitle(title);
      setIngress(ingress);
      setBody(body);
      setLoadingArticle(false);
      setShowTopic(3);
    }
  }

  const handleSaveArticle = async () => {
    setSavingArticle(true);  
    const queryPrompt = `Suggest two keywords based on the following ingress: '${ingress}'. Your response should only consist of those two words encapsulated within the same double quotes.`
    const queryAssistant =  `"keyword1 keyword2"`;
    
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
    if (query === '') return;
    let mutations;

    (async () => {
      console.log(query);
      const unsplashResponse = (await uploadUnsplashImage(query));
      console.log(unsplashResponse);
      
      if (unsplashResponse !== null){
        const asset = unsplashResponse.asset;
        const caption = unsplashResponse.caption;
        console.log(caption);
        console.log(asset.description);
        setQuery('');

        mutations = [{
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
      }

      else{
        setQuery('');

        mutations = [{
          create: {
            _id: 'drafts.',
            _type: 'article',
            title: title,
            ingress: ingress,
            body: body,
          }
        }]
      }

      fetch(`https://${sanityProjectId}.api.sanity.io/v${currentDate}/data/mutate/${sanityDataset}`, {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${sanityToken}`
        },
        body: JSON.stringify({mutations})
      })
      .then(response => {
        setTitle('');
        setIngress('');
        setBody('');
        setSavingArticle(false);
        return response.json();
      })
      .then(result => {
        setTransactionId(result.transactionId);
        console.log('Transaction ID: ' + result.transactionId)
      })
      .catch(error => console.error(error))
    })();
  }, [query]);

if (transactionId !== null){
const idQuery = '*[_type == "article"] | order(_createdAt desc) [0]';
setTransactionId(null);

// Fetch last created document 
fetch(`${apiUrl}?query=${encodeURIComponent(idQuery)}`, {
  headers: { Authorization: `Bearer ${sanityToken}` }
})
  .then(response => response.json())
  .then(data => {
    const articleId = data.result._id;
    console.log('Article ID: ' + articleId);
    console.log(`http://localhost:3333/desk/article;${articleId}`);
    window.location.href = `http://localhost:3333/desk/article;${articleId}`
  })
  .catch(error => console.error(error));
}

  return (
  <Box>
    <Box style={{ display : showTopic==1 ? "block" : "none" }}>
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text size={4}>CHATGPT ARTICLE GENERATOR</Text>
      </Card>
      <Card padding={4}>
        <TextArea id="inputTopic"
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
        <TextArea id="inputTitle"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setInputTitle(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          radius={3}
          placeholder="Give me a title ..."
          value={inputTitle}
        />
      </Card>
      <Card padding={4}>
        <Button onClick={(e:any) => handleGenerateArticle(inputTitle)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Create article"
          />
      </Card>
      <Card padding={4}>
        {loadingTitle && <h3>Loading titles...</h3>}
        {loadingArticle && <h3>Loading article...</h3>}
      </Card>
    </Box>
    <Box style={{ display : showTopic==2 ? "block" : "none" }}>
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text size={4}>GENERATED TITLES</Text>
      </Card>
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
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text size={4}>GENERATED ARTICLE</Text>
      </Card>
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