export type WeatherConditionIcon = 'sun' | 'partly-cloudy' | 'cloud' | 'rain' | 'storm';
export type WeatherSource = 'demo' | 'live';

export type WeatherForecastDay = {
  date: string;
  dayLabel: string;
  highC: number;
  lowC: number;
  rainfallProbabilityPercent: number;
  expectedRainfallMm: number;
  humidityPercent: number;
  condition: string;
  icon: WeatherConditionIcon;
};

export type WeatherSnapshot = {
  source: WeatherSource;
  location: string;
  updatedAt: string;
  current: {
    temperatureC: number;
    condition: string;
    icon: WeatherConditionIcon;
    humidityPercent: number;
    rainfallProbabilityPercent: number;
    windSpeedKph: number;
  };
  forecast: WeatherForecastDay[];
};

export interface WeatherProvider {
  getForecast(location: string, signal?: AbortSignal): Promise<WeatherSnapshot>;
}

function forecastDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    dayLabel: offset === 0
      ? 'Today'
      : new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date),
  };
}

function waitForDemoResponse(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Weather request was cancelled.', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', cancel);
      resolve();
    }, 320);
    const cancel = () => {
      clearTimeout(timer);
      reject(new DOMException('Weather request was cancelled.', 'AbortError'));
    };
    signal?.addEventListener('abort', cancel, { once: true });
  });
}

export const demoWeatherProvider: WeatherProvider = {
  async getForecast(location, signal) {
    if (!location.trim()) throw new Error('A farm location is required to load weather.');
    await waitForDemoResponse(signal);

    const days: Omit<WeatherForecastDay, 'date' | 'dayLabel'>[] = [
      { highC: 33, lowC: 22, rainfallProbabilityPercent: 20, expectedRainfallMm: 0.4, humidityPercent: 58, condition: 'Partly cloudy', icon: 'partly-cloudy' },
      { highC: 34, lowC: 22, rainfallProbabilityPercent: 18, expectedRainfallMm: 0.2, humidityPercent: 54, condition: 'Mostly sunny', icon: 'sun' },
      { highC: 31, lowC: 21, rainfallProbabilityPercent: 76, expectedRainfallMm: 20.8, humidityPercent: 82, condition: 'Heavy showers possible', icon: 'storm' },
      { highC: 34, lowC: 21, rainfallProbabilityPercent: 8, expectedRainfallMm: 0, humidityPercent: 45, condition: 'Sunny', icon: 'sun' },
      { highC: 36, lowC: 22, rainfallProbabilityPercent: 12, expectedRainfallMm: 0.1, humidityPercent: 40, condition: 'Hot and sunny', icon: 'sun' },
    ];

    return {
      source: 'demo',
      location,
      updatedAt: new Date().toISOString(),
      current: {
        temperatureC: 29,
        condition: 'Partly cloudy',
        icon: 'partly-cloudy',
        humidityPercent: 62,
        rainfallProbabilityPercent: 20,
        windSpeedKph: 9,
      },
      forecast: days.map((day, index) => ({ ...forecastDate(index), ...day })),
    };
  },
};

// Swap this for a server-backed adapter when a weather service is configured.
// Keep provider credentials on the server; this browser-side demo makes no network calls.
export const weatherProvider: WeatherProvider = demoWeatherProvider;

export type FarmingWeatherAlert = {
  id: string;
  kind: 'heavy-rain' | 'high-temperature' | 'low-rainfall' | 'irrigation';
  title: string;
  timing: string;
  advice: string;
  tone: 'warning' | 'watch' | 'helpful';
};

export function deriveWeatherAlerts(snapshot: WeatherSnapshot): FarmingWeatherAlert[] {
  const forecast = snapshot.forecast.slice(0, 5);
  if (forecast.length === 0) return [];

  const alerts: FarmingWeatherAlert[] = [];
  const rainyDay = forecast.find(day => day.expectedRainfallMm >= 15 || day.rainfallProbabilityPercent >= 70);
  if (rainyDay) {
    alerts.push({
      id: 'heavy-rain',
      kind: 'heavy-rain',
      title: 'Heavy rain expected',
      timing: rainyDay.dayLabel,
      advice: 'Check field drains and wait to irrigate until you have checked soil moisture.',
      tone: 'warning',
    });
  }

  const hotDay = forecast.find(day => day.highC >= 35);
  if (hotDay) {
    alerts.push({
      id: 'high-temperature',
      kind: 'high-temperature',
      title: 'High temperature',
      timing: `${hotDay.dayLabel} · ${hotDay.highC}°C`,
      advice: 'Plan field work for cooler hours and watch crops for heat stress.',
      tone: 'warning',
    });
  }

  const fiveDayRainfall = forecast.reduce((total, day) => total + day.expectedRainfallMm, 0);
  if (fiveDayRainfall < 30) {
    alerts.push({
      id: 'low-rainfall',
      kind: 'low-rainfall',
      title: 'Low rainfall',
      timing: `About ${fiveDayRainfall.toFixed(1)} mm expected over 5 days`,
      advice: 'Plan water use carefully and check root-zone moisture regularly.',
      tone: 'watch',
    });
  }

  const today = forecast[0];
  if (snapshot.current.rainfallProbabilityPercent <= 30 && today.expectedRainfallMm <= 1.5) {
    alerts.push({
      id: 'irrigation',
      kind: 'irrigation',
      title: 'Suitable conditions for irrigation',
      timing: 'Rain is unlikely in today’s outlook',
      advice: 'Check the soil first; irrigate only if the root zone is dry.',
      tone: 'helpful',
    });
  }

  return alerts;
}

export function getCurrentFarmingAdvice(snapshot: WeatherSnapshot): string {
  const today = snapshot.forecast[0];
  if (today && (today.rainfallProbabilityPercent >= 60 || today.expectedRainfallMm >= 8)) {
    return 'Rain may arrive today. Check field drainage and soil moisture before changing your irrigation plan.';
  }
  if (snapshot.current.temperatureC >= 35 || (today && today.highC >= 35)) {
    return 'Hot conditions are in the outlook. Schedule field work for cooler hours and check plants for signs of heat stress.';
  }
  if (today && today.rainfallProbabilityPercent <= 30) {
    return 'Little rain is expected today. Check soil moisture near the roots; irrigate only if the soil is dry.';
  }
  return 'Weather can change quickly. Check soil moisture and local field conditions before adjusting irrigation.';
}

export function getForecastFarmingAdvice(day: WeatherForecastDay): string {
  if (day.rainfallProbabilityPercent >= 60 || day.expectedRainfallMm >= 8) {
    return 'Check drainage before showers and avoid watering soil that is already wet.';
  }
  if (day.highC >= 35) {
    return 'Choose cooler hours for field work and check crops for heat stress.';
  }
  if (day.rainfallProbabilityPercent <= 20) {
    return 'Check root-zone moisture; irrigate only if the soil needs it.';
  }
  return 'Recheck soil after showers before deciding whether to irrigate.';
}