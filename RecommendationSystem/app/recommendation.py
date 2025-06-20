import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from dotenv import load_dotenv
import os
import psycopg2
from sqlalchemy import create_engine

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
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")
db_port = os.getenv("DB_PORT", "5432")  # Default to 5432 if not specified

# Validate environment variables
if not all([user, password, db_name]):
    raise ValueError(f"Missing database environment variables: DB_USER={user}, DB_PASSWORD={'***' if password else None}, DB_NAME={db_name}")


# Tạo kết nối đến cơ sở dữ liệu PostgreSQL
def create_db_connection():
    try:
        engine = create_engine(f'postgresql+psycopg2://{user}:{password}@localhost:{db_port}/{db_name}')
        return engine
    except Exception as e:
        raise ConnectionError(f"Failed to create database connection: {str(e)}")

# Hàm lấy dữ liệu từ PostgreSQL và xử lý với pandas
def get_books_from_db():
    try:
        engine = create_db_connection()
        with engine.connect() as conn:
            sql = """
                SELECT title, id,
                COALESCE(constraints, '') || ' ' || COALESCE(description, '') AS combined
                FROM problems
                WHERE deleted = false;
            """
            df = pd.read_sql_query(sql, conn)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to fetch data from database: {str(e)}")

def recommend_books(data):
    df = get_books_from_db()
    df = df.dropna(subset=['combined'])
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['combined'])
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    indices = pd.Series(df.index, index=df['title']).drop_duplicates()

    title = data.get('title')
    num_recommendations = data.get('num_recommendations', 10)
    idx = indices.get(title)
    if idx is None:
        return "Không tìm thấy bài trong dữ liệu."
    sim_scores = list(enumerate(cosine_sim[idx]))
    # sim_scores = [(i, float(score) if not isinstance(score, float) else score) for i, score in sim_scores]
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num_recommendations+1]
    book_indices = [i[0] for i in sim_scores]
    results = df.iloc[book_indices][['id','title','combined']].to_dict(orient='records')
    return {"recommendations": results}

#personalized recommendations
# def recommend_personalized_books(data: dict):
#     data = data.json()
#     user_id = data.get('user_id')
#     num_recommendations = data.get('num_recommendations', 5)

#     # Giả sử có một hàm để lấy lịch sử đọc sách của người dùng
#     # history = get_user_reading_history(user_id)
#     history = []  # Thay thế bằng hàm thực tế để lấy lịch sử đọc sách
#     if not history:
#         return JSONResponse(content={"error": "Không có lịch sử đọc sách cho người dùng."}, status_code=404)
#     # Tính toán độ tương tự giữa sách trong lịch sử đọc
#     history_indices = [indices.get(title) for title in history if indices.get(title) is not None]
#     if not history_indices:
#         return JSONResponse(content={"error": "Không tìm thấy sách trong lịch sử đọc."}, status_code=404)

#     # Tính toán độ tương tự giữa sách trong lịch sử đọc
#     history_cosine_sim = cosine_sim[history_indices]
#     # Lấy trung bình các độ tương tự
#     mean_sim_scores = history_cosine_sim.mean(axis=0)
#     # Lấy top N sách tương tự
#     book_indices = mean_sim_scores.argsort()[::-1][:num_recommendations]
#     results = df.iloc[book_indices][['Book', 'Author', 'Genres', 'Description']].to_dict(orient='records')
#     return {"recommendations": results}