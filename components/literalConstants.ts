
// Title generation prompts
export const titlePrompt = (prompt: string) => `Suggest five titles for an article about ${prompt}. 
Return the titles in valid RFC8259 JSON format`;
export const titleAssistant =  `{
 "title1": "The Dark Side of Chess: How Cheating is Damaging the Game",
 "title2": "Cheating in Chess: An Ongoing Battle for Fair Play",
 "title3": "Behind the Scenes of Chess Cheating Scandals",
 "title4": "Unmasking the Cheaters: How Chess is Fighting Back",
 "title5": "The Ethics of Chess: Exploring the Consequences of Cheating"
}`;
export const titleSystem = `You are a news editor looking for captivating titles for your articles. Your purpose here is to only answer with titles in valid RFC8259 JSON format.`;

// Article generation prompts
//export const articlePrompt = (title: string) => `Write an ingress and a body for the following article titled ${title}.`;
export const articlePrompt = (title: string) => `Write an ingress and a body for the following article titled ${title}.
    Return the article ONLY in valid RFC8259 JSON format with three elements: title, ingress and body. Do not add children elements inside any of the elements.`;
/*export const articleAssistant = `{
 "title": "...",
 "ingress": "...",
 "body": "..."
}`;*/
export const articleSystem = `Your job is to write an article based on the title you receive. You write in a tabloid and engaging style desperate to captivate the reader. 
    Your response is always in ONLY in valid RFC8259 JSON format with three elements: title, ingress and body. Do not add children elements inside any of the elements`;

// Save article prompts
export const queryPrompt = (ingress: string) => `Suggest two keywords based on the following ingress: '${ingress}'. Your response should only consist of those two words encapsulated within the same double quotes.`;
export const queryAssistant =  `"keyword1 keyword2"`;

// Error messages
export const jsonError = "The server was unable to give a proper response. Please try again.";
export const openAiError = "Oh no!! Problems with ChatGPT!"