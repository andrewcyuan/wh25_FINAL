import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CropStatus {
  id: string;
  name: string;
  moisture: number;
  sunlight: number;
  growth: number;
  lastWatered: string;
}

const dummyCropData: CropStatus[] = [
  {
    id: "crop1",
    name: "Corn Field A",
    moisture: 65,
    sunlight: 78,
    growth: 42,
    lastWatered: "2 hours ago"
  },
  {
    id: "crop2",
    name: "Wheat Section B",
    moisture: 53,
    sunlight: 85,
    growth: 67,
    lastWatered: "5 hours ago"
  },
  {
    id: "crop3",
    name: "Soybean Plot C",
    moisture: 72,
    sunlight: 65,
    growth: 31,
    lastWatered: "1 hour ago"
  }
];

export default function CropMonitoringDashboard() {
  return (
    <div className="w-full max-w-5xl mx-auto mb-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Crop Monitoring Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyCropData.map((crop) => (
          <Card key={crop.id} className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">{crop.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Soil Moisture</span>
                    <span className="text-sm font-medium">{crop.moisture}%</span>
                  </div>
                  <Progress value={crop.moisture} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Sunlight</span>
                    <span className="text-sm font-medium">{crop.sunlight}%</span>
                  </div>
                  <Progress value={crop.sunlight} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Growth Progress</span>
                    <span className="text-sm font-medium">{crop.growth}%</span>
                  </div>
                  <Progress value={crop.growth} className="h-2" />
                </div>
                
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-gray-500">Last watered:</span>
                  <span>{crop.lastWatered}</span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1">
                    Water Now
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex-1">
                    Schedule
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
