export type ChatResponse = {
    message: string;
    citations: string[];
};

export type ChatAllMessage = {
    role: string;
    message: string;
    citations?: string[];
};


export interface Config {
    azure_subscription_key: string;
    azure_region: string;
}
