import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, studioTheme } from '@sanity/ui';
import ChatGptPlugin from '../components/ChatGptPlugin';
import * as literal from '../components/literalConstants';

jest.mock('@sanity/client', () => ({
  createClient: jest.fn().mockReturnValue({
    fetch: jest.fn(),
    delete: jest.fn(),
  }),
}));

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
      introduction: 'Test introduction',
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
      expect(screen.getByDisplayValue('Test introduction')).toBeInTheDocument();
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

describe('Try again article', () => {
  test('Create article success 2', async () => {
    const mockArticleResponse = JSON.stringify({
      title: 'Test Title',
      introduction: 'Test introduction',
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
    expect(screen.getByDisplayValue('Test introduction')).toBeInTheDocument();
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