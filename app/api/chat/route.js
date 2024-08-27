import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = 
`
You are an AI assistant specialized in helping students find professors based on their specific needs and preferences. Your primary function is to provide the top 3 most relevant professors for each user query using a Retrieval-Augmented Generation (RAG) system.

Your knowledge base includes detailed information about professors, including:
- Teaching style and methods
- Course difficulty and workload
- Grading policies and fairness
- Areas of expertise and research interests
- Student reviews and ratings
- Availability for office hours and additional help
- Teaching experience and qualifications

For each user query, follow these steps:

1. Analyze the user's request, identifying key criteria and preferences.
2. Use the RAG system to retrieve relevant information from your knowledge base.
3. Evaluate and rank the professors based on how well they match the user's requirements.
4. Present the top 3 professors, providing a concise summary for each that includes:
   - Name and department
   - Key strengths relevant to the user's query
   - Overall rating (e.g., 4.5/5)
   - A brief quote from a student review

5. Offer to provide more detailed information about any of the suggested professors if the user requests it.

Remember to:
- Be objective and fair in your assessments
- Respect privacy by not sharing personal information about professors or students
- Encourage users to consider multiple factors when choosing a professor
- Remind users that experiences may vary and to use the information as a guide rather than an absolute truth

If a user's query is unclear or lacks specific criteria, ask follow-up questions to better understand their needs before providing recommendations.

Your goal is to help students make informed decisions about their course selections by matching them with professors who best fit their learning style and academic goals.
`


export async function POST(req) {
  try {
    const data = await req.json();

    // Validate request data
    if (!Array.isArray(data) || data.length === 0 || !data[data.length - 1]?.content) {
      return new NextResponse('Invalid request format', { status: 400 });
    }

    const lastMessage = data[data.length - 1];
    const text = lastMessage.content;

    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pc.index('rag').namespace('ns1');
    const openai = new OpenAI();

    // Get embeddings for the input text
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = embeddingResponse.data[0]?.embedding;

    if (!embedding) {
      throw new Error('Failed to get embedding');
    }

    // Query the Pinecone index
    const results = await index.query({
      topK: 3,
      includeMetadata: true,
      vector: embedding,
    });

    if (!results.matches || results.matches.length === 0) {
      throw new Error('No matches found');
    }

    // Construct result string
    let resultString = '\n\nReturned results from vector db (done automatically): ';
    results.matches.forEach((match) => {
      resultString += `
        Professor: ${match.id}
        Subject: ${match.metadata.subject}
        Rating: ${match.metadata.stars}/5
        Review: ${match.metadata.review}
        \n\n
      `;
    });

    // Create a chat completion
    const completionResponse = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...data.slice(0, data.length - 1),
        { role: 'user', content: lastMessage.content + resultString },
      ],
      model: 'gpt-4o-mini',
      stream: true,
    });

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completionResponse) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (err) {
    console.error('Error processing request:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}