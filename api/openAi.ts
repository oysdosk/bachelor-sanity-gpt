import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: `${process.env.SANITY_STUDIO_OPENAI_ORG_ID}`,
  apiKey: `${process.env.SANITY_STUDIO_OPENAI_API_KEY}`,   
});

export const openai = new OpenAIApi(configuration);