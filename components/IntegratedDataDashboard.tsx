import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const IntegratedDataDashboard = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-12">
      <h2 className="text-3xl font-bold mb-2 text-center">Comprehensive Data Dashboard</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
        Our platform aggregates critical farming data from multiple trusted sources to provide you with a complete picture
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Weather Service Card */}
        <Card className="overflow-hidden border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.5-8.97A5 5 0 1015.5 19" />
              </svg>
              National Weather Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Real-time local weather data from the National Weather Service helps you make informed decisions about watering and field operations.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-semibold">72°F</div>
                  <div className="text-sm text-gray-500">Partly Cloudy</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Humidity: 45%</div>
                  <div className="text-sm">Wind: 8 mph</div>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>Updated: 10 minutes ago</span>
                <span className="text-blue-500 cursor-pointer">View forecast →</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drone Footage Card */}
        <Card className="overflow-hidden border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Drone Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              FarmFlight drone footage analyzed with Gemini AI to provide visual insights about your crops and land.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Potential Issues</div>
                    <div className="text-xs text-gray-500">Low Severity</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-14">
                  "Visual patterns consistent with early weed growth detected along the eastern border. Recommend targeted herbicide application within the next 5-7 days."
                </p>
              </div>
              
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>Footage captured: April 4, 2025</span>
                <span className="text-green-500 cursor-pointer">View drone footage →</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Forums Card */}
        <Card className="overflow-hidden border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Agricultural Forums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Curated insights from Ag Talk and other farming communities, including recent discussions on pest management and crop strategies.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-amber-600">Trending:</span> Early pest prevention for corn this season
                </div>
                <div className="text-sm">
                  <span className="font-medium text-amber-600">Local Alert:</span> Fungus reported in northern county wheat fields
                </div>
                <div className="text-sm">
                  <span className="font-medium text-amber-600">Discussion:</span> New irrigation techniques showing 20% water savings
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>From 6 agricultural communities</span>
                <span className="text-amber-500 cursor-pointer">Join discussion →</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Monitoring Section
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-6 text-center">Your Active Field Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Corn Field A", "Soybean Plot B", "Wheat Section C"].map((field, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">{field}</h3>
                
                <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Moisture</div>
                    <div className="font-medium">{65 + index * 7}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Sunlight</div>
                    <div className="font-medium">{78 - index * 4}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Growth</div>
                    <div className="font-medium">{42 + index * 12}%</div>
                  </div>
                </div>
                
                <div className="text-sm mb-4">
                  <span className="text-gray-500">Data Sources:</span> Field sensors, satellite imagery, regional weather stations
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex-1">
                    Water Now
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded text-sm flex-1">
                    View Details
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-4xl mx-auto">
          Our AI analyzes this integrated data to provide you with actionable insights and automated recommendations. Never miss a critical farming window again.
        </p>
      </div>
    </div>
  );
};

export default IntegratedDataDashboard;
