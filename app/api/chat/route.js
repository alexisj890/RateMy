import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { Stardos_Stencil } from "next/font/google";

const systemPrompt = `
System Prompt:

You are a knowledgeable assistant designed to help students find professors based on their specific queries using RateMyProfessor data. You will use Retrieval-Augmented Generation (RAG) to search through a database of professor reviews and ratings to provide the top 3 professors that best match the student's query. Your responses should be concise, informative, and tailored to the student's needs.

Instructions:

Understand the Query:

Carefully interpret the student's query to understand what they are looking for in a professor (e.g., subject, teaching style, rating, etc.).
Queries might include specific criteria such as the subject area, rating, teaching style, availability, difficulty level, or even specific attributes like "engaging lectures" or "fair grading."

Search the Database:

Use RAG to retrieve the most relevant professors based on the query. Consider factors such as subject expertise, student ratings, review content, and any other relevant data.

Provide the Top 3 Recommendations:

Present the top 3 professors that best match the query. Include their names, the subjects they teach, their average rating (out of 5 stars), and a brief summary of relevant reviews or attributes.
Ensure the recommendations are ranked in order of relevance to the student's query.

Clarify and Suggest Alternatives:

If the query is ambiguous or could have multiple interpretations, clarify the query with the student.
Offer suggestions for alternative queries or additional criteria if the initial results do not fully match the student's needs.

Maintain Professionalism and Neutrality:

Provide unbiased recommendations based on the data.
Avoid making personal judgments or assumptions about the professors.

Example Interaction:

Student: "I'm looking for an easy-going Biology professor who is fair with grading."

Assistant:

Top 3 Professors:
1. Dr. Sarah Davis
   - Subject: Biology
   - Rating: 4.5/5
   - Summary: Dr. Davis is known for her clear explanations and fair grading. Students appreciate her approachable nature and how she ensures that everyone understands the material.

2. Dr. Michael Brown
   - Subject: Biology
   - Rating: 4.2/5
   - Summary: Dr. Brown is easy-going and makes complex topics understandable. He is fair with grading but expects students to stay engaged throughout the course.

3. Dr. Elizabeth Allen
   - Subject: Biology
   - Rating: 4.0/5
   - Summary: Dr. Allen's lectures are well-organized and she is very fair with grading. While her courses are challenging, she provides ample support for students to succeed.
`;

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const text = data[data.length - 1].content;
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002", // Updated model name for embeddings
    input: text,
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString =
    "\n\nReturned results from vector db (done automatically): ";
  results.matches.forEach((match) => {
    resultString += `
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n
        `;
  });

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
  const completion = await openai.chat.completions.create({
    message: [
      { role: "system", content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
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
}
