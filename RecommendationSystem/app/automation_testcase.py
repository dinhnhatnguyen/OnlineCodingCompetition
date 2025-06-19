from neo4j_graphrag.llm import AzureOpenAILLM
from dotenv import load_dotenv
import os
import json
from app.prompt import prompt
dotenv_path = "D:/UbuntuSystem/OnlineCodingCompetition/RecommendationSystem/.env" # thay đổi lại đường dẫn file cấu hình của bạn

load_dotenv(dotenv_path)

subscription_key = os.getenv("OPENAI_KEY")
endpoint = os.getenv("endpoint")
DEPLOYMENT_NAME = os.getenv("DEPLOYMENT_NAME", "gpt-4.1")
api_version= os.getenv("api_version", "2025-01-01-preview")
if not subscription_key or not endpoint:
    raise ValueError("Please set the OPENAI_KEY and endpoint environment variables.")

llm = AzureOpenAILLM(
    model_name=DEPLOYMENT_NAME,
    azure_endpoint=endpoint,
    api_version=api_version, 
    api_key=subscription_key,
)


def generate_test_cases(code: str, K_candidates: int, problem_id : int) -> [dict]:
    """
    Generate test cases for a given code snippet based on the provided prompt.
    
    Args:
        code (str): The code snippet for which to generate test cases.
        K (int): The number of initial test cases to generate.
        N (int): The number of additional test cases to generate.
    
    Returns:
        str: A formatted string containing the generated test cases.
    """
    # Format the prompt with the specified number of test cases
    formatted_prompt = prompt.format(K=K_candidates, problem=code)
    response = llm.invoke(formatted_prompt)
    if not response or not response.content:
        raise ValueError("No response received from the LLM.")
    response_content = response.content.strip()
    result = json.loads(response_content)
    with open(f"test_cases/problem_{problem_id}.json", "w") as f:
        json.dump(result, f, indent=4)
    return result
# title = "Nhân 2 số nguyên"
# description = "Viết một hàm nhận vào hai số và trả về tích của chúng. Input là a và b, output là tích của a và b. Giới hạn của a và b là từ 0 đến 10^9."
# response = generate_test_cases(f"Bài_toán:{title}/n Mô_tả:{description}",5,6)
