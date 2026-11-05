import pandas as pd
import numpy as np
from pathlib import Path
import os
from ragas import evaluate, EvaluationDataset
from ragas.metrics import (
    Faithfulness,
    AnswerRelevancy,
    LLMContextRecall,
    LLMContextPrecisionWithoutReference
)
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
#root_dir
ROOT_DIR = Path(__file__).resolve().parent
EVAL_DIR = ROOT_DIR / "eval" / "data"
MODEL = os.getenv('MODEL')
EMBED_MODEL = os.getenv('EMBED_MODEL')
API_KEY = os.getenv('API_KEY')

SAVE_DIR = ROOT_DIR / "eval" / "results" 
SAVE_DIR.mkdir(parents = True, exist_ok = True)
SAVE_PATH = SAVE_DIR / "evaluator_results.csv"

files = [ item.name for item in EVAL_DIR.glob("eval_results_df*.csv")]

df_combined = pd.DataFrame()

for f in files:
    df = pd.read_csv(EVAL_DIR / f)
    
    df_combined = pd.concat([df_combined, df],  axis = 0, ignore_index = True)
    

df_final = df_combined[['question', 'generated_answer', 'retrieved_context', 'ground_truth']].copy()

df_final.columns = [
    'user_input',
    'response',
    'retrieved_contexts',
    'reference'
]
df_final['retrieved_contexts'] = df_final['retrieved_contexts'].apply(
    lambda x: [x] if pd.notna(x) else []
)



#dataset
eval_dataset = EvaluationDataset.from_pandas(df_final)


model = GoogleGenerativeAI(model = MODEL, api_key = API_KEY)
embeddings = GoogleGenerativeAIEmbeddings(
    model = EMBED_MODEL,
    api_key = API_KEY
)

evaluator_llm = LangchainLLMWrapper(model)
evaluator_embeddings = LangchainEmbeddingsWrapper(embeddings)

#evaluation
result = evaluate(
    dataset = eval_dataset,
    metrics = [
        Faithfulness(),
        AnswerRelevancy(),
        LLMContextRecall(),
        LLMContextPrecisionWithoutReference()
    ],
    llm = evaluator_llm,
    embeddings=evaluator_embeddings
)

df_res = result.to_pandas()

df_res.to_csv(SAVE_PATH, index=False)