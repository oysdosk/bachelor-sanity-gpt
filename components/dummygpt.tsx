import React, { useState, useEffect } from 'react';
import { Box, Button, Card,  TextArea, Flex, Text, Radio, Label, Stack, Select} from '@sanity/ui';
import { createClient } from '@sanity/client';
import { Configuration, OpenAIApi } from "openai";
import * as literal from './literalConstants';
import uploadUnsplashImage from '../unsplash/uploadUnsplashImage.mjs';
import Spinner from './spinner.jsx';
import generateTitles from './generateTitles';
import generateArticle from './generateArticle';
import saveArticle from './saveArticle';
import handleRedirect from './handleRedirect';
import useArticleResponseEffect from './useEffectArticleResponse';
import useUnsplashQueryEffect from "./useEffectUnsplashQuery";

// Environment variables
const sanityProjectId = `${process.env.SANITY_STUDIO_PROJECT_ID}`;
const sanityDataset = `${process.env.SANITY_STUDIO_DATASET}`;
const sanityToken = `${process.env.SANITY_STUDIO_WRITE_ACCESS}`;

// Sanity Client config
const client = createClient({
  projectId: `${process.env.SANITY_STUDIO_PROJECT_ID}`,
  dataset: `${process.env.SANITY_STUDIO_DATASET}`,
  apiVersion: new Date().toISOString().split('T')[0],
  token: `${process.env.SANITY_STUDIO_WRITE_ACCESS}`, 
  useCdn: false,
});

