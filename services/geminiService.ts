import { GoogleGenAI, Type } from '@google/genai';

interface AgentPersona {
    personality: string;
    backstory: string;
    greeting: string;
}

// This function simulates a call to the Gemini API.
// In a real application, ensure process.env.API_KEY is configured.
export const generateAgentPersona = async (prompt: string, useCase: string): Promise<AgentPersona> => {
    // A real implementation would not create a new instance on every call
    // but this ensures the latest API key is used as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullPrompt = `Based on the following user description for an AI agent with the use case of "${useCase}", create a detailed persona for the agent. 
    The persona should be suitable for a voice-based interaction.
    Ensure the generated 'greeting' is contextually relevant to the specified use case. For example, a sales agent should have a more proactive and engaging greeting than a technical support agent.
    User Description: "${prompt}"`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            personality: {
                type: Type.STRING,
                description: "A short, descriptive summary of the agent's personality (e.g., 'Friendly and empathetic')."
            },
            backstory: {
                type: Type.STRING,
                description: "A brief backstory for the agent that informs its character."
            },
            greeting: {
                type: Type.STRING,
                description: "A standard opening greeting the agent will use when starting a conversation."
            }
        },
        required: ['personality', 'backstory', 'greeting']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        // Basic validation in case the response is not valid JSON
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText) as AgentPersona;
        } else {
             console.error("Received non-JSON response from Gemini:", jsonText);
             // Fallback to a default persona on failure
             return {
                personality: 'Default Persona',
                backstory: 'An error occurred while generating the backstory.',
                greeting: 'Hello, how can I help you today?'
             };
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // In case of an API error, return a default persona
        // This makes the UI more resilient.
        return {
            personality: 'Default Persona',
            backstory: 'An error occurred while generating the backstory.',
            greeting: 'Hello, how can I help you today?'
        };
    }
};

export const generateAgentAvatar = async (name: string, personality: string): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `A professional, friendly-looking avatar for a customer service agent named '${name}'. Personality: '${personality}'. Digital illustration, profile picture style, simple background.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating agent avatar:", error);
        return null;
    }
};

export const getChatResponse = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are a helpful, friendly, and knowledgeable assistant for Liveops UNITY, a platform for creating and managing AI voice agents. 
    Your goal is to answer questions about the platform's features (like the AI Agent HUB, Workflow Intelligence, Nerve Center, QA Simulation), benefits (like cost savings, quality, security), and the industries it serves (Healthcare, Insurance, Finance, etc.). 
    Keep your answers concise and informative. Do not go off-topic. If you don't know an answer, say so politely.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    }
};