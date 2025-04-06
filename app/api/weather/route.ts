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
    
    // Extract relevant data from the first period in the forecast
    if (weatherData.periods && weatherData.periods.length > 0) {
      const currentPeriod = weatherData.periods[0];
      const formattedData = {
        temperature: currentPeriod.temperature,
        temperatureUnit: currentPeriod.temperatureUnit,
        condition: currentPeriod.shortForecast,
        windSpeed: currentPeriod.windSpeed,
        windDirection: currentPeriod.windDirection,
        icon: currentPeriod.icon,
        name: currentPeriod.name,
        detailedForecast: currentPeriod.detailedForecast
      };
      
      return NextResponse.json(formattedData);
    } else {
      throw new Error('No forecast periods found in the weather data');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
