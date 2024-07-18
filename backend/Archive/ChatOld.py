import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.prompt_template import PromptTemplateConfig
from semantic_kernel.prompt_template.input_variable import InputVariable
from semantic_kernel.contents import ChatHistory
from dotenv import dotenv_values
# from quart import Quart, request, jsonify
# from quart_cors import cors, route_cors
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json

#region Initialise app
# app = Quart(__name__)
app = Flask(__name__)
cors = CORS(app, origins='*')
# app = cors(app, allow_origin="*")
#endregion

#region load environment variables
#Initialise credentials
secrets=dotenv_values(".env")
OPENAI_ENDPOINT = secrets["OPENAI_ENDPOINT"]
OPENAI_API_KEY = secrets["OPENAI_API_KEY"]
OPENAI_CHAT_DEPLOYMENT_NAME = secrets["OPENAI_CHAT_DEPLOYMENT_NAME"]
#endregion

#region Create Kernel and Add Services
kernel = sk.Kernel()


chat_service_id="azure_gpt35_chat_completion"
#Add services to kernel
kernel.add_service(
        
        service=AzureChatCompletion(
        service_id=chat_service_id,
        deployment_name=OPENAI_CHAT_DEPLOYMENT_NAME,
        endpoint=OPENAI_ENDPOINT,
        api_key=OPENAI_API_KEY,
        )
    )

#endregion

        
#region Chat Function Creation
# Define the request settings
req_settings = kernel.get_prompt_execution_settings_from_service_id(chat_service_id)
req_settings.max_tokens = 2000
req_settings.temperature = 0.7
req_settings.top_p = 0.8

prompt = """
        You are a chatbot that can have a conversations about any topic related to the provided context and history.
        Give explicit answers from the provided context or say 'I don't know' if it does not have an answer.
        Provided context: {{$db_record}}

        {{$history}}
        
        User: {{$query_term}}
        Chatbot:"""
        

chat_prompt_hist_template_config = PromptTemplateConfig(
        template=prompt,
        name="chat_with_history",
        template_format="semantic-kernel",
        input_variables=[
            InputVariable(name="db_record", description="The database record", is_required=True),
            InputVariable(name="query_term", description="The user input", is_required=True),
            InputVariable(name="history", description="The chat histroy", is_required=True),
        ],
        execution_settings=req_settings,
    )

chat_with_history_function = kernel.add_function(
        plugin_name="ChatBot",
        function_name="Chat",
        prompt=prompt,
        prompt_template_config=chat_prompt_hist_template_config
    )

####THIS WILL NEED TO BE DONE THROUGH SESSION_STATE
chat_history = ChatHistory()
chat_history.add_system_message("You are a helpful chatbot that can politely and professionally assist with searching for information in documents.")

#endregion


@cross_origin()
@app.route('/api/chat', methods=['POST'])
async def chat():
    from semantic_kernel.functions import KernelArguments
    from backend.Archive.SearchApp import Search
    import asyncio
    query_term = request.json['message']

     #region reset memory
    if query_term == "Clear Chat":
        memory = SemanticTextMemory(storage=VolatileMemoryStore(), embeddings_generator=embedding_gen)
        initialise_history(memory, memory_collection_id)
    #endregion
    
    chat_history.add_user_message(query_term) ####THIS WILL NEED TO BE DONE THROUGH SESSION_STATE
    # user_data = await request.get_json()
    # query_term = user_data['user_input']
    #AI Search with Semantic Ranker
    search_data = Search(query_term)
    
    #Provide context to Chat Model to answer query
    completions_result =  await kernel.invoke(
        chat_with_history_function, KernelArguments(query_term=query_term, db_record=search_data[0]["chunk"], history=chat_history)
    )
    
    chat_history.add_assistant_message(str(completions_result)) ####THIS WILL NEED TO BE DONE THROUGH SESSION_STATE

    response = {"message":str(completions_result)}
    return(response)

if __name__ == '__main__':
    app.run(host="127.0.0.1", port="5000")