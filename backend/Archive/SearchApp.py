def Search(query_term):
    from azure.core.credentials import AzureKeyCredential
    from azure.search.documents import SearchClient
    from azure.search.documents.models import QueryType, QueryCaptionType, QueryAnswerType
    from dotenv import dotenv_values


    #Initialise credentials
    secrets=dotenv_values(".env")


    AZURE_SEARCH_ENDPOINT = secrets["AZURE_SEARCH_ENDPOINT"]
    AZURE_SEARCH_API_KEY = secrets["AZURE_SEARCH_API_KEY"]
    AZURE_INDEX = secrets["AZURE_INDEX"] #make sure this is updated if the CreateChunkedIndex.py script has been run

    AZURE_SEARCH_CREDENTIAL = AzureKeyCredential(AZURE_SEARCH_API_KEY)
    search_client = SearchClient(AZURE_SEARCH_ENDPOINT, AZURE_INDEX, AZURE_SEARCH_CREDENTIAL)
    
    #AI Search with Semantic Ranker
    search_result = search_client.search(
        search_text= query_term,
        query_type=QueryType.SEMANTIC,
        semantic_configuration_name='my-semantic-config',
        query_caption=QueryCaptionType.EXTRACTIVE,
        query_answer=QueryAnswerType.EXTRACTIVE,
        top=1,
        # select= "id, content, chunk" ,  #"keyphrases, metadata_creation_date, metadata_storage_name, content",
        search_fields=["chunk"]
    )
    
    
    #Extract data from search result iterator object
    data = [{"id": result["id"], 
            #  "creation_date":result["metadata_creation_date"], 
            #  "document_name": result["metadata_storage_name"], 
             "chunk":result["chunk"], 
            #  "chunks":result["chunk"],
             "search_score":result["@search.score"], 
             "semantic_rank":result['@search.reranker_score'], 
             "caption": result["@search.captions"]} 
            for result in search_result]
    
    return(data)
