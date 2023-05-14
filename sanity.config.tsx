import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import {DashboardIcon} from '@sanity/icons'
import ChatGptPlugin from './components/category'


const chatGptTool = () => {
  return {
    title: 'Chat-GPT',
    name: 'chat-gpt-tool',
    icon: DashboardIcon,
    component: ChatGptPlugin,
  }
}

export default defineConfig({
  name: 'default',
  title: 'Sanity',

  projectId: `${process.env.SANITY_STUDIO_PROJECT_ID}`,
  dataset: `${process.env.SANITY_STUDIO_DATASET}`,

  plugins: [
    deskTool(),
    visionTool(),
    unsplashImageAsset(),
  ],

  tools: [chatGptTool()],

  schema: {
    types: schemaTypes,
  },
})