const ChatGptPlugin = () => {
  
  // OpenAI API config
  const configuration = new Configuration({
    organization: `${process.env.SANITY_STUDIO_OPENAI_ORG_ID}`,
    apiKey: `${process.env.SANITY_STUDIO_OPENAI_API_KEY}`,   
  });
  const openai = new OpenAIApi(configuration);

  // React hooks to hold values
  const [showTopic, setShowTopic] = useState(1);
  const [inTopic, setInTopic] = useState('');
  const [inTitle, setInTitle] = useState('');
  const [radio, setRadio] = useState('');
  const [titles, setTitles] = useState(['', '', '','','']);
  const [articleResponse, setArticleResponse] = useState('');
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [body, setBody] = useState('');
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [jsonError, setJsonError] = useState(false);
  const [openAiError, setOpenAiError] = useState(false);
  const [saveArticleError, setSaveArticleError] = useState(false);
  const [style, setStyle] = useState('Tabloid');

  // Sets value of radio to selected radio button
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadio(event.currentTarget.value);
  };

  // Sets value of author style to selected dropdown item
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(event.currentTarget.value);
  };
  
  const handleGenerateTitles = async () => {
    generateTitles(inTopic, setLoadingTitle, setJsonError, setTitles, setShowTopic, setOpenAiError);
  }

  const handleGenerateArticle = async (title: string) => {
    generateArticle(title, style, setLoadingArticle, setJsonError, setArticleResponse, setOpenAiError);
  }

  const handleSaveArticle = async () => {
    saveArticle(introduction, setSavingArticle, setSaveArticleError, setUnsplashQuery);
  }

  // UseEffect hook for a successful article response from OpenAI API
  useArticleResponseEffect(articleResponse, setTitle, setIntroduction, setBody, setShowTopic, setRadio, setLoadingArticle, setJsonError);

  // UseEffect hook for saving article after getting Unsplash keywords from ChatGPT
  useUnsplashQueryEffect(unsplashQuery, setTitle, setIntroduction, setBody, setUnsplashQuery, setSavingArticle, setPostSuccess, setSaveArticleError,
     sanityProjectId, sanityDataset, sanityToken, title, introduction, body, literal.imgIdQuery);

  // Access and redirect to the last created article
  if (postSuccess){
    handleRedirect(setPostSuccess);
  }

  return (
  <Box id="container" sizing={'content'}>
    <Box style={{ display : showTopic==1 ? "block" : "none" }}>
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text align={'center'} size={4}>CHATGPT ARTICLE GENERATOR</Text>
      </Card>
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text align={'center'} size={4}>Welcome to the article generator tool. <br />
        Get started by either submitting a topic that you want some title suggestions for, or submitting a title that you want an article to be generated from
        </Text>
      </Card>
      <Card padding={4}>
        <TextArea id="inTopic" data-testid="inTopic"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setInTopic(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          radius={3}
          placeholder="Give me a topic ..."
          value={inTopic}
        />
      </Card>
      <Card padding={4}>
        <Button data-testid="generate-titles" disabled={loadingTitle || loadingArticle || inTopic === ''} onClick={handleGenerateTitles}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Create titles"
          />
      </Card>
      {loadingTitle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
          <h2 data-testid="loading-titles-1">Loading titles...</h2>
        </Card>
      ) : null}
      <Card padding={4}>
        <TextArea id="inTitle" data-testid="inTitle"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setInTitle(event.currentTarget.value)
          }
          padding={[3, 3, 4]}
          radius={3}
          placeholder="Give me a title ..."
          value={inTitle}
        />
      </Card>
      <Card padding={4}>
      <Text size={4}>Choose a style for your article</Text> 
      </Card>
      <Card padding={4}>
        <Stack>
          <Select
            fontSize={[2, 2, 3, 4]}
            padding={[3, 3, 4]}
            space={[3, 3, 4]}
            onChange={handleSelectChange}
          >
            <optgroup label="Author style">
              <option>Tabloid</option>
              <option>Informative</option>
              <option>Artistic</option>
              <option>Documentary</option>
            </optgroup>
          </Select>
        </Stack>
      </Card>
      <Card padding={4}>
        <Button data-testid="generate-article-1" disabled={loadingTitle || loadingArticle || inTitle === ''} 
          onClick={(e:any) => handleGenerateArticle(inTitle)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Generate article"
          />
      </Card>
      {loadingArticle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
          <h2>Loading article...</h2>
        </Card>
      ) : null}
      <Card padding={4}></Card>
      <Card padding={4}>
        {jsonError && <h2>{literal.jsonError}</h2>}
        {openAiError && <h2>{literal.openAiError}</h2>}
      </Card>
    </Box>
    <Box style={{ display : showTopic==2 ? "block" : "none" }}>
      <Card padding={4} margin={4} paddingBottom={0}>
        <Text size={4}>GENERATED TITLES</Text>
      </Card>
      <Card padding={4}>
        <Flex align="center">
          <Radio id="radio1" data-testid="radio" style={{display: 'block'}} 
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
        <Button data-testid="titles-try-again" disabled={loadingTitle || loadingArticle} onClick={handleGenerateTitles}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Try again"
        />
      </Card>
      {loadingTitle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
          {loadingTitle && <h2 data-testid="loading-titles-2">Loading titles...</h2>}
        </Card>
      ) : null}
      <Card padding={4}>
      <Text size={4}>Choose a style for your article</Text> 
      </Card>
      <Card padding={4}>
        <Stack>
          <Select
            fontSize={[2, 2, 3, 4]}
            padding={[3, 3, 4]}
            space={[3, 3, 4]}
            onChange={handleSelectChange}
          >
            <optgroup label="Author style">
              <option>Tabloid</option>
              <option>Informative</option>
              <option>Artistic</option>
              <option>Documentary</option>
            </optgroup>
          </Select>
        </Stack>
      </Card>
      <Card padding={4}>
        <Button data-testid="generate-article-2" disabled={loadingTitle || loadingArticle || radio === ''} onClick={(e:any) => handleGenerateArticle(radio)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Generate article"
        />
      </Card>
      {loadingArticle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
          {loadingArticle && <h2>Loading article...</h2>}
        </Card>
      ) : null}
      <Card padding={4}>
        {jsonError && <h2>{literal.jsonError}</h2>}
        {openAiError && <h2>{literal.openAiError}</h2>}
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
        <Label size={4}>introduction</Label>
      </Card>
      {loadingArticle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
        </Card>
      ) : null}
      <Card paddingBottom={4} paddingLeft={4}>
        <TextArea id="introduction"
          fontSize={[2, 2, 3, 3]}
          onChange={(event) =>
            setIntroduction(event.currentTarget.value)
          }
          rows={5}
          padding={[3, 3, 4]}
          radius={3}
          value={introduction}
        />
      </Card>
      <Card paddingBottom={4} paddingLeft={4}>
        <Label size={4}>Body</Label>
      </Card>
      {loadingArticle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
        </Card>
      ) : null}
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
      <Button data-testid="article-try-again" disabled={loadingArticle || savingArticle} onClick={(e:any) => handleGenerateArticle(title)}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Try again"
        />
      </Card>
      <Card padding={4}>
        <Button data-testid="save-article" disabled={loadingArticle || savingArticle} onClick={(e:any) => handleSaveArticle()}
          fontSize={[2, 2, 3]}
          mode="ghost"
          padding={[3, 3, 4]}
          radius={3}
          text="Save article"
        />
      </Card>
      {savingArticle ? (
        <Card paddingBottom={4} paddingLeft={4}>
          <Spinner/>
          {savingArticle && <h2>Saving article...</h2>}
        </Card>
      ) : null}
      <Card paddingBottom={4} paddingLeft={4}>
        {jsonError && <h2>{literal.jsonError}</h2>}
        {openAiError && <h2>{literal.openAiError}</h2>}
        {saveArticleError && <h2>{literal.saveArticleError}</h2>} 
        {loadingArticle && <h2>Loading article...</h2>}
      </Card>
    </Stack>
  </Box>
);
}

export default ChatGptPlugin;