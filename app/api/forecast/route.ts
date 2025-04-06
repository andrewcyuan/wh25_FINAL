import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const long = searchParams.get('long');

    if (!lat || !long) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required parameters' },
        { status: 400 }
      );
    }

    // Fetch data from the external weather API endpoint
    // const weatherApiUrl = `https://widely-relieved-baboon.ngrok-free.app/forecast?lat=${lat}&long=${long}`;
    const weatherApiUrl = `https://wh25-weatherapi.onrender.com/forecast?lat=${lat}&long=${long}`;
    const response = await fetch(weatherApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External weather API responded with status: ${response.status}`);
    }

    const weatherData = await response.json();
    
    // Extract up to 20 periods from the forecast data
    if (weatherData.periods && weatherData.periods.length > 0) {
      // Take up to 20 periods from the forecast
      const forecastPeriods = weatherData.periods.slice(0, 20);
      
      // Format the data for easier consumption
      const formattedData = forecastPeriods.map((period: any) => ({
        name: period.name,
        startTime: period.startTime,
        endTime: period.endTime,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        icon: period.icon,
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        // Add additional fields that might be useful for visualization
        isDaytime: period.isDaytime,
        precipitationProbability: period.probabilityOfPrecipitation?.value || 0,
        // relativeHumidity: period.relativeHumidity?.value || 0
      }));
      
      return NextResponse.json(formattedData);
    } else {
      throw new Error('No forecast periods found in the weather data');
    }
  } catch (error) {
    console.error('Error fetching extended forecast data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extended forecast data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
