import { baseApi } from '@/shared/api/baseApi';

export interface DeviceDataValue {
    value: number | string | boolean | null;
    unit?: string;
    isAlarm?: boolean;
}

export interface DeviceData {
    [category: string]: {
        [tagName: string]: DeviceDataValue;
    };
}

export interface DeviceDataResponse {
    name: string;
    slug: string;
    slaveId: number;
    lastUpdated: string | null;
    isResponding: boolean;
    data: DeviceData | null;
}

export const deviceDataApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDeviceData: builder.query<DeviceDataResponse, string>({
            query: (deviceSlug) => `/data/devices/${deviceSlug}`,
            providesTags: (_result, _error, deviceSlug) => [{ type: 'DeviceData', id: deviceSlug }],
        }),
    }),
});

export const { useGetDeviceDataQuery } = deviceDataApi;

