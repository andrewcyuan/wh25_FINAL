'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherPoint {
  name: string;
  startTime: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
  precipitationProbability: number;
  relativeHumidity: number;
}

interface WeatherForecastChartProps {
  forecastData: WeatherPoint[];
  className?: string;
}

const WeatherForecastChart: React.FC<WeatherForecastChartProps> = ({ forecastData, className = '' }) => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });

  const [dataType, setDataType] = useState<'temperature' | 'precipitation' | 'humidity'>('temperature');

  useEffect(() => {
    if (!forecastData || forecastData.length === 0) return;

    // Format dates to be more readable
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit' });
    };

    // Prepare data according to selected data type
    const prepareData = () => {
      const labels = forecastData.map(point => point.name);
      
      let data: number[] = [];
      let backgroundColor = '';
      let borderColor = '';
      let label = '';
      
      switch (dataType) {
        case 'temperature':
          data = forecastData.map(point => point.temperature);
          backgroundColor = 'rgba(255, 99, 132, 0.2)';
          borderColor = 'rgba(255, 99, 132, 1)';
          label = `Temperature (${forecastData[0]?.temperatureUnit || '°F'})`;
          break;
        case 'precipitation':
          data = forecastData.map(point => point.precipitationProbability);
          backgroundColor = 'rgba(54, 162, 235, 0.2)';
          borderColor = 'rgba(54, 162, 235, 1)';
          label = 'Precipitation Probability (%)';
          break;
        // case 'humidity':
        //   data = forecastData.map(point => point.relativeHumidity);
        //   backgroundColor = 'rgba(75, 192, 192, 0.2)';
        //   borderColor = 'rgba(75, 192, 192, 1)';
        //   label = 'Relative Humidity (%)';
        //   break;
      }
      
      return {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor,
            borderColor,
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: borderColor,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    };
    
    setChartData(prepareData());
  }, [forecastData, dataType]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: dataType !== 'temperature',
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            const point = forecastData[index];
            if (point) {
              return `Forecast: ${point.shortForecast}`;
            }
            return '';
          },
        },
      },
    },
  };

  // When no data is available
  if (!forecastData || forecastData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Weather Forecast
        </h2>
        <div className="text-center py-10 text-gray-500">
          <p>Weather forecast data is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Weather Forecast
        </h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${dataType === 'temperature' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setDataType('temperature')}
          >
            Temperature
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${dataType === 'precipitation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setDataType('precipitation')}
          >
            Precipitation
          </button>
          {/* <button 
            className={`px-3 py-1 text-sm rounded-md ${dataType === 'humidity' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setDataType('humidity')}
          >
            Humidity
          </button> */}
        </div>
      </div>
      
      <div className="h-64 mt-4">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default WeatherForecastChart;
