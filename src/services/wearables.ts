// ============================================================================
// Wearables Integration Service
// MoodMash - Connect with fitness trackers and health devices
// ============================================================================

import type {
  WearableDevice,
  WearableDataPoint,
  WearableSyncResult,
  SleepSession,
  HealthCorrelation
} from '../types/advanced';

// ============================================================================
// Wearables API Providers
// ============================================================================

interface WearableProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  endpoints: {
    profile: string;
    sleep: string;
    activity: string;
    heartRate: string;
  };
}

const PROVIDERS: Record<string, WearableProvider> = {
  fitbit: {
    name: 'Fitbit',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scopes: ['activity', 'heartrate', 'sleep', 'profile', 'weight'],
    endpoints: {
      profile: 'https://api.fitbit.com/1/user/-/profile.json',
      sleep: 'https://api.fitbit.com/1.2/user/-/sleep/date/{start_date}/{end_date}.json',
      activity: 'https://api.fitbit.com/1/user/-/activities/date/{date}.json',
      heartRate: 'https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d.json'
    }
  },
  google_fit: {
    name: 'Google Fit',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
      'https://www.googleapis.com/auth/fitness.body.read'
    ],
    endpoints: {
      profile: 'https://www.googleapis.com/fitness/v1/users/me/dataSources',
      sleep: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      activity: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      heartRate: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'
    }
  },
  oura: {
    name: 'Oura Ring',
    authUrl: 'https://cloud.ouraring.com/oauth-authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scopes: ['daily', 'heartrate', 'sleep'],
    endpoints: {
      profile: 'https://api.ouraring.com/v2/usercollection',
      sleep: 'https://api.ouraring.com/v2/sleep',
      activity: 'https://api.ouraring.com/v2/activity',
      heartRate: 'https://api.ouraring.com/v2/tmp'
    }
  },
  withings: {
    name: 'Withings',
    authUrl: 'https://account.withings.com/oauth2_user/authorize2',
    tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
    scopes: ['user.metrics', 'user.activity'],
    endpoints: {
      profile: 'https://wbsapi.withings.net/v2/user',
      sleep: 'https://wbsapi.withings.net/v2/sleep',
      activity: 'https://wbsapi.withings.net/v2/measure',
      heartRate: 'https://wbsapi.withings.net/v2/measure'
    }
  }
};

// ============================================================================
// Wearables Integration Service
// ============================================================================

export class WearablesService {
  private apiBase: string;

  constructor() {
    this.apiBase = '/api/wearables';
  }

