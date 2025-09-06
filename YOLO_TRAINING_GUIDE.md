# 🦁 YOLO Model Training for Wildlife Detection

## Overview
This guide will help you train a custom YOLO model specifically for wildlife monitoring and anomaly detection in forest environments.

## 🎯 **Training Objectives**

### **Primary Classes (Wildlife)**
- `tiger` - Bengal tigers, other big cats
- `elephant` - Asian elephants, African elephants
- `deer` - Various deer species
- `bird` - Birds of prey, forest birds
- `wildlife` - General wildlife category

### **Secondary Classes (Anomalies)**
- `person` - Human presence (potential threat)
- `vehicle` - Cars, trucks, motorcycles
- `fire` - Fire detection (high priority)
- `firearm` - Weapons detection (high priority)

### **Environmental Classes**
- `tree` - Forest vegetation
- `grass` - Ground vegetation
- `water` - Water bodies

## 🛠️ **Training Methods**

### **Method 1: YOLOv8 Training (Recommended)**

#### **1. Install YOLOv8**
```bash
pip install ultralytics
```

#### **2. Prepare Dataset**
```bash
# Create dataset structure
mkdir wildlife_dataset
cd wildlife_dataset
mkdir images/train images/val images/test
mkdir labels/train labels/val labels/test
```

#### **3. Dataset Format**
- **Images**: JPG/PNG format, 640x640 recommended
- **Labels**: YOLO format (.txt files)
- **Label format**: `class_id center_x center_y width height` (normalized 0-1)

#### **4. Training Command**
```python
from ultralytics import YOLO

# Load pre-trained model
model = YOLO('yolov8n.pt')  # or yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt

# Train the model
results = model.train(
    data='wildlife_dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device='cuda',  # or 'cpu'
    project='wildlife_detection',
    name='yolo_wildlife'
)
```

#### **5. Dataset Configuration (wildlife_dataset.yaml)**
```yaml
path: ./wildlife_dataset
train: images/train
val: images/val
test: images/test

nc: 11  # number of classes
names: ['tiger', 'elephant', 'deer', 'bird', 'wildlife', 'person', 'vehicle', 'fire', 'firearm', 'tree', 'grass']
```

### **Method 2: Custom YOLO Training**

#### **1. Install Dependencies**
```bash
pip install torch torchvision
pip install opencv-python
pip install pillow
pip install numpy
```

#### **2. Training Script**
```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import cv2
import numpy as np

class WildlifeDataset(torch.utils.data.Dataset):
    def __init__(self, image_paths, labels, transforms=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transforms = transforms
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image = cv2.imread(self.image_paths[idx])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        if self.transforms:
            image = self.transforms(image)
        
        return image, self.labels[idx]

# Training loop
def train_model(model, train_loader, val_loader, epochs=100):
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()
    
    for epoch in range(epochs):
        model.train()
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            if batch_idx % 100 == 0:
                print(f'Epoch {epoch}, Batch {batch_idx}, Loss: {loss.item()}')
```

## 📊 **Data Collection Strategy**

### **1. Wildlife Images**
- **Tiger**: 500+ images from various angles, lighting conditions
- **Elephant**: 500+ images, different poses and sizes
- **Deer**: 300+ images, various species
- **Birds**: 400+ images, different species and positions
- **General Wildlife**: 200+ images

### **2. Anomaly Images**
- **Person**: 300+ images, different clothing, poses
- **Vehicle**: 200+ images, cars, trucks, motorcycles
- **Fire**: 100+ images, various fire types and sizes
- **Firearm**: 50+ images, different weapon types

### **3. Environmental Images**
- **Trees**: 200+ images, different tree types
- **Grass**: 100+ images, various grass types
- **Water**: 100+ images, rivers, ponds, streams

### **4. Data Sources**
- **Wildlife Cameras**: Trail cameras, motion-activated cameras
- **Satellite Imagery**: High-resolution satellite images
- **Drone Footage**: Aerial wildlife monitoring
- **Public Datasets**: 
  - COCO Dataset
  - Open Images Dataset
  - Wildlife datasets from research papers

## 🏷️ **Data Annotation**

### **1. Annotation Tools**
- **LabelImg**: Free, easy to use
- **Roboflow**: Online annotation platform
- **CVAT**: Computer Vision Annotation Tool
- **Labelbox**: Professional annotation platform

### **2. Annotation Guidelines**
- **Bounding Boxes**: Tight around objects, include full object
- **Class Labels**: Use consistent naming convention
- **Quality Control**: Review annotations for accuracy
- **Multiple Annotators**: Cross-validate annotations

### **3. Label Format**
```
# YOLO format example
0 0.5 0.5 0.3 0.4  # tiger at center, 30% width, 40% height
1 0.2 0.3 0.2 0.3  # elephant at left, 20% width, 30% height
```

## 🚀 **Model Optimization**

