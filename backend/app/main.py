import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.rewrite import router as rewrite_router
from app.routes.compare import router as compare_router
from app.routes.export import router as export_router

app = FastAPI(title="CareerLens API")

origins = [
    "http://localhost:5173",
    "https://localhost:5173",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(rewrite_router, prefix="/api")
app.include_router(compare_router, prefix="/api")
app.include_router(export_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "healthy", "project": "CareerLens"}
