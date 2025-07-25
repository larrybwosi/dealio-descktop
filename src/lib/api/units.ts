import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
// import { observable } from '@legendapp/state';
import { SystemUnit, UnitType } from '@/prisma/client';

const API_URL = '/units';


const fetchUnits = async (filter?: { type: UnitType }): Promise<SystemUnit[]> => {
  const params = filter ? { type: filter.type } : {};
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const useUnits = (type: UnitType) => {
  // const units$ = observable([]) ;
  const { data, isLoading, error } = useQuery({
    queryKey: ['units', type],
    queryFn: () => fetchUnits({type}),
  });

  return { units: data  , isLoading, error };
};


export interface CreateUnitOfMeasureInput {
  name: string;
  symbol: string;
  unitType?: UnitType;
  baseUnitId?: string;
  conversionFactor?: number;
  description?:string
}

export type UpdateUnitOfMeasureInput = Partial<CreateUnitOfMeasureInput>;

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  baseUnitId: string | null;
  conversionFactor: number | null;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}



/**
 * Hook to fetch units of measure for an organization using TanStack Query and Apiapi.
 * @param organizationId - The ID of the organization
 * @returns TanStack Query result with units of measure
 */
export function useUnitsOfMeasure() {
  return useQuery<UnitOfMeasure[], Error>({
    queryKey: ['unitsOfMeasure'],
    queryFn: async () => {
      const response = await api.get<UnitOfMeasure[]>(`/units-of-measure`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry failed requests up to 2 times
  }); 
}



// Hook to get all units of measure
export const useGetUnitsOfMeasure = () => {
  return useQuery<UnitOfMeasure[]>({
    queryKey: ['unitsOfMeasure'],
    queryFn: async () => {
      const { data } = await api.get(API_URL);
      return data;
    },
  });
};

// Hook to get a single unit of measure by ID
export const useGetUnitOfMeasure = (id: string) => {
    return useQuery<UnitOfMeasure>({
        queryKey: ['unitOfMeasure', id],
        queryFn: async () => {
            const { data } = await api.get(`${API_URL}/${id}`);
            return data;
        },
        enabled: !!id, // Only run the query if the id is available
    });
};

// Hook to create a new unit of measure
export const useCreateUnitOfMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newData: CreateUnitOfMeasureInput) => {
      const { data } = await api.post(API_URL, newData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the list of units to see the new one
      queryClient.invalidateQueries({ queryKey: ['unitsOfMeasure'] });
    },
  });
};

// Hook to update a unit of measure
export const useUpdateUnitOfMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateUnitOfMeasureInput) => {
      const { data } = await api.put(`${API_URL}/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['unitsOfMeasure'] });
        queryClient.invalidateQueries({ queryKey: ['unitOfMeasure', data.id] });
    },
  });
};

// Hook to delete a unit of measure
export const useDeleteUnitOfMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      // Invalidate the list query to remove the deleted item
      queryClient.invalidateQueries({ queryKey: ['unitsOfMeasure'] });
    },
  });
};