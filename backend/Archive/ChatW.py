#region ##### Load packages #####
import semantic_kernel as sk
import asyncio
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
 
from semantic_kernel.prompt_template import PromptTemplateConfig
from semantic_kernel.prompt_template.input_variable import InputVariable
 
from semantic_kernel.functions import KernelArguments
from semantic_kernel.contents import ChatHistory
 
from azure.core.credentials import AzureKeyCredential
 
from azure.search.documents import SearchClient
from azure.search.documents.models import QueryType, QueryCaptionType, QueryAnswerType, VectorizableTextQuery
 
 
 
 
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from dotenv import dotenv_values
 
#endregion
 
#region ##### Initialise app #####
app = Flask(__name__)
cors = CORS(app, origins='*')
#endregion
 
#region ###### Load environment variables #####
 
#Initialise credentials
secrets=dotenv_values(".env")
 
#OpenAI Credentials
OPENAI_ENDPOINT = secrets["OPENAI_ENDPOINT"]
OPENAI_API_KEY = secrets["OPENAI_API_KEY"]
OPENAI_CHAT_DEPLOYMENT_NAME = secrets["OPENAI_CHAT_DEPLOYMENT_NAME"]
OPENAI_EMBEDDING_DEPLOYMENT_NAME = secrets["OPENAI_EMBEDDING_DEPLOYMENT_NAME"]
AZURE_SUBSCRIPTION_KEY = secrets["AZURE_SUBSCRIPTION_KEY"] 
AZURE_REGION = secrets["AZURE_REGION"]
#endregion
 
#region ##### Create Kernel and Add Services #####
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
 
#region ##### Chat Function Creation #####
# Define the request settings
req_settings = kernel.get_prompt_execution_settings_from_service_id(chat_service_id)
req_settings.max_tokens = 4000
req_settings.temperature = 0.7
req_settings.top_p = 0.5
 
prompt = """
    You are a chatbot that can have a conversations about any topic related to the provided context and history, returning all relevant details of any questions asked.
    Give explicit answers from the provided context or say you don't know and require more information (e.g.'I don't know') if it does not have an answer or you are not sure.
   
    Each chunk in the provided context displays the Document_Name followed by colon and the actual information.
    The Document_Name is the citation that should be used for the information provided by that chunk.
    Don't list any other sources/citations that might appear in URL format.
   
    Display the citations as per the example below:
    _______________________________________________
    Chatbot:
    1st Fact/Paragraph[1]
    2nd Fact/Paragraph[2]
    3rd Fact/Paragraph[1][3][4]
   
    Citations:
    [1] Document_Name
    [2] Document_Name
    [3] Document_Name
    [4] Document_Name
    _______________________________________________
    Always include the citation for each fact you use in the response. If you have multiple facts you can return multiple paragraphs.
    Use square brackets to reference the unique citation ID, which you will assign, for the respective sources used in the response
   
    Don't combine citations, list each source separately.
    While you can reuse the unique citation IDs in your response, the Citations section should only have unique source names.
    Always include the Citations section as a part of your response. Citations IDs are numeric and always start from 1.
   
    Provided context: {{$db_record}}
 
    {{$history}}
   
    User: {{$query_term}}
    Chatbot:
   
    Citations:"""
       
 
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
 
##Add chat history
chat_history = ChatHistory()
chat_history.add_system_message("You are a helpful chatbot that can politely and professionally assist with searching for information in documents.")
#endregion
 
#region Generate Multiple Vector Queries Function Creation
search_prompt = """
    You are a chatbot that can generate multiple rephrased versions of the sentence you are supplied to optimize vector queries in document search.
    Always return your ouput in the format: ['Query 1', 'Query 2', .... etc]
    You will rephrase the sentence provided in the query term:
   
    User: {{$query_term}}
    Chatbot:"""
 
 
search_prompt_query_config = PromptTemplateConfig(
    template=search_prompt,
    name="generate_vector_queries",
    template_format="semantic-kernel",
    input_variables=[
        InputVariable(name="query_term", description="The user input", is_required=True),
    ],
    execution_settings=req_settings,
)
 
generate_vector_queries_function = kernel.add_function(
    plugin_name="VQCreation",
    function_name="Queries",
    prompt=search_prompt,
    prompt_template_config=search_prompt_query_config
)
#endregion
#region ##### Create AI Search function #####
 #Azure AI Search Credentials
AZURE_SEARCH_ENDPOINT = secrets["AZURE_SEARCH_ENDPOINT"]
AZURE_SEARCH_API_KEY = secrets["AZURE_SEARCH_API_KEY"]
AZURE_INDEX = secrets["AZURE_INDEX"]
 
AZURE_SEARCH_CREDENTIAL = AzureKeyCredential(AZURE_SEARCH_API_KEY)
search_client = SearchClient(AZURE_SEARCH_ENDPOINT, AZURE_INDEX, AZURE_SEARCH_CREDENTIAL)
   
def Search(query_term,
           vector_qs, search_client):
 
   
    #AI Search with Semantic Ranker
    search_result = search_client.search(
        search_text= query_term,
        vector_queries=vector_qs,
        query_type=QueryType.SEMANTIC,
        semantic_configuration_name='my-semantic-config',
        query_caption=QueryCaptionType.EXTRACTIVE,
        query_answer=QueryAnswerType.EXTRACTIVE,
        top=10,
        search_fields=["chunk"]
    )
    # print(query_term)
    # print(vector_qs)
    # print(search_result)
    # print([result for result in search_result])
   
    #Extract data from search result iterator object
    data = [{"document_id": result["id"],
            "document_name": result["title"],
             "chunk_id":result["chunk_id"],
             "chunk":result["chunk"],
             "search_score":result["@search.score"],
             "semantic_rank":result['@search.reranker_score'],
             "caption": result["@search.captions"],
             "chunk_links": result['links'],
             "document_links" : result['FullDocLinks']}
            for result in search_result]
   
    return(data)
#endregion
 
#region ##### Main API call #####
@cross_origin()
@app.route('/api/chat', methods=['POST'])
async def chat():
   
    #Get frontend input
    query_term = request.json['message']
   
    #Add frontend User Input to Chat History
    chat_history.add_user_message(query_term)
   
    generated_queries =  await kernel.invoke(
        generate_vector_queries_function, KernelArguments(query_term=query_term)
    )
    # print(1,generated_queries)
    vector_qs = [VectorizableTextQuery(text=query, k_nearest_neighbors=50, fields="vector", exhaustive=True) for query in generated_queries]
    # print(2,vector_qs)
    #AI Search with Semantic Ranker
    search_data = Search(query_term=query_term, vector_qs=vector_qs, search_client=search_client)
    # print(3,search_data[0])
    db_contents = "".join(['[[This Document_Name is ' + record["document_name"] + ' and should be provided as the only citation for this information:' +  record["chunk"] + ']]' for record in search_data])
    print(4,db_contents)
    #Provide context to Chat Model to answer query
    completions_result =  await kernel.invoke(
        chat_with_history_function, KernelArguments(query_term=query_term, db_record=db_contents, history=chat_history)
    )
    print(completions_result)
    #Add OpenAI response to Chat History
    chat_history.add_assistant_message(str(completions_result))
   
    #Format the output to be sent to frontend
    response = {"message":str(completions_result)}
   
    return(response)
 
@app.route('/api/config')
def get_config():
    return jsonify({
        'azure_subscription_key': AZURE_SUBSCRIPTION_KEY,
        'azure_region': AZURE_REGION
    })
#endregion
 
if __name__ == '__main__':
    app.run(host="127.0.0.1", port="5000", debug=True)