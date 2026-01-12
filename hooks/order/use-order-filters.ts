"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useOrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSort = searchParams.get("sort") || "date_desc";
  const activeStatuses =
    searchParams.get("status_filter")?.split(",").filter(Boolean) || [];

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      if (updates.status_filter || updates.sort) params.delete("page");

      router.push(`/admin/orders?${params.toString()}`);
    },
    [searchParams, router],
  );

  const toggleStatus = (status: string) => {
    const newStatuses = activeStatuses.includes(status)
      ? activeStatuses.filter((s) => s !== status)
      : [...activeStatuses, status];
    updateParams({
      status_filter: newStatuses.length > 0 ? newStatuses.join(",") : null,
    });
  };

  return {
    activeSort,
    activeStatuses,
    updateParams,
    toggleStatus,
  };
}
