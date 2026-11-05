from dotenv import load_dotenv
from rag import load_pdf, get_chunks, createVectorStore, generate_rag_prompt_eval, generate_rag_chain
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI
from langchain_community.vectorstores import FAISS
import pandas as pd
import numpy as np
from pathlib import Path
import os


#root_dir
ROOT_DIR = Path(__file__).resolve().parent
DOC_DIR = ROOT_DIR /  "documents"
QUESTIONS_CSV = DOC_DIR / "questions.csv"

#vectorstore save path
VSTORE_SAVE_PATH = ROOT_DIR / "eval" / "vstores"

DF_SAVE_PATH = ROOT_DIR / "eval" / "data"

VSTORE_SAVE_PATH.mkdir(parents = True, exist_ok = True)
DF_SAVE_PATH.mkdir(parents = True, exist_ok = True)

load_dotenv()
EMBED_MODEL = os.getenv('EMBED_MODEL')
MODEL = os.getenv('MODEL')
API_KEY = os.getenv('API_KEY')

#first load_pdf
pdf_list = [DOC_DIR / "batch_norm.pdf", DOC_DIR / "dropout.pdf", DOC_DIR / "lora.pdf", DOC_DIR / "residual.pdf", 
            DOC_DIR / "vit.pdf"]

#embed model
embeddings = GoogleGenerativeAIEmbeddings(
    model = EMBED_MODEL,
    api_key = API_KEY
)

#generateive model
model = GoogleGenerativeAI(
    model = MODEL,
    api_key = API_KEY
)

df_list = []
retriever_list = []

#generate store, retrievers and df splits
for i, pdf in enumerate(pdf_list):
    docs = load_pdf(pdf)
    #chunks
    texts, metadata = get_chunks(docs, chunk_size = 500, chunk_overlap = 50)
    
    print(f'\n---------Creating vector store for pdf # :{i+1}----------\n')
    v_store = createVectorStore(embeddings = embeddings, texts = texts, 
                                metadata = metadata, batch_size = 100, timeout = 3, verbose = True)
    filename = pdf.stem
    v_store.save_local(VSTORE_SAVE_PATH / filename)
    
    #load df of ground truth
    df = pd.read_csv(QUESTIONS_CSV)
    
    df_split = df[df['source'] == f'{filename}.pdf']
    
    df_list.append(df_split)
    
    retriever = v_store.as_retriever(
        search_kwargs = {"k" : 7}
    )
    
    retriever_list.append(retriever)
    
    
#prompt
rag_prompt = generate_rag_prompt_eval()

eval_df = []

#check retrieval performance
for i, retriever in enumerate(retriever_list):
    print(f'\n-------Evaluating pdf {i+1}-------\n')
    rag_chain = generate_rag_chain(rag_prompt = rag_prompt, retriever = retriever, model = model)
    
    df = df_list[i].copy()
    
    answers = []
    contexts = []
    retrieved_pages = []
    sources = []
    
    for question in df['question']:
        
        result = rag_chain.invoke({"question": question})
        
        answers.append(result['answer'])
        
        contexts.append(
            "\n\n".join(source['content'] for source in result['sources'])
            )
        
        retrieved_pages.append(result['retrieved_pages'])
        
        sources.append(result['sources'])
        
    df['generated_answer'] = answers
    df['retrieved_context'] = contexts
    df['retrieved_pages'] = retrieved_pages
    df['sources'] = sources
    df['retrieval_hit'] = [int(page in pages) for page, pages in zip(df['page'], df['retrieved_pages'])]
    
    eval_df.append(df)
    

for i, df in enumerate(eval_df):
    df.to_csv(DF_SAVE_PATH / f"eval_results_df{i+1}.csv", index = False)
    




    
    
    
    
    
    
