#!/bin/bash
# Setup script for Python YOLO inference dependencies

echo "🐍 Setting up Python dependencies for YOLO inference..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check Python version
python_version=$(python -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python version: $python_version"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Python setup complete!"
echo ""
echo "🚀 You can now run YOLO inference with:"
echo "   python yolo_inference.py <image_path> <model_path> [confidence_threshold]"
echo ""
echo "📝 To install actual YOLO dependencies, uncomment lines in requirements.txt and run:"
echo "   pip install -r requirements.txt"
