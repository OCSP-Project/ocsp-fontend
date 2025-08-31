import { useState, useEffect } from "react";
import { filterSupervisors, getSupervisorById } from "@/lib/api/supervisors";
import { SupervisorListItemDto, SupervisorDetailsDto } from "../types/supervisor.types";
import { SupervisorFilters } from "../components/SupervisorSearch/SupervisorSearch";

export const useSupervisors = () => {
  const [supervisors, setSupervisors] = useState<SupervisorListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSupervisors = async (filters: SupervisorFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await filterSupervisors({
        district: filters.district || undefined,
        minRating: filters.minRating || undefined,
        availableNow: filters.availableNow,
        priceMin: filters.priceMin || undefined,
        priceMax: filters.priceMax || undefined,
        page: 1,
        pageSize: 10,
      });
      setSupervisors(res.items);
    } catch (err) {
      console.error("Failed to load supervisors", err);
      setError("Không thể tải danh sách giám sát viên");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupervisors = async () => {
    await searchSupervisors({
      district: "",
      minRating: undefined,
      availableNow: false,
      priceMin: undefined,
      priceMax: undefined,
    });
  };

  useEffect(() => {
    loadSupervisors();
  }, []);

  return {
    supervisors,
    isLoading,
    error,
    searchSupervisors,
    loadSupervisors,
  };
};

export const useSupervisorProfile = (id: string) => {
  const [supervisor, setSupervisor] = useState<SupervisorDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      
      getSupervisorById(id)
        .then(setSupervisor)
        .catch((err) => {
          console.error("Failed to load supervisor", err);
          setError("Không thể tải thông tin giám sát viên");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  return {
    supervisor,
    isLoading,
    error,
  };
};
