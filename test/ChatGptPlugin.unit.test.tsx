import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, studioTheme } from '@sanity/ui';
import ChatGptPlugin from '../components/ChatGptPlugin';
import { Configuration, OpenAIApi } from "openai";
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as literal from '../components/literalConstants';

jest.mock('@sanity/client', () => ({
  createClient: jest.fn().mockReturnValue({
    fetch: jest.fn(),
    delete: jest.fn(),
  }),
}));

jest.mock('../../unsplash/uploadUnsplashImage.mjs', () => jest.fn());

/*const mockChatCompletion = jest.fn();
jest.mock('openai', () => {
  return {
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createChatCompletion: jest.fn().mockResolvedValue({
          data: {
            choices: [
              {
                message: {
                  content: {
                    title1: 'Title 1',
                    title2: 'Title 2',
                    title3: 'Title 3',
                    title4: 'Title 4',
                    title5: 'Title 5',
                  },
                },
              },
            ],
          },
        }),
      };
    }),
    Configuration: jest.fn(),
  };
});*/

beforeEach(() => {
  render(
    <ThemeProvider theme={studioTheme}>
      <ChatGptPlugin />
    </ThemeProvider>
  );
});
afterEach(() => {
  jest.resetAllMocks();
});

describe('Homepage', () => {

  it('shows loading text when Create Titles button is clicked', async () => {
    // Get the textarea element and type into it
    const textarea = screen.getByTestId('inTopic');
    userEvent.type(textarea, 'dummy text');
  
    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/generate-titles/i));
  
    // The button should now be enabled, so click it
    userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Loading titles...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });

  it('shows loading text when Generate Article button is clicked', async () => {
    // Get the textarea element and type into it
    const textarea = screen.getByTestId('inTitle');
    userEvent.type(textarea, 'dummy text');
  
    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));
  
    // The button should now be enabled, so click it
    await userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Loading article...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });
})

describe('TitlePage', () => {

  it('shows loading text when Try Again button is clicked', async () => {
    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/titles-try-again/i));
  
    // The button should now be enabled, so click it
    userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Loading titles...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });

  /*it('shows loading text when Generate Article button is clicked', async () => {
    // Get a radio button and select it
    const radio = screen.getByTestId('radio');
    userEvent.click(radio);

    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/generate-article-2/i));
  
    // The button should now be enabled, so click it
    userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Loading article...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });*/
})

describe('DraftPage', () => {

  it('shows loading text when Try Again button is clicked', async () => {
    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/article-try-again/i));
  
    // The button should now be enabled, so click it
    userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Loading article...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });

  it('shows loading text when Save Article button is clicked', async () => {
    // Wait for the state update and component re-render
    const button = await waitFor(() => screen.getByTestId(/save-article/i));
  
    // The button should now be enabled, so click it
    userEvent.click(button);
  
    // Wait for the loading text to show up in the document
    const loadingText = await screen.findAllByText('Saving article...');
  
    // Assert
    expect(loadingText.length).toBeGreaterThan(0);
  });

})