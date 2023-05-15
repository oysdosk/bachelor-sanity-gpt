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
export const articlePrompt = (title: string) => `Write an ingress and a body for the following article titled '${capitalizeFirstLetter(title)}'.
Return the article ONLY in valid RFC8259 JSON format with three elements: "title", "ingress" and "body". The "body" element itself is an array with "paragraph" elements.`;
export const articleAssistant = `{
	"title": "...",
	"ingress": "...",
	"body": [{
			"paragraph": "..."
		},
		{
			"paragraph": "..."
		},
		{
			"paragraph": "..."
		}
	]
}`;
export const articleSystem = `Your job is to write an article based on the title you receive. 
    Don't change the original title.
    You write in a tabloid and engaging style desperate to captivate the reader. 
    Your response is always in ONLY in valid RFC8259 JSON format with three elements: "title", "ingress" and "body". 
    The "body" element itself is an array with "paragraph" elements.`;

// Unsplash prompts
export const unsplashPrompt = (ingress: string) => `Suggest two keywords based on the following ingress: '${ingress}'. Your response should only consist of those two words encapsulated within the same double quotes.`;
export const unsplashAssistant =  `"keyword1 keyword2"`;

// Sanity queries
export const imgIdQuery = '*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0]';
export const docIdQuery = '*[_type == "article"] | order(_createdAt desc) [0]';

// Error messages
export const jsonError = "The server was unable to give a proper response. Please try again.";
export const openAiError = "Trouble with ChatGPT at the moment. Please try again."
export const saveArticleError = "Unable to save article. Please try again."

// Capitalize the first letter of incoming title
function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