  /**
   * Get all connected devices for a user
   */
  async getDevices(userId: string): Promise<WearableDevice[]> {
    try {
      const response = await fetch(`${this.apiBase}/devices?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error('[Wearables] Error fetching devices:', error);
      return [];
    }
  }

  /**
   * Connect a new wearable device
   */
  async connectDevice(
    userId: string,
    provider: string,
    authCode: string
  ): Promise<{ success: boolean; device?: WearableDevice; error?: string }> {
    try {
      const response = await fetch(`${this.apiBase}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, provider, auth_code: authCode })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Wearables] Error connecting device:', error);
      return { success: false, error: 'Failed to connect device' };
    }
  }

  /**
   * Disconnect a device
   */
  async disconnectDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, device_id: deviceId })
      });
      return response.ok;
    } catch (error) {
      console.error('[Wearables] Error disconnecting device:', error);
      return false;
    }
  }

  /**
   * Sync data from all connected devices
   */
  async syncAllDevices(userId: string): Promise<WearableSyncResult[]> {
    const results: WearableSyncResult[] = [];

    try {
      const devices = await this.getDevices(userId);
      const activeDevices = devices.filter(d => d.is_active);

      await Promise.all(
        activeDevices.map(async (device) => {
          const result = await this.syncDevice(userId, device.id);
          results.push(result);
        })
      );
    } catch (error) {
      console.error('[Wearables] Error syncing devices:', error);
    }

    return results;
  }

  /**
   * Sync data from a specific device
   */
  async syncDevice(userId: string, deviceId: string): Promise<WearableSyncResult> {
    try {
      const response = await fetch(`${this.apiBase}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, device_id: deviceId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Wearables] Error syncing device:', error);
      return {
        success: false,
        device_id: deviceId,
        data_points_synced: 0,
        last_sync_at: new Date().toISOString(),
        error: 'Sync failed'
      };
    }
  }

  /**
   * Get wearable data points
   */
  async getDataPoints(
    userId: string,
    options?: {
      deviceId?: string;
      dataType?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<WearableDataPoint[]> {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (options?.deviceId) params.append('device_id', options.deviceId);
      if (options?.dataType) params.append('data_type', options.dataType);
      if (options?.startDate) params.append('start_date', options.startDate);
      if (options?.endDate) params.append('end_date', options.endDate);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`${this.apiBase}/data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      return data.data_points || [];
    } catch (error) {
      console.error('[Wearables] Error fetching data:', error);
      return [];
    }
  }

  /**
   * Get sleep data from wearables
   */
  async getSleepData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SleepSession[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`${this.apiBase}/sleep?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sleep data');
      const data = await response.json();
      return data.sleep_sessions || [];
    } catch (error) {
      console.error('[Wearables] Error fetching sleep data:', error);
      return [];
    }
  }

  /**
   * Generate OAuth URL for device connection
   */
  generateAuthUrl(provider: string, redirectUri: string, state: string): string {
    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: '{CLIENT_ID}',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: providerConfig.scopes.join(' '),
      state
    });

    return `${providerConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Process raw wearable data into standardized format
   */
  processRawData(
    provider: string,
    rawData: Record<string, unknown>
  ): WearableDataPoint[] {
    const dataPoints: WearableDataPoint[] = [];

    switch (provider) {
      case 'fitbit':
        dataPoints.push(...this.processFitbitData(rawData));
        break;
      case 'google_fit':
        dataPoints.push(...this.processGoogleFitData(rawData));
        break;
      case 'oura':
        dataPoints.push(...this.processOuraData(rawData));
        break;
    }

    return dataPoints;
  }

  /**
   * Process Fitbit API response
   */
  private processFitbitData(rawData: Record<string, unknown>): WearableDataPoint[] {
    const dataPoints: WearableDataPoint[] = [];

    // Process heart rate data
    if (rawData['activities-heart']) {
      const heartData = rawData['activities-heart'] as Array<{
        dateTime: string;
        value: { restingHeartRate?: number; heartRateZones?: Array<{ name: string; min: number; max: number }> };
      }>;
      heartData.forEach(entry => {
        if (entry.value.restingHeartRate) {
          dataPoints.push({
            id: `fitbit_hr_${entry.dateTime}`,
            device_id: 'fitbit',
            user_id: '',
            data_type: 'heart_rate',
            value: entry.value.restingHeartRate,
            unit: 'bpm',
            timestamp: new Date(entry.dateTime).toISOString(),
            source: 'fitbit',
            created_at: new Date().toISOString()
          });
        }
      });
    }

    // Process sleep data
    if (rawData['sleep']) {
      const sleepData = rawData['sleep'] as Array<{
        dateOfSleep: string;
        duration: number;
        efficiency: number;
        levels?: { summary?: Record<string, { minutes: number }> };
      }>;
      sleepData.forEach(entry => {
        dataPoints.push({
          id: `fitbit_sleep_${entry.dateOfSleep}`,
          device_id: 'fitbit',
          user_id: '',
          data_type: 'sleep',
          value: {
            duration_minutes: entry.duration / 60000,
            efficiency: entry.efficiency,
            stages: entry.levels?.summary || {}
          },
          unit: 'minutes',
          timestamp: new Date(entry.dateOfSleep).toISOString(),
          source: 'fitbit',
          created_at: new Date().toISOString()
        });
      });
    }

    // Process activity data
    if (rawData['activities']) {
      const activityData = rawData['activities'] as Array<{
        date: string;
        steps: number;
        caloriesOut: number;
        distances: Array<{ activity: string; distance: number }>;
      }>;
      activityData.forEach(entry => {
        dataPoints.push({
          id: `fitbit_steps_${entry.date}`,
          device_id: 'fitbit',
          user_id: '',
          data_type: 'steps',
          value: entry.steps,
          unit: 'steps',
          timestamp: new Date(entry.date).toISOString(),
          source: 'fitbit',
          created_at: new Date().toISOString()
        });
      });
    }

    return dataPoints;
  }

  /**
   * Process Google Fit API response
   */
  private processGoogleFitData(rawData: Record<string, unknown>): WearableDataPoint[] {
    const dataPoints: WearableDataPoint[] = [];

    // Google Fit returns aggregated data
    if (rawData['bucket']) {
      const buckets = rawData['bucket'] as Array<{
        startTime: string;
        endTime: string;
        dataset: Array<{ dataSourceId: string; point: Array<{ value: Array<{ intVal?: number; fpVal?: number }> }> }>;
      }>;

      buckets.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
          if (dataset.dataSourceId.includes('heart_rate')) {
            const value = dataset.point[0]?.value[0]?.intVal;
            if (value) {
              dataPoints.push({
                id: `googlefit_hr_${bucket.startTime}`,
                device_id: 'google_fit',
                user_id: '',
                data_type: 'heart_rate',
                value,
                unit: 'bpm',
                timestamp: new Date(parseInt(bucket.startTime) / 1000000).toISOString(),
                source: 'google_fit',
                created_at: new Date().toISOString()
              });
            }
          }

          if (dataset.dataSourceId.includes('step_count')) {
            const value = dataset.point[0]?.value[0]?.intVal;
            if (value) {
              dataPoints.push({
                id: `googlefit_steps_${bucket.startTime}`,
                device_id: 'google_fit',
                user_id: '',
                data_type: 'steps',
                value,
                unit: 'steps',
                timestamp: new Date(parseInt(bucket.startTime) / 1000000).toISOString(),
                source: 'google_fit',
                created_at: new Date().toISOString()
              });
            }
          }
        });
      });
    }

    return dataPoints;
  }

  /**
   * Process Oura Ring API response
   */
  private processOuraData(rawData: Record<string, unknown>): WearableDataPoint[] {
    const dataPoints: WearableDataPoint[] = [];

    // Process sleep data
    if (Array.isArray(rawData['sleep'])) {
      const sleepData = rawData['sleep'] as Array<{
        date: string;
        duration: number;
        efficiency: number;
        deep_sleep_duration?: number;
        rem_sleep_in_bed?: number;
        light_sleep_duration?: number;
        awake_duration?: number;
        average_heart_rate?: number;
        hrv_balance?: number;
      }>;

      sleepData.forEach(entry => {
        dataPoints.push({
          id: `oura_sleep_${entry.date}`,
          device_id: 'oura',
          user_id: '',
          data_type: 'sleep',
          value: {
            duration_minutes: entry.duration / 60,
            sleep_score: entry.efficiency,
            stages: {
              deep_minutes: (entry.deep_sleep_duration || 0) / 60,
              light_minutes: (entry.light_sleep_duration || 0) / 60,
              rem_minutes: (entry.rem_sleep_in_bed || 0) / 60,
              awake_minutes: (entry.awake_duration || 0) / 60
            },
            metrics: {
              average_heart_rate: entry.average_heart_rate,
              hrv_balance: entry.hrv_balance
            }
          },
          unit: 'minutes',
          timestamp: new Date(entry.date).toISOString(),
          source: 'oura',
          created_at: new Date().toISOString()
        });
      });
    }

    // Process activity data
    if (Array.isArray(rawData['activity'])) {
      const activityData = rawData['activity'] as Array<{
        date: string;
        steps: number;
        active_time: number;
        calories: number;
      }>;

      activityData.forEach(entry => {
        dataPoints.push({
          id: `oura_activity_${entry.date}`,
          device_id: 'oura',
          user_id: '',
          data_type: 'steps',
          value: entry.steps,
          unit: 'steps',
          timestamp: new Date(entry.date).toISOString(),
          source: 'oura',
          created_at: new Date().toISOString()
        });
      });
    }

    return dataPoints;
  }
}

