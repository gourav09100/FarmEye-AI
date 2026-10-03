import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  deriveWeatherAlerts,
  getCurrentFarmingAdvice,
  getForecastFarmingAdvice,
  weatherProvider,
  type WeatherConditionIcon,
  type WeatherForecastDay,
  type WeatherProvider,
  type WeatherSnapshot,
} from './weather-provider';

type Props = { location: string; provider?: WeatherProvider };
type TemperatureUnit = 'C' | 'F';

const fieldChecks = [
  { id: 'after-rain', title: 'After rain', detail: 'Check field drainage before irrigating again.', icon: <Droplets size={16} className="text-[#64816b] shrink-0" /> },
  { id: 'before-spraying', title: 'Before spraying', detail: 'Check actual wind and the product label first.', icon: <Wind size={16} className="text-[#64816b] shrink-0" /> },
  { id: 'warm-afternoons', title: 'Warm afternoons', detail: 'Observe plants for stress during field rounds.', icon: <Sun size={16} className="text-[#a17a44] shrink-0" /> },
];

function readReviewedChecks(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('farmeye-weather-reviewed-v1') || '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function conditionIcon(icon: WeatherConditionIcon, size = 22): ReactNode {
  if (icon === 'sun') return <Sun size={size} />;
  if (icon === 'partly-cloudy') return <CloudSun size={size} />;
  if (icon === 'rain') return <CloudRain size={size} />;
  if (icon === 'storm') return <CloudLightning size={size} />;
  return <Cloud size={size} />;
}

function temperature(valueC: number, unit: TemperatureUnit) {
  return unit === 'C' ? Math.round(valueC) : Math.round(valueC * 9 / 5 + 32);
}

function WeatherPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel p-5 sm:p-6 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[.15em] text-[#82906e] font-bold">{children}</div>;
}

function AlertIcon({ kind }: { kind: string }) {
  if (kind === 'heavy-rain') return <CloudRain size={18} />;
  if (kind === 'high-temperature') return <Thermometer size={18} />;
  if (kind === 'irrigation') return <Droplets size={18} />;
  return <AlertTriangle size={18} />;
}

function WeatherLoading() {
  return (
    <WeatherPanel data-testid="weather-loading" aria-label="Loading weather forecast">
      <div role="status" className="text-sm font-semibold text-[#53684e]">Loading weather conditions…</div>
      <div className="grid sm:grid-cols-3 gap-3 mt-5 animate-pulse">
        <div className="h-24 rounded-xl bg-[#ecece2]" />
        <div className="h-24 rounded-xl bg-[#ecece2]" />
        <div className="h-24 rounded-xl bg-[#ecece2]" />
      </div>
      <div className="h-44 rounded-xl bg-[#ecece2] mt-4 animate-pulse" />
    </WeatherPanel>
  );
}

