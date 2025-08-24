from neo4j_graphrag.llm import AzureOpenAILLM
from dotenv import load_dotenv
import os
import json
from app.prompt import prompt

# Tự động tìm file .env trong thư mục hiện tại hoặc thư mục cha
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
dotenv_path = os.path.join(parent_dir, '.env')

# Fallback cho các đường dẫn khác nếu cần
if not os.path.exists(dotenv_path):
    # Thử tìm trong thư mục gốc của project
    project_root = os.path.dirname(parent_dir)
    dotenv_path = os.path.join(project_root, 'RecommendationSystem', '.env')

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


def generate_test_cases(code: str, K_candidates: int, problem_id: int, function_signature=None) -> [dict]:
    """
    Generate test cases for a given code snippet based on the provided prompt.

    Args:
        code (str): The code snippet for which to generate test cases.
        K_candidates (int): The number of test cases to generate.
        problem_id (int): The problem ID for logging.
        function_signature (dict): Function signature info with parameters and types.

    Returns:
        list[dict]: A list of generated test cases.
    """
    # Format function signature info for prompt
    function_info = ""
    if function_signature:
        param_info = []
        param_types = function_signature.get('parameterTypes', [])
        param_names = function_signature.get('parameterNames', [])

        for i, (ptype, pname) in enumerate(zip(param_types, param_names)):
            param_info.append(f"{ptype} {pname}")

        function_info = f"""
Function Signature: {function_signature.get('functionName', 'unknown')}({', '.join(param_info)}) -> {function_signature.get('returnType', 'unknown')}
Parameters: {len(param_types)} parameters
IMPORTANT: Input array must have exactly {len(param_types)} elements, one for each parameter.
"""

    # Format the prompt with the specified number of test cases
    formatted_prompt = prompt.format(K=K_candidates, problem=code, function_info=function_info)
    response = llm.invoke(formatted_prompt)
    if not response or not response.content:
        raise ValueError("No response received from the LLM.")
    response_content = response.content.strip()
    result = json.loads(response_content)
    log = {
        "problem_id": problem_id,
        "function_signature": function_signature,
        "result": result,
    }
    with open(f"test_cases_log.json", "a") as f:
        json.dump(log, f, indent=4)
    return result
# title = "Nhân 2 số nguyên"
# description = "Viết một hàm nhận vào hai số và trả về tích của chúng. Input là a và b, output là tích của a và b. Giới hạn của a và b là từ 0 đến 10^9."
# response = generate_test_cases(f"Bài_toán:{title}/n Mô_tả:{description}",5,6)
