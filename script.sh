#!/bin/bash

# Create Dream Town
cp src/components/ShaoxingView.tsx src/components/DreamTownView.tsx
cp src/components/ShaoxingMapView.tsx src/components/DreamTownMapView.tsx
sed -i 's/ShaoxingView/DreamTownView/g' src/components/DreamTownView.tsx
sed -i 's/ShaoxingMapView/DreamTownMapView/g' src/components/DreamTownMapView.tsx
sed -i 's/\/yuecheng\/map/\/dream\/map/g' src/components/DreamTownView.tsx
sed -i 's/\/yuecheng\/info/\/dream\/info/g' src/components/DreamTownMapView.tsx

# Create AI Town
cp src/components/ShaoxingView.tsx src/components/AITownView.tsx
cp src/components/ShaoxingMapView.tsx src/components/AITownMapView.tsx
sed -i 's/ShaoxingView/AITownView/g' src/components/AITownView.tsx
sed -i 's/ShaoxingMapView/AITownMapView/g' src/components/AITownMapView.tsx
sed -i 's/\/yuecheng\/map/\/ai\/map/g' src/components/AITownView.tsx
sed -i 's/\/yuecheng\/info/\/ai\/info/g' src/components/AITownMapView.tsx

# Create Computing Town
cp src/components/ShaoxingView.tsx src/components/ComputingTownView.tsx
cp src/components/ShaoxingMapView.tsx src/components/ComputingTownMapView.tsx
sed -i 's/ShaoxingView/ComputingTownView/g' src/components/ComputingTownView.tsx
sed -i 's/ShaoxingMapView/ComputingTownMapView/g' src/components/ComputingTownMapView.tsx
sed -i 's/\/yuecheng\/map/\/computing\/map/g' src/components/ComputingTownView.tsx
sed -i 's/\/yuecheng\/info/\/computing\/info/g' src/components/ComputingTownMapView.tsx

# Create Deqing Town
cp src/components/ShaoxingView.tsx src/components/DeqingTownView.tsx
cp src/components/ShaoxingMapView.tsx src/components/DeqingTownMapView.tsx
sed -i 's/ShaoxingView/DeqingTownView/g' src/components/DeqingTownView.tsx
sed -i 's/ShaoxingMapView/DeqingTownMapView/g' src/components/DeqingTownMapView.tsx
sed -i 's/\/yuecheng\/map/\/deqing\/map/g' src/components/DeqingTownView.tsx
sed -i 's/\/yuecheng\/info/\/deqing\/info/g' src/components/DeqingTownMapView.tsx

# Create Jiashan Town
cp src/components/ShaoxingView.tsx src/components/JiashanTownView.tsx
cp src/components/ShaoxingMapView.tsx src/components/JiashanTownMapView.tsx
sed -i 's/ShaoxingView/JiashanTownView/g' src/components/JiashanTownView.tsx
sed -i 's/ShaoxingMapView/JiashanTownMapView/g' src/components/JiashanTownMapView.tsx
sed -i 's/\/yuecheng\/map/\/jiashan\/map/g' src/components/JiashanTownView.tsx
sed -i 's/\/yuecheng\/info/\/jiashan\/info/g' src/components/JiashanTownMapView.tsx
