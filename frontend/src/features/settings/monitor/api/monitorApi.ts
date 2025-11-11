import { baseApi } from '@/shared/api/baseApi';

export interface MonitorTagItem {
    _id: string;
    portName: string;
    portId: string;
    deviceName: string;
    deviceSlug: string;
    deviceId: string;
    tagName: string;
    category: string;
    value: number | string | boolean | null;
    unit: string;
    address: number;
    functionCode: string;
    dataType: string;
}

export interface MonitorResponse {
    success: boolean;
    count: number;
    data: MonitorTagItem[];
}

export const monitorApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMonitor: builder.query<MonitorTagItem[], void>({
            query: () => '/data/devices/tags/all',
            providesTags: ['Tags'],
            transformResponse: (response: MonitorResponse) => response.data,
        }),
    }),
});

export const { useGetMonitorQuery } = monitorApi;

