import { apiGet } from "./client";
import type {
  Area,
  CityStatus,
  ComplaintItem,
  ComplaintSummary,
  District,
  DistrictSummary,
  JobGoal,
  NewsItem,
  Pledge,
  PopulationResponse,
  RankedDistrict,
  RealEstate,
  SnsPost,
} from "./types";

export const dashboardApi = {
  areas: () => apiGet<Area[]>("/api/areas"),
  districts: () => apiGet<District[]>("/api/districts"),
  topDistricts: (limit = 5) => apiGet<RankedDistrict[]>(`/api/districts/top?limit=${limit}`),
  districtSummary: (id: number, days: number) =>
    apiGet<DistrictSummary>(`/api/districts/${id}/summary?days=${days}`),
  complaintSummary: (days: number) => apiGet<ComplaintSummary>(`/api/complaints/summary?days=${days}`),
  recentComplaints: (params: { limit?: number; department?: string; districtId?: number } = {}) => {
    const search = new URLSearchParams();
    search.set("limit", String(params.limit ?? 12));
    if (params.department) search.set("department", params.department);
    if (params.districtId != null) search.set("district_id", String(params.districtId));
    return apiGet<ComplaintItem[]>(`/api/complaints/recent?${search.toString()}`);
  },
  population: (year: number) => apiGet<PopulationResponse>(`/api/population?year=${year}`),
  jobs: () => apiGet<JobGoal[]>("/api/jobs"),
  pledges: () => apiGet<Pledge[]>("/api/pledges"),
  sns: (channel: "youtube" | "blog") => apiGet<SnsPost[]>(`/api/sns?channel=${channel}`),
  news: (limit = 3) => apiGet<NewsItem[]>(`/api/news?limit=${limit}`),
  city: () => apiGet<CityStatus>("/api/city"),
  realestate: () => apiGet<RealEstate>("/api/realestate"),
};
