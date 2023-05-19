import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fireEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, studioTheme } from '@sanity/ui';
import ChatGptPlugin from '../ChatGptPlugin';
import { Configuration, OpenAIApi } from "openai";

jest.mock('@sanity/client', () => ({
  createClient: jest.fn().mockReturnValue({
    fetch: jest.fn(),
    delete: jest.fn(),
  }),
}));

jest.mock('/Users/oysteindoskeland/Documents/OsloMet/Bachelor/Sanity-oys-2/sanity-test-2/components/unsplash/uploadUnsplashImage.mjs', () => jest.fn());

/*jest.mock('openai', () => ({
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createChatCompletion: jest.fn().mockResolvedValue({data: {choices: [{message: {content: ''}}]}}),
  })),
  Configuration: jest.fn(),
}));*/

jest.mock("openai", () => {
  return {
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {createChatCompletion: jest.fn()};
    }),
    Configuration: jest.fn(),
  };
});



describe('ChatGptPlugin', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  let openaiInstance;
  beforeEach(() => {
    openaiInstance = new OpenAIApi(new Configuration({
      organization: 'test-org-id',
      apiKey: 'test-api-key',
    }));
    jest.spyOn(openaiInstance, 'createChatCompletion'); 
  })

    

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={studioTheme}>
        <ChatGptPlugin />
      </ThemeProvider>
    );
  });

  it('calls OpenAI API when Create Titles button is clicked', async () => {
    // Arrange
    const { OpenAIApi } = require('openai'); 
    const openaiInstance = new OpenAIApi();

    render(
      <ThemeProvider theme={studioTheme}>
        <ChatGptPlugin />
      </ThemeProvider>
    );

    // Get the button element
    const button = screen.getByText(/Create titles/i);

    // Act
    userEvent.click(button);

    // Assert
    await waitFor(() => expect(openaiInstance.createChatCompletion).toHaveBeenCalled());
  });

  it('shows loading text when Create Titles button is clicked', async () => {
    // Arrange
    render(
      <ThemeProvider theme={studioTheme}>
        <ChatGptPlugin />
      </ThemeProvider>
    );

    // Get the button element
    const button = screen.getByText(/Create titles/i);

    // Act
    userEvent.click(button);

    // Assert
    expect(await screen.findByText(/Loading titles.../i)).toBeInTheDocument();
  });


})


describe('handleGenerateTitles', () => {
  let openaiInstance: any;
  let handleGenerateTitles: any;

  beforeEach(() => {
    openaiInstance = new OpenAIApi(new Configuration({
      organization: 'test-org-id',
      apiKey: 'test-api-key',
    }));

    const mockComponentInstance = {
      openai: openaiInstance,
      // Add other necessary state variables or methods used in handleGenerateTitles here...
    };
    
    handleGenerateTitles = ChatGptPlugin.prototype.handleGenerateTitles.bind(mockComponentInstance);
  });

  it('should call createChatCompletion', async () => {
    // Invoke the function
    await handleGenerateTitles();

    // Assert that the spy was called
    expect(openaiInstance.createChatCompletion).toHaveBeenCalled();
  });
});