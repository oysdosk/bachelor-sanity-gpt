// Sanity config
const clientInfo = {
  projectId: `${process.env.SANITY_STUDIO_PROJECT_ID}`,
  dataset: `${process.env.SANITY_STUDIO_DATASET}`,
  apiVersion: new Date().toISOString().split('T')[0],
  token: `${process.env.SANITY_STUDIO_WRITE_ACCESS}`, 
  useCdn: false,
}

export default clientInfo;