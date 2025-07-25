import { useQuery } from '@tanstack/react-query';
import apiClient from '../axios';

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string | null;
  durationMinutes?: number | null;
  checkInLocation?: {
    id: string;
    name: string;
  } | null;
  checkOutLocation?: {
    id: string;
    name: string;
  } | null;
  member?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
    position?: string | null;
    department?: string | null;
  };
}

export async function getMemberAttendance(
  memberId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<AttendanceRecord[]> {
  try {
    const response = await apiClient.get('/attendance/member', {
      params: {
        memberId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching member attendance:', error);
    return [];
  }
}

export function useMemberAttendance(
  organizationId: string,
  memberId: string,
  periodStart: Date,
  periodEnd: Date,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: ['memberAttendance', organizationId, memberId, periodStart.toISOString(), periodEnd.toISOString()],
    queryFn: () => getMemberAttendance( memberId, periodStart, periodEnd),
    enabled: options?.enabled !== false && !!(organizationId && memberId),
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
