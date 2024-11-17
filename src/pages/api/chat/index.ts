// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { retrieveContext } from '@/lib/retrieveContext';
import { z } from "zod";
import crypto from "crypto";

// CONFIG
const knowledgeBaseId = "KGKPPZCYZW";
const claudeModel = "claude-3-5-sonnet-20241022";

// Define the schema for the AI response using Zod
const responseSchema = z.object({
    response: z.string(),
    thinking: z.string(),
    suggested_questions: z.array(z.string()),
    debug: z.object({
        context_used: z.boolean(),
    }),
});

// Helper function to sanitize and parse JSON
function sanitizeAndParseJSON(jsonString: string) {
    const sanitized = jsonString.replace(/(?<=:\s*")(.|\n)*?(?=")/g, match =>
        match.replace(/\n/g, "\\n")
    );

    try {
        return JSON.parse(sanitized);
    } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error("Invalid JSON response from AI");
    }
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an AI assistant for the International Electoral Awards & Symposium. Your role is to help users understand all aspects of the event, including the awards categories, submission process, schedule, and logistics. When responding to users, be professional, clear, and helpful.

To help answer questions, we have retrieved the following contextual information from our knowledge base:
{context}

Please follow these guidelines:
- Only provide information that is explicitly stated in the retrieved context
- If information isn't available in the context, politely say so
- Be precise with dates, times, and award categories
- For submission-related questions, reference the specific appendix where details can be found
- Keep responses concise but complete

To display your responses correctly, format them as a JSON object with this structure:
{
    "thinking": "Brief explanation of how you'll address the query using the available context",
    "response": "Your clear and helpful response to the user",
    "suggested_questions": [
        "What are the award categories?",
        "How do I submit a nomination?",
        "What is the event schedule?"
    ],
    "debug": {
        "context_used": true|false
    }
}`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;
        const latestMessage = messages[messages.length - 1].content;

        console.log("🔍 Initiating RAG retrieval for query:", latestMessage);
        const { context, isRagWorking, ragSources } = await retrieveContext(
            latestMessage,
            knowledgeBaseId
        );

        if (isRagWorking) {
            console.log("✅ RAG retrieval successful. Context:", context.slice(0, 100) + "...");
        } else {
            console.log(
                process.env.ANTHROPIC_API_KEY,
                process.env.BAWS_ACCESS_KEY_ID,
                process.env.BAWS_SECRET_ACCESS_KEY
            )
            console.warn("🚨 RAG Retrieval failed!");
        }

        const formattedMessages = messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
        }));

        formattedMessages.push({
            role: "assistant",
            content: "{",
        });

        const response = await anthropic.messages.create({
            model: claudeModel,
            max_tokens: 1000,
            messages: formattedMessages,
            system: systemPrompt.replace("{context}", isRagWorking ? context : "No information found for this query."),
            temperature: 0.5,
        });

        const textContent = "{" + response.content
            .filter((block): block is Anthropic.TextBlock => block.type === "text")
            .map(block => block.text)
            .join(" ");

        const parsedResponse = sanitizeAndParseJSON(textContent);
        const validatedResponse = responseSchema.parse(parsedResponse);

        const responseWithId = {
            id: crypto.randomUUID(),
            ...validatedResponse,
            ragSources
        };

        return res.status(200).json(responseWithId);

    } catch (error) {
        console.error('Error:', error);
        const errorResponse = {
            response: "Sorry, there was an issue processing your request. Please try again later.",
            thinking: "Error occurred during message generation.",
            suggested_questions: [],
            debug: { context_used: false }
        };
        return res.status(500).json(errorResponse);
    }
}