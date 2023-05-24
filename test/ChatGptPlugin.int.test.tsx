import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, studioTheme } from '@sanity/ui';
import ChatGptPlugin from '../components/chatGPT/ChatGptPlugin';
import { Configuration, OpenAIApi } from "openai";
import * as literal from '../components/chatGPT/literalConstants';

jest.mock('@sanity/client', () => ({
  createClient: jest.fn().mockReturnValue({
    fetch: jest.fn(),
    delete: jest.fn(),
  }),
}));

/*const realUseState = React.useState;
const stubInitialState = ['Title1, Title2, Title3, Title4, Title5'];
jest.spyOn(React, 'useState').mockImplementationOnce(() => realUseState(stubInitialState))*/


jest.mock('../unsplash/uploadUnsplashImage.mjs', () => jest.fn());

const mockChatCompletion = jest.fn();
jest.mock('openai', () => {
  return {
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createChatCompletion: mockChatCompletion,
      };
    }),
    Configuration: jest.fn(),
  };
});

/*afterEach(() => {
    jest.resetAllMocks();
  });
  */
beforeEach(() => {
  render(
    <ThemeProvider theme={studioTheme}>
      <ChatGptPlugin />
    </ThemeProvider>
  );
});

describe('Generate titles', () => {

  test('Create titles success', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title1: 'Title 1',
                title2: 'Title 2',
                title3: 'Title 3',
                title4: 'Title 4',
                title5: 'Title 5',
              }),
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/generate-titles/i));

    // Checks if `Create  article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTopic` to activate `Create article` button
    await userEvent.type(screen.getByTestId('inTopic'), 'dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);

    /*await waitFor(() =>  {
      expect(screen.getByText(/GENERATED TITLES/i)).toBeInTheDocument;
      expect(screen.getByText(/Save article/i)).toBeInTheDocument;
      expect(screen.getByText(/GENERATED ARTICLE/i)).toBeInTheDocument;
      expect(screen.getByText(/Welcome to the article generator tool./i)).toBeInTheDocument;
    });*/

    await waitFor(() => {
      expect(screen.getByText(/Title 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 5/i)).toBeInTheDocument();
    });
  
    // Loading message not shown:
    expect(await screen.queryByText('Loading titles...')).not.toBeInTheDocument();
  });


  test('Create titles JSON parsing ERROR', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'NOT JSON',
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/generate-titles/i));

    // Checks if `Create  article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTopic` to activate `Create article` button
    await userEvent.type(screen.getByTestId('inTopic'), 'dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // JSON error shown and Loading not shown:
    await waitFor (() => {
      const jsonError = screen.queryAllByText(literal.jsonError);
      expect(jsonError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading titles...')).not.toBeInTheDocument();
    });
  });


  test('Create titles OpenAI ERROR', async () => {
    mockChatCompletion.mockRejectedValue(new Error('API error'));
    const button = await waitFor(() => screen.getByTestId(/generate-titles/i));

    // Checks if `Create  article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTopic` to activate `Create article` button
    await userEvent.type(screen.getByTestId('inTopic'), 'dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // OpenAI error shown and Loading not shown:
    const openAiError = await screen.queryAllByText(literal.openAiError);
    expect(openAiError.length).toBeGreaterThan(0);
    expect(await screen.queryByText('Loading titles...')).not.toBeInTheDocument();
  });
})

describe('Generate article 1', () => {
  test('Create article success 1', async () => {
    const mockArticleResponse = JSON.stringify({
      title: 'Test Title',
      ingress: 'Test Ingress',
      body: [{ paragraph: 'Test Body Paragraph 1' }, { paragraph: 'Test Body Paragraph 2' }]
    });
    mockChatCompletion.mockResolvedValue({ data: { choices: [{ message: { content: mockArticleResponse } }] } });
    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));

    // Checks if `Create  article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Create article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'Dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);

    await waitFor(() => {
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ingress')).toBeInTheDocument();
    //expect(screen.getByDisplayValue('Test Body Paragraph 1')).toBeInTheDocument();
    });
  
    // Loading message not shown:
    expect(await screen.queryByText('Loading article...')).not.toBeInTheDocument();
  });

  test('Create article JSON parsing ERROR', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'NOT JSON',
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));

    // Checks if `Generate article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Generate article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // JSON error shown and Loading not shown:
    await waitFor(() => {
      const jsonError = screen.queryAllByText(literal.jsonError);
      expect(jsonError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    })
  });

  test('Create article OpenAI ERROR', async () => {
    mockChatCompletion.mockRejectedValue(new Error('API error'));
    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));

    // Checks if `Generate article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Generate article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'dummy text');
  
    // Wait for the state update and component re-render
    
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // OpenAI error shown and Loading not shown:
    await waitFor (() => {
      const openAiError = screen.queryAllByText(literal.openAiError);
      expect(openAiError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    });
  });



})

