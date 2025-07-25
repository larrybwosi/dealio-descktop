import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface MemberDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string;
}

const fetchDocuments = async (memberId: string): Promise<MemberDocument[]> => {
  const { data } = await axios.get(`/api/members/${memberId}/documents`);
  return data;
};

const uploadDocument = async ({ memberId, file }: { memberId: string; file: File }): Promise<MemberDocument> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`/api/members/${memberId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const useMemberDocuments = (memberId: string) => {
  return useQuery({
    queryKey: ['documents', memberId],
    queryFn: () => fetchDocuments(memberId),
    enabled: !!memberId,
  });
};

export const useUploadDocument = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadDocument({ memberId, file }),
    onSuccess: () => {
      // Invalidate and refetch the documents query to show the new document
      queryClient.invalidateQueries({ queryKey: ['documents', memberId] });
    },
  });
};
