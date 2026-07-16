from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import joblib

# ==========================
# FastAPI App
# ==========================
app = FastAPI(title="House Price Prediction API")

# ==========================
# Load Trained Model
# ==========================
model = joblib.load("models/house_price_model.pkl")

# ==========================
# Templates & Static Files
# ==========================
templates = Jinja2Templates(directory="templates")

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

# ==========================
# Input Schema
# ==========================
class HouseData(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float

# ==========================
# Home Page
# ==========================
# @app.get("/")
# def home(request: Request):
#     return templates.TemplateResponse(
#         "index.html",
#         {
#             "request": request
#         }
#     )

@app.get("/")
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )

# ==========================
# Prediction API
# ==========================
@app.post("/predict")
def predict(data: HouseData):

    prediction = model.predict([[
        data.MedInc,
        data.HouseAge,
        data.AveRooms,
        data.AveBedrms,
        data.Population,
        data.AveOccup,
        data.Latitude,
        data.Longitude
    ]])

    return {
        "Predicted Price": float(prediction[0])
    }