function WeatherError({ onRetry }: { onRetry: () => void }) {
  return (
    <WeatherPanel data-testid="weather-error">
      <div role="alert" className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-[#a3483e] mt-0.5 shrink-0" />
        <div>
          <h2 className="font-semibold text-[#533b35]">Weather could not be loaded</h2>
          <p className="text-sm text-[#788075] mt-1">Check your connection and try again. Your other farm tools are still available.</p>
          <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-[#315c3e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#264b32]">
            Try again
          </button>
        </div>
      </div>
    </WeatherPanel>
  );
}

function WeatherIntelligence({ location, provider = weatherProvider }: Props) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [selectedDate, setSelectedDate] = useState('');
  const [reviewed, setReviewed] = useState<string[]>(readReviewedChecks);
  const [reviewError, setReviewError] = useState('');
  const requestSequence = useRef(0);
  const requestController = useRef<AbortController | null>(null);

  const loadForecast = useCallback(async () => {
    const requestId = ++requestSequence.current;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError('');
    try {
      const result = await provider.getForecast(location, controller.signal);
      if (requestId !== requestSequence.current) return;
      setSnapshot(result);
      setSelectedDate(current => result.forecast.slice(0, 5).some(day => day.date === current)
        ? current
        : result.forecast[0]?.date ?? '');
    } catch {
      if (requestId === requestSequence.current && !controller.signal.aborted) {
        setError('Weather data is temporarily unavailable.');
      }
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [location, provider]);

  useEffect(() => {
    void loadForecast();
    return () => {
      requestSequence.current += 1;
      requestController.current?.abort();
    };
  }, [loadForecast]);

  const forecast = snapshot?.forecast.slice(0, 5) ?? [];
  const selectedDay = forecast.find(day => day.date === selectedDate) ?? forecast[0];
  const alerts = snapshot ? deriveWeatherAlerts({ ...snapshot, forecast }) : [];

  const toggleReviewed = (id: string) => {
    const next = reviewed.includes(id) ? reviewed.filter(value => value !== id) : [...reviewed, id];
    try {
      localStorage.setItem('farmeye-weather-reviewed-v1', JSON.stringify(next));
      setReviewed(next);
      setReviewError('');
    } catch {
      setReviewError('This reminder could not be saved on this device.');
    }
  };

  return (
    <div className="space-y-5" data-testid="weather-intelligence">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Eyebrow>Weather intelligence</Eyebrow>
          <h1 className="serif text-[32px] sm:text-[38px] leading-[1.08] text-[#263d2f] mt-2">Read the sky, plan the day.</h1>
          <p className="text-sm text-[#788075] mt-2">Local conditions translated into practical field checks.</p>
        </div>
        <button
          type="button"
          data-testid="button-refresh-weather"
          onClick={() => void loadForecast()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7d8ca] px-4 py-2.5 text-sm font-semibold text-[#36533c] hover:bg-[#f0f1e6] disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading weather…' : 'Refresh weather'}
        </button>
      </div>

      {error && snapshot && (
        <div role="alert" data-testid="weather-stale-error" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8c9bc] bg-[#fbf0ea] p-4 text-sm text-[#74483e]">
          <span>Could not refresh. Showing the last available conditions.</span>
          <button type="button" onClick={() => void loadForecast()} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      {loading && !snapshot && <WeatherLoading />}
      {error && !snapshot && <WeatherError onRetry={() => void loadForecast()} />}

      {snapshot && (
        <>
          <div data-testid="weather-data-source" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#e1dfd3] bg-[#f8f7f0] px-4 py-3 text-xs text-[#72786c]">
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[.12em] ${snapshot.source === 'demo' ? 'bg-[#f4e8ca] text-[#8b6730]' : 'bg-[#e5efdf] text-[#4e7049]'}`}>
              {snapshot.source === 'demo' ? 'DEMO WEATHER' : 'LIVE WEATHER'}
            </span>
            <span>{snapshot.source === 'demo' ? 'Sample data · no weather service is connected.' : `Updated ${new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(snapshot.updatedAt))}`}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={13} />{snapshot.location}</span>
          </div>

          {loading && <div role="status" className="text-xs text-[#788075]">Refreshing weather data…</div>}

          <div className="grid xl:grid-cols-[1.25fr_.75fr] gap-5">
            <div className="space-y-5">
              <WeatherPanel className="!p-0 overflow-hidden">
                <div className="relative overflow-hidden bg-[#294b37] p-6 sm:p-8 text-[#f6f3e6] soft-dots">
                  <div className="absolute right-8 top-[-35px] h-48 w-48 rounded-full border border-[#e6dcaa]/20" />
                  <div className="relative flex flex-wrap items-center justify-between gap-5">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.08em] text-[#dce7a6]">
                        CURRENT CONDITIONS
                      </div>
                      <div className="mt-5 flex items-start gap-4">
                        <div className="serif text-[58px] leading-none" data-testid="weather-current-temperature">
                          {temperature(snapshot.current.temperatureC, unit)}°<span className="text-2xl text-[#bfccb9]"> {unit}</span>
                        </div>
                        <div className="mt-2 rounded-2xl bg-white/10 p-3 text-[#f0dda7]">
                          {conditionIcon(snapshot.current.icon, 30)}
                        </div>
                      </div>
                      <div data-testid="weather-current-condition" className="mt-2 text-sm text-[#d0dac8]">{snapshot.current.condition}</div>
                      <div className="mt-3 text-xs text-[#b8c8b3]">
                        Today’s range {temperature(forecast[0]?.highC ?? snapshot.current.temperatureC, unit)}° / {temperature(forecast[0]?.lowC ?? snapshot.current.temperatureC, unit)}° {unit}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[.06] p-4 text-xs text-[#d5dfcf]">
                      <div className="text-[10px] uppercase tracking-[.14em] text-[#dce7a6]">Farm note</div>
                      <p className="mt-2 max-w-[300px] leading-relaxed">{getCurrentFarmingAdvice(snapshot)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#edebe1] p-3 sm:p-4">
                  <WeatherMetric label="Humidity" value={`${snapshot.current.humidityPercent}%`} icon={<Droplets size={16} />} testId="weather-current-humidity" />
                  <WeatherMetric label="Rainfall probability" value={`${snapshot.current.rainfallProbabilityPercent}%`} icon={<CloudRain size={16} />} testId="weather-current-rainfall" />
                  <WeatherMetric label="Wind" value={`${snapshot.current.windSpeedKph} km/h`} icon={<Wind size={16} />} />
                  <WeatherMetric label="Condition" value={snapshot.current.condition} icon={conditionIcon(snapshot.current.icon, 16)} />
                </div>
              </WeatherPanel>

              <WeatherPanel>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <Eyebrow>Five-day outlook · {snapshot.source === 'demo' ? 'sample' : 'forecast'}</Eyebrow>
                    <h2 className="serif text-xl mt-1">Plan the week ahead.</h2>
                    <p className="text-xs text-[#858a7e] mt-1">Select a day to see a weather-based field reminder.</p>
                  </div>
                  <div className="flex self-start sm:self-auto rounded-lg bg-[#efeee6] p-1" aria-label="Temperature units">
                    <button type="button" aria-pressed={unit === 'C'} onClick={() => setUnit('C')} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${unit === 'C' ? 'bg-white shadow-sm' : ''}`}>°C</button>
                    <button type="button" aria-pressed={unit === 'F'} onClick={() => setUnit('F')} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${unit === 'F' ? 'bg-white shadow-sm' : ''}`}>°F</button>
                  </div>
                </div>

                {forecast.length === 0 ? (
                  <div data-testid="weather-empty" className="rounded-xl border border-dashed border-[#d6d5c9] bg-[#f8f7f0] p-6 text-center">
                    <Cloud size={24} className="mx-auto text-[#82906e]" />
                    <h3 className="mt-3 font-semibold text-[#40513e]">No five-day forecast available</h3>
                    <p className="mt-1 text-sm text-[#858a7e]">There isn’t a forecast for {snapshot.location} yet. Try refreshing later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2" data-testid="weather-forecast">
                    {forecast.map(day => (
                      <ForecastCard
                        key={day.date}
                        day={day}
                        unit={unit}
                        selected={day.date === selectedDay?.date}
                        onSelect={() => setSelectedDate(day.date)}
                      />
                    ))}
                  </div>
                )}
              </WeatherPanel>
            </div>

            <div className="space-y-5">
              <WeatherPanel>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Eyebrow>Farm-specific weather alerts</Eyebrow>
                    <h2 className="serif text-xl mt-1">Signals to watch.</h2>
                  </div>
                  <span className="rounded-full bg-[#f0f1e8] px-2.5 py-1 text-[10px] font-semibold text-[#64745e]">{alerts.length} alerts</span>
                </div>
                {alerts.length > 0 ? (
                  <div className="mt-4 space-y-2" data-testid="weather-alerts">
                    {alerts.map(alert => (
                      <div key={alert.id} data-testid={`weather-alert-${alert.kind}`} className={`flex items-start gap-3 rounded-xl border p-3 ${alert.tone === 'warning' ? 'border-[#ead6bd] bg-[#faf2e7]' : alert.tone === 'helpful' ? 'border-[#d9e4d0] bg-[#eef3e8]' : 'border-[#e3dfcc] bg-[#f7f3e9]'}`}>
                        <span className={`mt-0.5 ${alert.tone === 'warning' ? 'text-[#a17035]' : alert.tone === 'helpful' ? 'text-[#5d8055]' : 'text-[#8a774d]'}`}>
                          <AlertIcon kind={alert.kind} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#40513e]">{alert.title}</div>
                          <div className="mt-0.5 text-[10px] font-medium text-[#75806d]">{alert.timing}</div>
                          <p className="mt-1 text-xs leading-relaxed text-[#6f7969]">{alert.advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p data-testid="weather-no-alerts" className="mt-4 rounded-xl bg-[#f4f3ed] p-4 text-sm text-[#697363]">No specific weather alerts in this outlook. Keep checking local field conditions.</p>
                )}
              </WeatherPanel>

              {selectedDay && (
                <WeatherPanel data-testid="weather-selected-advice">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9edda] text-[#53724a]"><Sprout size={19} /></div>
                    <div><Eyebrow>Field reminder · {selectedDay.dayLabel}</Eyebrow><div className="mt-0.5 font-semibold text-[#40513e]">{selectedDay.condition}</div></div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#697363]">{getForecastFarmingAdvice(selectedDay)}</p>
                  <div className="mt-3 text-[10px] text-[#9a8b70]">General weather guidance only · check your soil and local conditions</div>
                </WeatherPanel>
              )}

              <WeatherPanel className="!bg-[#eef0e5] !border-[#dde1d2]">
                <Eyebrow>Weather and your crops</Eyebrow>
                <h3 className="serif text-xl mt-2">Small signals matter.</h3>
                <div className="mt-4 space-y-2">
                  {fieldChecks.map(check => {
                    const isReviewed = reviewed.includes(check.id);
                    return (
                      <button key={check.id} type="button" aria-pressed={isReviewed} onClick={() => toggleReviewed(check.id)} className="w-full flex items-center gap-3 rounded-xl p-3 text-left text-sm text-[#65705f] hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718b5d]">
                        <span>{check.icon}</span>
                        <span className="flex-1 min-w-0"><b>{check.title}</b><br /><span className="text-xs">{check.detail}</span></span>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-[#69815a]">{isReviewed && <Check size={12} />}{isReviewed ? 'Checked' : 'Mark checked'}</span>
                      </button>
                    );
                  })}
                </div>
                {reviewError && <p role="alert" className="text-xs text-[#a3483e] mt-3">{reviewError}</p>}
              </WeatherPanel>

              <div className="rounded-xl border border-dashed border-[#d6d5c9] p-4 text-xs leading-relaxed text-[#818578]">
                <b className="text-[#586451]">Data honesty:</b> Weather-based reminders are general guidance, not guaranteed agricultural advice. Confirm forecasts and decisions with local conditions.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WeatherMetric({ label, value, icon, testId }: { label: string; value: string; icon: ReactNode; testId?: string }) {
  return (
    <div className="flex min-h-[62px] items-center justify-center gap-2 px-2 py-2">
      <span className="shrink-0 text-[#71876a]">{icon}</span>
      <div className="min-w-0">
        <div data-testid={testId} className="truncate text-sm font-bold text-[#40513e]">{value}</div>
        <div className="text-[10px] text-[#8a8f82]">{label}</div>
      </div>
    </div>
  );
}

function ForecastCard({ day, unit, selected, onSelect }: { day: WeatherForecastDay; unit: TemperatureUnit; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${day.dayLabel} forecast`}
      aria-pressed={selected}
      data-testid={`weather-forecast-day-${day.dayLabel.toLowerCase()}`}
      onClick={onSelect}
      className={`min-w-0 rounded-xl border p-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718b5d] ${selected ? 'border-[#b8c6a7] bg-[#e9eddf]' : 'border-transparent bg-[#f4f3ed] hover:bg-[#edeee4]'}`}
    >
      <span className="text-xs font-semibold text-[#40513e]">{day.dayLabel}</span>
      <span className="my-3 flex justify-center text-[#b5864b]">{conditionIcon(day.icon)}</span>
      <span className="block truncate text-[10px] text-[#75806d]">{day.condition}</span>
      <span className="mt-2 block text-sm font-bold text-[#40513e]">
        {temperature(day.highC, unit)}° <span className="font-normal text-[#929588]">{temperature(day.lowC, unit)}°</span>
      </span>
      <span className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#7a8970]">
        <CloudRain size={11} />{day.rainfallProbabilityPercent}% · {day.expectedRainfallMm.toFixed(1)} mm
      </span>
    </button>
  );
}

export default WeatherIntelligence;