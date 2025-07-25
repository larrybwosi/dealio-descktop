import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, useOrgStore } from '@/lib/tanstack-axios';
import { MemberRole } from '@/prisma/client';

interface Member {
  id: string;
  name: string;
  email: string;
  username: string;
  role: MemberRole;
  customRoles: string[];
  isActive: boolean;
  image?: string | null;
  lastActive?: string;
  status?: string;
  tags?: string[];
}

// Members
export const useListMembers = () => {
  const organizationId = useOrgStore(state => state.organizationId);
  const { data, refetch, error, isLoading } = useQuery<ApiResponse<Member[]>, Error>({
    queryKey: ['members', organizationId],
    queryFn: () => apiClient.members.list(organizationId!),
    enabled: !!organizationId,
  });

  return { data: data?.data?.members as Member[] || [], isLoading, isError: !data && !!organizationId, error, refetch };
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Member>, Error, Partial<Member>>({
    mutationFn: data => apiClient.members.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
    },
  });
};

export const useUpdateMember = (memberId: string) => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<Member>, Error, Partial<Member>>({
    mutationFn: data => apiClient.members.update(organizationId!, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['member', organizationId, memberId] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const organizationId = useOrgStore(state => state.organizationId);

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: memberId => apiClient.members.delete(organizationId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
    },
  });
};

export const useGetMember = (memberId: string) => {
  const organizationId = useOrgStore(state => state.organizationId);
  return useQuery<ApiResponse<Member>, Error>({
    queryKey: ['member', organizationId, memberId],
    queryFn: () => apiClient.members.get(organizationId!, memberId),
    enabled: !!organizationId && !!memberId,
  });
};

export interface Employee {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  age: string;
  position: string;
  department: string;
  employeeId: string;
  email: string;
  address: string;
  phone: string;
  createdAt: string;
  tags: string[];
  avatar?: string;
}

export interface Attendance {
  month: string;
  onTime: number;
  onLate: number;
}

// Mock data
const mockEmployee: Employee = {
  id: '1',
  name: 'Leslie Alexander',
  status: 'Active',
  gender: 'Female',
  age: '32 yrs',
  position: 'Sr. Project Manager',
  department: 'Product & Development',
  employeeId: 'EMP-20241008-007',
  email: 'lesliealexander@mail.com',
  address: '9458 Main Street, Apt 58, Springfield, United States',
  phone: '+1 830 4824 9321',
  createdAt: '2023-08-12T10:00:00Z',
  tags: ['Project Manager', 'Product', 'Development'],
  avatar: '/api/placeholder/50/50',
};

const mockAttendance: Attendance[] = [
  { month: 'Jan', onTime: 85, onLate: 15 },
  { month: 'Feb', onTime: 75, onLate: 25 },
  { month: 'Mar', onTime: 90, onLate: 10 },
  { month: 'Apr', onTime: 88, onLate: 12 },
  { month: 'May', onTime: 82, onLate: 18 },
  { month: 'Jun', onTime: 95, onLate: 5 },
];

// TanStack Query functions
const fetchEmployee = async (id: string): Promise<{ employee: Employee; attendance: Attendance[] }> => {
  console.log(`Fetching employee with id: ${id}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 3500));
  return { employee: mockEmployee, attendance: mockAttendance };
};

const saveEmployee = async (employee: Employee): Promise<Employee> => {
  console.log('Saving employee:', employee);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return employee;
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployee(id),
  });
};

export const useSaveEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEmployee,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['employee', variables.id], (oldData: any) => ({
        ...oldData,
        employee: data,
      }));
    },
  });
};