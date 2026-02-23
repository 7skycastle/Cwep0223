'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ViewTrackerProps {
  ideaId: string
  userId?: string
}

export function ViewTracker({ ideaId, userId }: ViewTrackerProps) {
  const supabase = createClient()

  useEffect(() => {
    const trackView = async () => {
      // 이미 조회한 경우 중복 카운트 방지 (세션 기반)
      const viewKey = `viewed_${ideaId}`
      if (sessionStorage.getItem(viewKey)) return

      try {
        await supabase.rpc('increment_idea_views', {
          p_idea_id: ideaId,
          p_viewer_id: userId || null,
        })
        sessionStorage.setItem(viewKey, '1')
      } catch (err) {
        // 조회수 추적 실패해도 페이지 표시에는 영향 없음
        console.error('View tracking failed:', err)
      }
    }

    trackView()
  }, [ideaId, userId, supabase])

  return null
}
