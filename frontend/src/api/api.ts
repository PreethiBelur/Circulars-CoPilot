import { ChatResponse, Config } from "./model";

export async function askApi(request: ChatResponse): Promise<ChatResponse> {
    const response = await fetch(`http://127.0.0.1:5000/api/chat`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(request)
    });

    const parsedResponse: ChatResponse = await response.json();

    return parsedResponse as ChatResponse;
}

export async function clearChatBackend(request: ChatResponse){
    await fetch(`http://127.0.0.1:5000/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(request)
    }) 
}

export async function getSpeechConfig() : Promise<Config> {
    const url = "http://127.0.0.1:5000/api/config";
    const response = await fetch(url);
  
      const config: Config = await response.json();
      return config as Config;

  }
