import { useQuery } from '@tanstack/react-query'
import { challengeService } from '@/services/challenge'
import { queryKeys } from '@/lib/queryClient'

// Search functionality
export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => challengeService.search(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    // Debounce search by using a slightly longer stale time for frequently changing queries
    placeholderData: (previousData) => previousData,
  })
}