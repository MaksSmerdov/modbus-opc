import { baseApi } from '@/shared/api/baseApi';

export interface Commit {
  hash: string;
  fullHash: string;
  subject: string;
  author: string;
  date: string;
  body: string;
}

export interface VersionInfo {
  version: string;
  lastCommit: string;
  lastCommitMessage: string;
  tags: string[];
  commits: Commit[];
}

interface VersionInfoResponse {
  success: true;
  data: VersionInfo;
}

export const infoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVersionInfo: builder.query<VersionInfo, void>({
      query: () => '/info/version',
      transformResponse: (response: VersionInfoResponse) => response.data,
    }),
  }),
});

export const { useGetVersionInfoQuery } = infoApi;
