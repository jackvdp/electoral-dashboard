"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
    HandHelping,
    WandSparkles,
    BookOpenText,
    Send,
} from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const SuggestedQuestions = ({
    questions,
    onQuestionClick,
    isLoading,
}: {
    questions: string[];
    onQuestionClick: (question: string) => void;
    isLoading: boolean;
}) => {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-2 pl-10">
            {questions.map((question, index) => (
                <Button
                    key={index}
                    className="text-sm mb-2 mr-2 ml-0 text-gray-500 shadow-sm"
                    variant="outline"
                    size="sm"
                    onClick={() => onQuestionClick(question)}
                    disabled={isLoading}
                >
                    {question}
                </Button>
            ))}
        </div>
    );
};

const MessageContent = ({
    content,
    role,
}: {
    content: string;
    role: string;
}) => {
    const [thinking, setThinking] = useState(true);
    const [parsed, setParsed] = useState<{
        response?: string;
        thinking?: string;
        suggested_questions?: string[];
        debug?: {
            context_used: boolean;
        };
    }>({});
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!content || role !== "assistant") return;

        const timer = setTimeout(() => {
            setError(true);
            setThinking(false);
        }, 30000);

        try {
            const result = JSON.parse(content);
            console.log("🔍 Parsed Result:", result);

            if (
                result.response &&
                result.response.length > 0 &&
                result.response !== "..."
            ) {
                setParsed(result);
                setThinking(false);
                clearTimeout(timer);
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
            setError(true);
            setThinking(false);
        }

        return () => clearTimeout(timer);
    }, [content, role]);

    if (thinking && role === "assistant") {
        return (
            <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                <span>Thinking...</span>
            </div>
        );
    }

    if (error && !parsed.response) {
        return <div>Something went wrong. Please try again.</div>;
    }

    return (
        <>
            <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                {parsed.response || content}
            </ReactMarkdown>
        </>
    );
};

interface Message {
    id: string;
    role: string;
    content: string;
}

function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement> | string,
    ) => {
        if (typeof event !== "string") {
            event.preventDefault();
        }
        setIsLoading(true);

        const userMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: typeof event === "string" ? event : input,
        };

        const placeholderMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: JSON.stringify({
                response: "",
                thinking: "AI is processing...",
                suggested_questions: [],
                debug: {
                    context_used: false,
                },
            }),
        };

        setMessages((prevMessages) => [
            ...prevMessages,
            userMessage,
            placeholderMessage,
        ]);
        setInput("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex] = {
                    id: data.id || crypto.randomUUID(),
                    role: "assistant",
                    content: JSON.stringify(data),
                };
                return newMessages;
            });
        } catch (error) {
            console.error("Error fetching chat response:", error);
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex] = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: JSON.stringify({
                        response: "Sorry, there was an error processing your request.",
                        thinking: "Error occurred",
                        suggested_questions: [],
                        debug: { context_used: false },
                    }),
                };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() !== "") {
                handleSubmit(e as any);
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.target;
        setInput(textarea.value);
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    };

    const handleSuggestedQuestionClick = (question: string) => {
        handleSubmit(question);
    };

    return (
        <Card className="flex-1 flex flex-col my-4 mr-4 ml-4">
            <CardContent className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
                            <h2 className="text-2xl font-semibold mb-8">
                                Electoral Awards Assistant
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <HandHelping className="text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        Ask me about the International Electoral Awards & Symposium
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <WandSparkles className="text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        Learn about award categories and submission process
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpenText className="text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        Get details about schedules and logistics
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div key={message.id}>
                                    <div
                                        className={`flex items-start ${message.role === "user" ? "justify-end" : ""
                                            } ${index === messages.length - 1 ? "animate-fade-in-up" : ""
                                            }`}
                                    >
                                        {message.role === "assistant" && (
                                            <Avatar className="w-8 h-8 mr-2 border">
                                                <AvatarFallback>AI</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={`p-3 rounded-md text-sm max-w-[65%] ${message.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted border"
                                                }`}
                                        >
                                            <MessageContent
                                                content={message.content}
                                                role={message.role}
                                            />
                                        </div>
                                    </div>
                                    {message.role === "assistant" && (
                                        <SuggestedQuestions
                                            questions={
                                                JSON.parse(message.content).suggested_questions || []
                                            }
                                            onQuestionClick={handleSuggestedQuestionClick}
                                            isLoading={isLoading}
                                        />
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} style={{ height: "1px" }} />
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full relative bg-background border rounded-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message here..."
                        disabled={isLoading}
                        className="resize-none min-h-[44px] bg-background border-0 p-3 rounded-xl shadow-none focus-visible:ring-0"
                        rows={1}
                    />
                    <div className="flex justify-between items-center p-3">
                        <Button
                            type="submit"
                            disabled={isLoading || input.trim() === ""}
                            className="gap-2 ml-auto"
                            size="sm"
                        >
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                            ) : (
                                <>
                                    Send Message
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardFooter>
        </Card>
    )
}

export default ChatArea;