// ============================================================================
// Health Correlations Service
// ============================================================================

export class HealthCorrelationsService {
  /**
   * Calculate correlations between different health metrics
   */
  async calculateCorrelations(
    userId: string,
    metrics: Record<string, Array<{ date: string; value: number }>>
  ): Promise<HealthCorrelation[]> {
    const correlations: HealthCorrelation[] = [];

    const metricNames = Object.keys(metrics);

    // Calculate pairwise correlations
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = i + 1; j < metricNames.length; j++) {
        const metricA = metricNames[i];
        const metricB = metricNames[j];

        // Align data by date
        const alignedData = this.alignByDate(metrics[metricA], metrics[metricB]);

        if (alignedData.length >= 5) {
          const correlation = this.calculateCorrelation(
            alignedData.map(d => d.a),
            alignedData.map(d => d.b)
          );

          const strength = Math.abs(correlation);
          let correlationType: 'positive' | 'negative' | 'none' = 'none';
          if (strength > 0.3) {
            correlationType = correlation > 0 ? 'positive' : 'negative';
          }

          if (strength > 0.2) {
            correlations.push({
              metric_a: metricA,
              metric_b: metricB,
              correlation_type: correlationType,
              correlation_strength: correlation,
              sample_size: alignedData.length,
              time_range_days: this.calculateDateRange(alignedData.map(d => d.date)),
              description: this.generateCorrelationDescription(metricA, metricB, correlation),
              implications: this.generateImplications(metricA, metricB, correlation)
            });
          }
        }
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation_strength) - Math.abs(a.correlation_strength));
  }

  /**
   * Align two metric arrays by date
   */
  private alignByDate(
    dataA: Array<{ date: string; value: number }>,
    dataB: Array<{ date: string; value: number }>
  ): Array<{ date: string; a: number; b: number }> {
    const mapA = new Map(dataA.map(d => [d.date, d.value]));
    const mapB = new Map(dataB.map(d => [d.date, d.value]));

    const allDates = new Set([...mapA.keys(), ...mapB.keys()]);

    return Array.from(allDates)
      .filter(date => mapA.has(date) && mapB.has(date))
      .map(date => ({
        date,
        a: mapA.get(date)!,
        b: mapB.get(date)!
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate Pearson correlation
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate date range in days
   */
  private calculateDateRange(dates: string[]): number {
    if (dates.length < 2) return 0;
    const sorted = [...dates].sort();
    const start = new Date(sorted[0]);
    const end = new Date(sorted[sorted.length - 1]);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate human-readable correlation description
   */
  private generateCorrelationDescription(
    metricA: string,
    metricB: string,
    correlation: number
  ): string {
    const strength = Math.abs(correlation) > 0.6 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak';
    const direction = correlation > 0 ? 'positive' : 'negative';
    const formattedA = metricA.replace(/_/g, ' ');
    const formattedB = metricB.replace(/_/g, ' ');

    return `There is a ${strength} ${direction} relationship between ${formattedA} and ${formattedB}`;
  }

  /**
   * Generate implications based on correlation
   */
  private generateImplications(
    metricA: string,
    metricB: string,
    correlation: number
  ): string[] {
    const implications: string[] = [];
    const formattedA = metricA.replace(/_/g, ' ');
    const formattedB = metricB.replace(/_/g, ' ');

    if (correlation > 0) {
      implications.push(`Improving ${formattedA} may also improve ${formattedB}`);
      implications.push(`Focusing on ${formattedB} could positively impact ${formattedA}`);
    } else {
      implications.push(`Changes in ${formattedA} tend to inversely affect ${formattedB}`);
      implications.push(`When ${formattedA} increases, ${formattedB} typically decreases`);
    }

    return implications;
  }
}

// Create singleton instances
export const wearablesService = new WearablesService();
export const healthCorrelationsService = new HealthCorrelationsService();
