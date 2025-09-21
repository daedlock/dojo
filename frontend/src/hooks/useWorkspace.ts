import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService } from '@/services/workspace'
import { queryKeys } from '@/lib/queryClient'
import { useUIStore } from '@/stores'
import { useEffect } from 'react'

// Get workspace iframe URL
export function useWorkspace(
  params: {
    user?: string
    password?: string
    service?: string
    challenge?: string
    theme?: string
  } = {},
  enabled = true
) {
  const fetchActiveChallenge = useUIStore(state => state.fetchActiveChallenge)

  const query = useQuery({
    queryKey: queryKeys.workspace(params),
    queryFn: () => workspaceService.getWorkspace(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for workspace data
    refetchInterval: (query) => {
      // Refetch every 30 seconds if workspace is active but iframe_src is missing
      const data = query.state.data
      if (data?.active && !data?.iframe_src) {
        return 30 * 1000
      }
      return false
    },
  })

  // Automatically update active challenge state when workspace data changes
  useEffect(() => {
    if (query.data) {
      fetchActiveChallenge()
    }
  }, [query.data, fetchActiveChallenge])

  return query
}

// Reset home directory
export function useResetHome() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => workspaceService.resetHome(),
    onSuccess: () => {
      // Invalidate workspace queries after reset
      queryClient.invalidateQueries({ 
        queryKey: ['workspace'] 
      })
    },
  })
}