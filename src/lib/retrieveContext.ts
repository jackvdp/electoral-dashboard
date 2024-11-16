
import { BedrockAgentRuntimeClient, RetrieveCommand, RetrieveCommandInput } from "@aws-sdk/client-bedrock-agent-runtime";

interface RAGSource {
    id: string;
    fileName: string;
    snippet: string;
    score: number;
}

const bedrockClient = new BedrockAgentRuntimeClient({
    region: process.env.BAWS_REGION!,
    credentials: {
        accessKeyId: process.env.BAWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.BAWS_SECRET_ACCESS_KEY!,
    },
});

export async function retrieveContext(
    query: string,
    knowledgeBaseId: string,
    n: number = 3
): Promise<{
    context: string;
    isRagWorking: boolean;
    ragSources: RAGSource[];
}> {
    try {
        const input: RetrieveCommandInput = {
            knowledgeBaseId: knowledgeBaseId,
            retrievalQuery: { text: query },
            retrievalConfiguration: {
                vectorSearchConfiguration: { numberOfResults: n },
            },
        };

        const command = new RetrieveCommand(input);
        const response = await bedrockClient.send(command);

        const rawResults = response?.retrievalResults || [];
        const ragSources: RAGSource[] = rawResults
            .filter((res: any) => res.content && res.content.text)
            .map((result: any, index: number) => {
                const uri = result?.location?.s3Location?.uri || "";
                const fileName = uri.split("/").pop() || `Source-${index}.txt`;
                return {
                    id: result.metadata?.["x-amz-bedrock-kb-chunk-id"] || `chunk-${index}`,
                    fileName: fileName.replace(/_/g, " ").replace(".txt", ""),
                    snippet: result.content?.text || "",
                    score: result.score || 0,
                };
            })
            .slice(0, 1);

        const context = rawResults
            .filter((res: any) => res.content && res.content.text)
            .map((res: any) => res.content.text)
            .join("\n\n");

        return {
            context,
            isRagWorking: true,
            ragSources,
        };
    } catch (error) {
        console.error("RAG Error:", error);
        return { context: "", isRagWorking: false, ragSources: [] };
    }
}