import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertContentItem, type ContentItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useContent() {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.content.list.path],
    queryFn: async () => {
      const res = await fetch(api.content.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch content");
      return api.content.list.responses[200].parse(await res.json());
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useContentItem(id: number | null) {
  return useQuery({
    queryKey: [api.content.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.content.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch content item");
      return api.content.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual items
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertContentItem) => {
      const res = await fetch(api.content.create.path, {
        method: api.content.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.content.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create content");
      }
      return api.content.create.responses[201].parse(await res.json());
    },
    onMutate: async (newContent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [api.content.list.path] });

      // Snapshot the previous value
      const previousContent = queryClient.getQueryData([api.content.list.path]);

      // Optimistically update to the new value
      queryClient.setQueryData([api.content.list.path], (old: ContentItem[] | undefined) => {
        if (!old) return [];
        const optimisticItem: ContentItem = {
          id: Date.now(), // Temporary ID
          createdAt: new Date(),
          updatedAt: new Date(),
          ...newContent,
          userId: newContent.userId || 'temp', // Ensure userId is set
        } as ContentItem;
        return [optimisticItem, ...old];
      });

      return { previousContent };
    },
    onError: (error, newContent, context) => {
      // Rollback on error
      if (context?.previousContent) {
        queryClient.setQueryData([api.content.list.path], context.previousContent);
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: [api.content.list.path] });
      toast({ title: "Success", description: "Content created successfully" });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertContentItem>) => {
      const url = buildUrl(api.content.update.path, { id });
      const res = await fetch(url, {
        method: api.content.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update content");
      }
      return api.content.update.responses[200].parse(await res.json());
    },
    onMutate: async ({ id, ...updates }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: [api.content.list.path] });
      await queryClient.cancelQueries({ queryKey: [api.content.get.path, id] });

      // Snapshot previous values
      const previousList = queryClient.getQueryData([api.content.list.path]);
      const previousItem = queryClient.getQueryData([api.content.get.path, id]);

      // Optimistically update
      queryClient.setQueryData([api.content.list.path], (old: ContentItem[] | undefined) => {
        if (!old) return [];
        return old.map(item => 
          item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
        );
      });

      queryClient.setQueryData([api.content.get.path, id], (old: ContentItem | undefined) => {
        if (!old) return old;
        return { ...old, ...updates, updatedAt: new Date() };
      });

      return { previousList, previousItem };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousList) {
        queryClient.setQueryData([api.content.list.path], context.previousList);
      }
      if (context?.previousItem) {
        queryClient.setQueryData([api.content.get.path, id], context.previousItem);
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.content.list.path] });
      toast({ title: "Updated", description: "Content updated successfully" });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.content.delete.path, { id });
      const res = await fetch(url, { 
        method: api.content.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete content");
      return id;
    },
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: [api.content.list.path] });

      // Snapshot
      const previousContent = queryClient.getQueryData([api.content.list.path]);

      // Optimistically remove
      queryClient.setQueryData([api.content.list.path], (old: ContentItem[] | undefined) => {
        if (!old) return [];
        return old.filter(item => item.id !== id);
      });

      return { previousContent };
    },
    onError: (error, id, context) => {
      // Rollback
      if (context?.previousContent) {
        queryClient.setQueryData([api.content.list.path], context.previousContent);
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.content.list.path] });
      toast({ title: "Deleted", description: "Content item removed" });
    },
  });
}

export function useSyncGoogleCalendar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/google/sync/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to sync to Google Calendar");
      }
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.content.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.content.get.path, id] });
      toast({ 
        title: "Synced", 
        description: "Content successfully synced to Google Calendar",
        variant: "default" 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Sync Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