describe('Try again titles', () => {
  test('Create titles success', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title1: 'Title 1',
                title2: 'Title 2',
                title3: 'Title 3',
                title4: 'Title 4',
                title5: 'Title 5',
              }),
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/titles-try-again/i));

    await userEvent.click(button);

    /*await waitFor(() =>  {
      expect(screen.getByText(/GENERATED TITLES/i)).toBeInTheDocument;
      expect(screen.getByText(/Save article/i)).toBeInTheDocument;
      expect(screen.getByText(/GENERATED ARTICLE/i)).toBeInTheDocument;
      expect(screen.getByText(/Welcome to the article generator tool./i)).toBeInTheDocument;
    });*/

    await waitFor(() => {
      expect(screen.getByText(/Title 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Title 5/i)).toBeInTheDocument();
    });
  
    // Loading message not shown:
    expect(await screen.queryByText('Loading titles...')).not.toBeInTheDocument();
  });


  test('Create titles JSON parsing ERROR', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'NOT JSON',
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/titles-try-again/i));

    await userEvent.click(button);
  
    // JSON error shown and Loading not shown:
    await waitFor (() => {
      const jsonError = screen.queryAllByText(literal.jsonError);
      expect(jsonError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading titles...')).not.toBeInTheDocument();
    });
  });


  test('Create titles OpenAI ERROR', async () => {
    mockChatCompletion.mockRejectedValue(new Error('API error'));
    const button = await waitFor(() => screen.getByTestId(/titles-try-again/i));

    await userEvent.click(button);
  
    // OpenAI error shown and Loading not shown:
    const openAiError = await screen.queryAllByText(literal.openAiError);
    expect(openAiError.length).toBeGreaterThan(0);
    expect(await screen.queryByText('Loading titles...')).not.toBeInTheDocument();
  });
})

/*describe('Generate article 2', () => {
  test('Create article success 2', async () => {
    const mockArticleResponse = JSON.stringify({
      title: 'Test Title',
      ingress: 'Test Ingress',
      body: [{ paragraph: 'Test Body Paragraph 1' }, { paragraph: 'Test Body Paragraph 2' }]
    });
    mockChatCompletion.mockResolvedValue({ data: { choices: [{ message: { content: mockArticleResponse } }] } });
    const button = await waitFor(() => screen.getByTestId(/generate-article-2/i));

    // Checks if `Create  article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Create article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'Dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);

    await waitFor(() => {
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ingress')).toBeInTheDocument();
    //expect(screen.getByDisplayValue('Test Body Paragraph 1')).toBeInTheDocument();
    });
  
    // Loading message not shown:
    expect(await screen.queryByText('Loading article...')).not.toBeInTheDocument();
  });

  test('Create article JSON parsing ERROR', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'NOT JSON',
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));

    // Checks if `Generate article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Generate article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'dummy text');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // JSON error shown and Loading not shown:
    await waitFor(() => {
      const jsonError = screen.queryAllByText(literal.jsonError);
      expect(jsonError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    })
  });

  test('Create article OpenAI ERROR', async () => {
    mockChatCompletion.mockRejectedValue(new Error('API error'));
    const button = await waitFor(() => screen.getByTestId(/generate-article-1/i));

    // Checks if `Generate article` button starts of as disabled
    expect(button).toBeDisabled();

    // Type into the `inTitle` to activate `Generate article` button
    await userEvent.type(screen.getByTestId('inTitle'), 'dummy text');
  
    // Wait for the state update and component re-render
    
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // OpenAI error shown and Loading not shown:
    await waitFor (() => {
      const openAiError = screen.queryAllByText(literal.openAiError);
      expect(openAiError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    });
})*/

