// src/hooks/useOrganizationAttendance.ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios from 'axios'; // Or use native fetch

// Define the structure of an individual attendance record based on your API response
// This should align with what `getAllMembersAttendanceForOrganization` returns,
// especially the `member.user` structure.
export interface OrganizationAttendanceRecord {
  id: string; // AttendanceLog ID
  checkInTime: string; // ISO Date string
  checkOutTime?: string | null; // ISO Date string
  durationMinutes?: number | null;
  notes?: string | null;
  member: {
    id: string; // Member ID
    user: {
      name: string;
      email: string;
      // Add other user fields like avatarUrl if available
    };
    // position?: string; // If you later add 'position' to the API response
  };
  checkInLocation?: { id: string; name: string }; // Optional, if needed
  checkOutLocation?: { id: string; name: string }; // Optional, if needed
}

/**
 * Fetches organization-wide attendance records for a given period.
 * The API endpoint /api/attendance is assumed to derive organizationId from server-side auth.
 */
const fetchOrganizationAttendance = async (
  periodStart: Date,
  periodEnd: Date
): Promise<OrganizationAttendanceRecord[]> => {
  const params = {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };

  // The Next.js GET handler at /api/attendance (or similar path)
  // will use these searchParams.
  const response = await axios.get('/api/attendance', { params });
  return response.data;
};

/**
 * Custom TanStack Query hook to get organization attendance records.
 * @param periodStart - The start of the period for fetching records.
 * @param periodEnd - The end of the period for fetching records.
 * @param options - Optional TanStack Query options, e.g., { enabled: boolean }.
 */
export const useOrganizationAttendance = (
  periodStart: Date,
  periodEnd: Date,
  options?: { enabled?: boolean }
): UseQueryResult<OrganizationAttendanceRecord[], Error> => {
  return useQuery<OrganizationAttendanceRecord[], Error>({
    // The queryKey should uniquely identify this query.
    // Adding periodStart and periodEnd ensures refetching when dates change.
    queryKey: ['organizationAttendance', periodStart.toISOString(), periodEnd.toISOString()],
    queryFn: () => fetchOrganizationAttendance(periodStart, periodEnd),
    // Control query execution, e.g., disable if dates are not yet valid.
    enabled: options?.enabled !== undefined ? options.enabled : true,
    // You might want to add staleTime or cacheTime configuration here.
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
