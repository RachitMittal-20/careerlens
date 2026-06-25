from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.rewrite import router as rewrite_router
from app.routes.compare import router as compare_router

app = FastAPI(title="CareerLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(analyze_router, prefix="/api")
app.include_router(rewrite_router, prefix="/api")
app.include_router(compare_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "healthy", "project": "CareerLens"}
