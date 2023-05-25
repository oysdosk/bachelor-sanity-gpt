import { Configuration } from 'openai';

// OpenAI API config
export const configuration = new Configuration({
    organization: `${process.env.SANITY_STUDIO_OPENAI_ORG_ID}`,
    apiKey: `${process.env.SANITY_STUDIO_OPENAI_API_KEY}`,   
  });