describe('Try again article', () => {
  test('Create article success 2', async () => {
    const mockArticleResponse = JSON.stringify({
      title: 'Test Title',
      ingress: 'Test Ingress',
      body: [{ paragraph: 'Test Body Paragraph 1' }, { paragraph: 'Test Body Paragraph 2' }]
    });
    mockChatCompletion.mockResolvedValue({ data: { choices: [{ message: { content: mockArticleResponse } }] } });
    const button = await waitFor(() => screen.getByTestId(/article-try-again/i));

    // Forcing a value in the title field that was supposed to follow from previous view
    await userEvent.type(screen.getByTestId('title'), 'Dummy Title');
  
    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);

    await waitFor(() => {
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ingress')).toBeInTheDocument();
    //expect(screen.getByDisplayValue('Test Body Paragraph 1')).toBeInTheDocument();
    });
  
    // Loading message not shown:
    expect(await screen.queryByText('Loading article...')).not.toBeInTheDocument();
  });

  test('Empty title field', async () => {
    const button = await waitFor(() => screen.getByTestId(/article-try-again/i));
  
    // Forcing a value in the title field that was supposed to follow from previous view
    await userEvent.type(screen.getByTestId('title'), 'Dummy Title');

    // Wait for the state update and component re-render
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dummy Title')).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    // User removes suggested title without writing a replacement
    await userEvent.clear(screen.getByTestId('title'));

    // Button should be disabled
    await waitFor(() => expect(button).toBeDisabled());
  });

  test('Create article JSON parsing ERROR', async () => {
    mockChatCompletion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'NOT JSON',
            },
          },
        ],
      },
    });

    const button = await waitFor(() => screen.getByTestId(/article-try-again/i));
  
    // Forcing a value in the title field that was supposed to follow from previous view
    await userEvent.type(screen.getByTestId('title'), 'Dummy Title');

    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // JSON error shown and Loading not shown:
    await waitFor(() => {
      const jsonError = screen.queryAllByText(literal.jsonError);
      expect(jsonError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    })
  });

  test('Create article OpenAI ERROR', async () => {
    mockChatCompletion.mockRejectedValue(new Error('API error'));
    const button = await waitFor(() => screen.getByTestId(/article-try-again/i));
  
    // Forcing a value in the title field that was supposed to follow from previous view
    await userEvent.type(screen.getByTestId('title'), 'Dummy Title');

    // Wait for the state update and component re-render
    expect(button).toBeEnabled();

    await userEvent.click(button);
  
    // OpenAI error shown and Loading not shown:
    await waitFor (() => {
      const openAiError = screen.queryAllByText(literal.openAiError);
      expect(openAiError.length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
    });
  });
})

describe('Save article', () => {
  
})




describe('Titles page', () => {
    const titlesMock = ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"];
    
    //jest.spyOn(React, 'useState').mockImplementation(() => [titlesMock, jest.fn()]);
    
    test('Create article success 2', async () => {
        // Arrange
        const mockArticleResponse = JSON.stringify({
            title: 'Test Title',
            ingress: 'Test Ingress',
            body: [{ paragraph: 'Test Body Paragraph 1' }, { paragraph: 'Test Body Paragraph 2' }]
        });
        mockChatCompletion.mockResolvedValue({ data: { choices: [{ message: { content: mockArticleResponse } }] } });


        //expect(screen.getByText('GENERATED TITLES')).toBeInTheDocument();

        expect(screen.getByTestId(/generate-article-2/i)).toBeDisabled();
        
        //Choose a radio button
        const radioButton = await waitFor(() => screen.getByTestId('radio'));
        radioButton.

        //await fireEvent.change(radioButton, { target: { value: "Dummy value" } });
        //expect(radioButton.value).toBe("Dummy value");
        
        
        await userEvent.click(radioButton);
        
        // Select an article style
        //await userEvent.selectOptions(screen.getByRole('combobox'), ['Informative']);
        const button = await waitFor(() => screen.getByTestId('generate-article-2')); // 
        expect(button).toBeEnabled()

        await userEvent.click(button);
        // Verify loadingArticle becomes true
        //expect(screen.getByText('Loading article...')).toBeInTheDocument();
    
        // Wait for loadingArticle to become false again
        //await waitForElementToBeRemoved(() => screen.queryByText('Loading article...'));

        // Verify rendered values
        expect(await screen.getByDisplayValue('Test Title')).toBeInTheDocument();
        expect(await screen.getByDisplayValue('Test Ingress')).toBeInTheDocument();
        //expect(await screen.getByDisplayValue('Test Body Paragraph 1\n\nTest Body Paragraph 2')).toBeInTheDocument();
        
        // Verify no json error
        //expect(await screen.queryByText(literal.jsonError)).not.toBeInTheDocument();
    });
})