### **1. Hyperparameter Tuning**
```python
# YOLOv8 hyperparameters
model.train(
    data='wildlife_dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    lr0=0.01,        # initial learning rate
    lrf=0.01,        # final learning rate
    momentum=0.937,   # momentum
    weight_decay=0.0005,  # weight decay
    warmup_epochs=3,      # warmup epochs
    warmup_momentum=0.8,  # warmup momentum
    warmup_bias_lr=0.1,   # warmup bias lr
    box=7.5,         # box loss gain
    cls=0.5,         # cls loss gain
    dfl=1.5,         # dfl loss gain
    pose=12.0,       # pose loss gain
    kobj=2.0,        # keypoint obj loss gain
    label_smoothing=0.0,  # label smoothing
    nbs=64,          # nominal batch size
    overlap_mask=True,    # masks should overlap during training
    mask_ratio=4,         # mask downsample ratio
    drop_path=0.0,        # drop path
    hsv_h=0.015,         # image HSV-Hue augmentation
    hsv_s=0.7,           # image HSV-Saturation augmentation
    hsv_v=0.4,           # image HSV-Value augmentation
    degrees=0.0,          # image rotation (+/- deg)
    translate=0.1,        # image translation (+/- fraction)
    scale=0.5,            # image scale (+/- gain)
    shear=0.0,            # image shear (+/- deg)
    perspective=0.0,      # image perspective (+/- fraction)
    flipud=0.0,           # image flip up-down (probability)
    fliplr=0.5,           # image flip left-right (probability)
    mosaic=1.0,           # image mosaic (probability)
    mixup=0.0,            # image mixup (probability)
    copy_paste=0.0,       # segment copy-paste (probability)
)
```

### **2. Model Architecture Selection**
- **YOLOv8n**: Fastest, lowest accuracy
- **YOLOv8s**: Good balance of speed and accuracy
- **YOLOv8m**: Better accuracy, slower
- **YOLOv8l**: High accuracy, slower
- **YOLOv8x**: Highest accuracy, slowest

### **3. Transfer Learning**
```python
# Load pre-trained model
model = YOLO('yolov8n.pt')

# Freeze backbone layers
for param in model.model.backbone.parameters():
    param.requires_grad = False

# Train only head layers
model.train(data='wildlife_dataset.yaml', epochs=50)
```

## 📈 **Evaluation Metrics**

### **1. Detection Metrics**
- **mAP@0.5**: Mean Average Precision at IoU 0.5
- **mAP@0.5:0.95**: Mean Average Precision across IoU thresholds
- **Precision**: True Positives / (True Positives + False Positives)
- **Recall**: True Positives / (True Positives + False Negatives)
- **F1-Score**: 2 * (Precision * Recall) / (Precision + Recall)

### **2. Class-Specific Metrics**
```python
# Evaluate model
results = model.val(data='wildlife_dataset.yaml')

# Print results
print(f"mAP@0.5: {results.box.map50}")
print(f"mAP@0.5:0.95: {results.box.map}")
print(f"Precision: {results.box.mp}")
print(f"Recall: {results.box.mr}")
```

## 🔧 **Integration with ForestWatch**

### **1. Model Conversion**
```python
# Convert to ONNX for better performance
model.export(format='onnx', imgsz=640)

# Convert to TensorRT for GPU acceleration
model.export(format='engine', imgsz=640)
```

### **2. Update Backend**
```javascript
// In backend/yolo-real-integration.js
const { spawn } = require('child_process');

class RealYOLODetector {
  async detect(imagePath) {
    // Run YOLO inference
    const pythonProcess = spawn('python', [
      'yolo_inference.py',
      '--model', 'wildlife_model.pt',
      '--image', imagePath,
      '--conf', '0.5'
    ]);
    
    // Parse results
    // ... implementation
  }
}
```

### **3. Real-time Inference**
```python
# yolo_inference.py
import torch
from ultralytics import YOLO
import cv2
import json

def run_inference(model_path, image_path, confidence=0.5):
    model = YOLO(model_path)
    results = model(image_path, conf=confidence)
    
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            detection = {
                'class': model.names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': {
                    'x': int(box.xyxy[0][0]),
                    'y': int(box.xyxy[0][1]),
                    'width': int(box.xyxy[0][2] - box.xyxy[0][0]),
                    'height': int(box.xyxy[0][3] - box.xyxy[0][1])
                }
            }
            detections.append(detection)
    
    return detections

if __name__ == "__main__":
    import sys
    model_path = sys.argv[1]
    image_path = sys.argv[2]
    conf = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    
    detections = run_inference(model_path, image_path, conf)
    print(json.dumps(detections))
```

## 🎯 **Best Practices**

### **1. Data Quality**
- **High Resolution**: Use images with good resolution
- **Diverse Conditions**: Include various lighting, weather, angles
- **Balanced Dataset**: Equal representation of all classes
- **Quality Control**: Regular review of annotations

### **2. Training Strategy**
- **Progressive Training**: Start with pre-trained weights
- **Data Augmentation**: Use rotation, scaling, color changes
- **Validation**: Regular validation during training
- **Early Stopping**: Stop when validation loss plateaus

### **3. Model Deployment**
- **Optimization**: Use TensorRT or ONNX for speed
- **Monitoring**: Track model performance in production
- **Updates**: Regular retraining with new data
- **Fallback**: Keep mock detection as backup

## 📚 **Resources**

### **Datasets**
- [COCO Dataset](https://cocodataset.org/)
- [Open Images Dataset](https://storage.googleapis.com/openimages/web/index.html)
- [Wildlife Datasets](https://www.kaggle.com/datasets?search=wildlife)

### **Tools**
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [LabelImg](https://github.com/tzutalin/labelImg)
- [Roboflow](https://roboflow.com/)

### **Tutorials**
- [YOLOv8 Training Guide](https://docs.ultralytics.com/guides/training/)
- [Custom Dataset Training](https://docs.ultralytics.com/guides/training/#train-on-custom-dataset)

## 🚀 **Quick Start**

1. **Install YOLOv8**: `pip install ultralytics`
2. **Prepare Dataset**: Collect and annotate wildlife images
3. **Train Model**: `yolo train data=wildlife.yaml model=yolov8n.pt epochs=100`
4. **Export Model**: `yolo export model=best.pt format=onnx`
5. **Integrate**: Update ForestWatch backend with new model

Your custom wildlife detection model will be ready for real-time monitoring! 🦁🎯
