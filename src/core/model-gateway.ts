export interface ModelGatewayConfig {
    provider: "ollama" | "openai" | "gemini";
    endpoint: string;
    modelName: string;
    apiKey?: string;
}

export interface ModelResponse {
    response: string;
}

export class ModelGateway {
    private readonly config: ModelGatewayConfig;

    constructor(config: ModelGatewayConfig) {
        this.config = config;
    }

    /**
     * Sends a prompt to the configured model provider and returns the text response.
     */
    async generate(prompt: string): Promise<string> {
        switch (this.config.provider) {
            case "ollama":
                return this.generateOllama(prompt);
            case "gemini":
                return this.generateGemini(prompt);
            case "openai":
                return this.generateOpenAI(prompt);
            default:
                throw new Error(`Unsupported provider: ${(this.config as any).provider}`);
        }
    }

    private async generateOllama(prompt: string): Promise<string> {
        const response = await fetch(`${this.config.endpoint}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.config.modelName,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText} (${response.status})`);
        }

        const data = (await response.json()) as { response: string };
        return data.response;
    }

    private async generateGemini(prompt: string): Promise<string> {
        // Standard Google Gemini API endpoint:
        // POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
        const url = `${this.config.endpoint}/v1beta/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini error: ${response.statusText} (${response.status})`);
        }

        const data = (await response.json()) as any;
        
        // Extract content from Gemini response structure
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error("Gemini response did not contain expected text part.");
        }
        
        return text;
    }

    private async generateOpenAI(prompt: string): Promise<string> {
        const response = await fetch(`${this.config.endpoint}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.config.apiKey ?? ""}`
            },
            body: JSON.stringify({
                model: this.config.modelName,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI error: ${response.statusText} (${response.status})`);
        }

        const data = (await response.json()) as any;
        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            throw new Error("OpenAI response did not contain expected chat completion message.");
        }

        return text;
    }
}
