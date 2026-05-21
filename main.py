import os
import io
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn as nn
from efficientnet_pytorch import EfficientNet
import uvicorn

app = FastAPI()

# Load OpenCV face detector (Haar Cascade)
face_cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(face_cascade_path)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace this with your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files if present (optional)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static", html=True), name="static")

    @app.get("/")
    async def serve_homepage():
        return FileResponse("static/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Static folder not found. API is running."}

# Define model class
class EmotionEfficientNet(nn.Module):
    def __init__(self, num_classes):
        super(EmotionEfficientNet, self).__init__()
        self.model = EfficientNet.from_pretrained("efficientnet-b4")
        in_features = self.model._fc.in_features
        self.model._fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)

# Load the trained model
num_classes = 7
model = EmotionEfficientNet(num_classes)
model_path = "efficientnet_b4_emotion.pth"

if os.path.exists(model_path):
    try:
        state_dict = torch.load(model_path, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        print("[OK] Model loaded successfully.")
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
else:
    print(f"[WARNING] Model file not found: {model_path}")

# Define preprocessing
transform = transforms.Compose([
    transforms.Resize((380, 380)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Class labels
class_labels = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprised"]

# Prediction endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Ensure the uploaded file is an image
        if not file.content_type.startswith("image"):
            return {"error": "Uploaded file is not a valid image."}
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Convert PIL Image to OpenCV numpy array (RGB to BGR)
        open_cv_image = np.array(image)
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
        
        if len(faces) > 0:
            # If multiple faces detected, crop the largest one by area
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = largest_face
            
            # Crop face from original image
            cropped_face = open_cv_image[y:y+h, x:x+w]
            
            # Convert back to PIL Image (BGR to RGB)
            cropped_face_rgb = cv2.cvtColor(cropped_face, cv2.COLOR_BGR2RGB)
            image_to_classify = Image.fromarray(cropped_face_rgb)
            print(f"[INFO] Face detected and cropped at: x={x}, y={y}, w={w}, h={h}")
        else:
            image_to_classify = image
            print("[WARNING] No face detected. Using full image as fallback.")

        img_tensor = transform(image_to_classify).unsqueeze(0)

        # Make prediction
        with torch.no_grad():
            output = model(img_tensor)
            probs = torch.softmax(output, dim=1).squeeze().tolist()
            pred_idx = torch.argmax(output, dim=1).item()
            label = class_labels[pred_idx] if pred_idx < len(class_labels) else "unknown"

        # Return detailed breakdown for pie chart frontend
        return {
            "prediction": pred_idx,
            "label": label,
            "probabilities": {cls: round(probs[i], 3) for i, cls in enumerate(class_labels)}
        }

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
