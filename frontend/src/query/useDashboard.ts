import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export function useAreas() {
  return useQuery({ queryKey: ["areas"], queryFn: dashboardApi.areas, staleTime: 60_000 });
}

export function useDistricts() {
  return useQuery({ queryKey: ["districts"], queryFn: dashboardApi.districts, staleTime: 60_000 });
}

export function useTopDistricts() {
  return useQuery({ queryKey: ["districts", "top"], queryFn: () => dashboardApi.topDistricts(5) });
}

export function useDistrictSummary(id: number | null, days: number) {
  return useQuery({
    queryKey: ["district", id, days],
    queryFn: () => dashboardApi.districtSummary(id as number, days),
    enabled: id != null,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useComplaintSummary(days: number) {
  return useQuery({
    queryKey: ["complaints", "summary", days],
    queryFn: () => dashboardApi.complaintSummary(days),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useRecentComplaints(params: { limit?: number; department?: string; districtId?: number }) {
  return useQuery({
    queryKey: ["complaints", "recent", params],
    queryFn: () => dashboardApi.recentComplaints(params),
    refetchInterval: 15_000,
  });
}

export function usePopulation(year: number) {
  return useQuery({
    queryKey: ["population", year],
    queryFn: () => dashboardApi.population(year),
    placeholderData: keepPreviousData,
  });
}

export function useJobs() {
  return useQuery({ queryKey: ["jobs"], queryFn: dashboardApi.jobs, staleTime: 60_000 });
}

export function usePledges() {
  return useQuery({ queryKey: ["pledges"], queryFn: dashboardApi.pledges, staleTime: 60_000 });
}

export function useSns(channel: "youtube" | "blog") {
  return useQuery({
    queryKey: ["sns", channel],
    queryFn: () => dashboardApi.sns(channel),
    placeholderData: keepPreviousData,
  });
}

export function useNews(limit = 3) {
  return useQuery({ queryKey: ["news", limit], queryFn: () => dashboardApi.news(limit), staleTime: 60_000 });
}

export function useCity() {
  return useQuery({
    queryKey: ["city"],
    queryFn: dashboardApi.city,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });
}

export function useRealEstate() {
  return useQuery({ queryKey: ["realestate"], queryFn: dashboardApi.realestate, staleTime: 60_000 });
}
