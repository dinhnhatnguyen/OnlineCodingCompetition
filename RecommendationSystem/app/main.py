from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.recommendation import recommend_books as recommend_books_func
# ,recommend_personalized_books
from app.automation_testcase import generate_test_cases


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
@app.post('/test')
async def test(request: Request):
    data = await request.json()
    return JSONResponse(content=data)

#Recommendation api endpoints
"""
    params : user_id, num_recommendations (optionsal, default=5 amount)
    returns a list of recommended books based on the user's reading history.
"""
@app.post('/recommend_books')
async def recommend_books(request: Request):
    data = await request.json()
    results = recommend_books_func(data)
    if isinstance(results, str):
        return JSONResponse(content={"error": results}, status_code=404)
    return JSONResponse(content=results, status_code=200)

# params : user_id, num_recommendations (optionsal, default=5 amount)
# @app.post('/recommend_personalized_books')
# async def recommend_personalized_books(request: Request):
#     data = request.json()
#     return await recommend_personalized_books(data)

#default test case generation is 5 initial test cases and 5 additional test cases
@app.post('/CreateTestCaseAutomation')
async def create_test_case_automation(request: Request):
    data = await request.json()
    title = data.get('title')
    description = data.get('description')
    constraints = data.get('constraints', '')
    function_signature = data.get('functionSignature')

    code = f"Bài_toán:{title}\nMô_tả:{description}"
    if constraints:
        code += f"\nRàng_buộc:{constraints}"

    K = data.get('K', 5)
    return JSONResponse(content=generate_test_cases(code, K, 2, function_signature), status_code=200)
@app.get("/")
async def root():
    return JSONResponse(content={"message": "Welcome to the AI Service API!"}, status_code=200)