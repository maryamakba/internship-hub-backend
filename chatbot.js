// const { GoogleGenAI } = require('@google/genai');  // Using require instead of import
// require("dotenv/config");  // Load environment variables from .env file

// async function main(prompt) {
//   const ai = new GoogleGenAI({
//     apiKey:`AIzaSyBsES2__qGyJQj-biG6Onel9Br1AbhlB3w`,  // Use the API key from the environment variables
//   });

//   const config = {
//     thinkingConfig: {
//       thinkingBudget: 0,
//     },
//     responseMimeType: 'text/plain',
//   };

//   const model = 'gemini-1.5-flash';
//   const contents = [
//     {
//       role: 'user',
//       parts: [
//         {
//           text: `You are a chat assistant for CUI internship hub. You can only answer questions related to internships. If asked any unrelated questions, say "I cannot answer that."`,
//         },
//       ],
//     },
//     {
//       role: 'model',
//       parts: [
//         {
//           text: `Okay, I'm ready to assist you with any questions you have regarding internships. Ask me anything related to finding, applying for, or succeeding in internships! I will do my best to provide helpful information. If your question is unrelated to internships, I won't be able to answer it.`,
//         },
//       ],
//     },
//     {
//       role: 'user',
//       parts: [
//         {
//           text: prompt,  // Use the user-provided prompt
//         },
//       ],
//     },
//   ];

//   let resultText = "";  // Variable to store the accumulated result

//   try {
//     const response = await ai.models.generateContentStream({
//       model,
//       config,
//       contents,
//     });

//     // Iterate through the response and accumulate the text output
//     for await (const chunk of response) {
//       resultText += chunk.text;  // Accumulate the chunk text
//     }

//     console.log(resultText);  // Log the final accumulated result

//   } catch (error) {
//     console.error('Error during content generation:', error);
//   }

//   return resultText;  // Return the final result text after all chunks are processed
// }

// // Export the main function for use in other files
// module.exports = main;  // Export the function for use in other files

// // You can call main() if you want to run it directly
// // Example:
// // main("What is the process to apply for internships?").then(console.log);


const { GoogleGenAI } = require('@google/genai');  // Using require for importing the module
require("dotenv/config");  // Load environment variables from .env file

async function main(prompt) {
  // Use API key from the environment variables for better security
  const apiKey = process.env.GENAI_API_KEY; 

  if (!apiKey) {
    console.error("API Key not found. Please set the GENAI_API_KEY environment variable.");
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,  // Use the API key from environment variable
  });

  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'text/plain',
  };

  const model = 'gemini-1.5-flash';  // Specify the model to use for the generation
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are a chat assistant for CUI internship hub. You can only answer questions related to internships. If asked any unrelated questions, say "I cannot answer that."`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: `Okay, I'm ready to assist you with any questions you have regarding internships. Ask me anything related to finding, applying for, or succeeding in internships! I will do my best to provide helpful information. If your question is unrelated to internships, I won't be able to answer it.`,
        },
      ],
    },
    {
      role: 'user',
      parts: [
        {
          text: prompt,  // Use the user-provided prompt
        },
      ],
    },
  ];

  let resultText = "";  // Variable to store the accumulated result

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Iterate through the response and accumulate the text output
    for await (const chunk of response) {
      resultText += chunk.text;  // Accumulate the chunk text
    }

  } catch (error) {
    console.error('Error during content generation:', error);
  }

  return resultText;  // Return the final result text after all chunks are processed
}

// Export the main function for use in other files
module.exports = main;  // Export the function for use in other files

// You can call main() if you want to run it directly
// Example:
// main("What is the process to apply for internships?").then(console.log);
