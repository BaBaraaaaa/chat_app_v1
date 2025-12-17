import { useEffect, useRef } from 'react';

/**
 * Hook để quản lý việc leave conversation rooms khi không cần thiết
 * Giúp tối ưu performance và giảm socket connections
 */
export const useConversationCleanup = (
  joinedConversations: Set<string>,
  currentConversationId: string | null,
  maxActiveConversations = 5
) => {
  const lastActiveRef = useRef<Map<string, number>>(new Map());
  const cleanupTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Update last active time for current conversation
    if (currentConversationId) {
      lastActiveRef.current.set(currentConversationId, Date.now());
    }

    // Cleanup old conversations periodically
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    cleanupTimeoutRef.current = setTimeout(() => {
      const now = Date.now();
      const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const conversationsToLeave: string[] = [];

      // Find conversations to leave (inactive for > 5 minutes)
      for (const [convId, lastActive] of lastActiveRef.current.entries()) {
        if (
          convId !== currentConversationId &&
          now - lastActive > INACTIVE_THRESHOLD &&
          joinedConversations.has(convId)
        ) {
          conversationsToLeave.push(convId);
        }
      }

      // Keep only most recent conversations if too many are active
      if (joinedConversations.size > maxActiveConversations) {
        const sortedConversations = Array.from(lastActiveRef.current.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(maxActiveConversations)
          .map(([convId]) => convId);

        conversationsToLeave.push(...sortedConversations);
      }

      // Leave inactive conversations
      conversationsToLeave.forEach(convId => {
        if (joinedConversations.has(convId)) {
          // TODO: Implement leave conversation logic
          joinedConversations.delete(convId);
          lastActiveRef.current.delete(convId);
        }
      });
    }, 60000); // Check every minute

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [currentConversationId, joinedConversations, maxActiveConversations]);

  return {
    markConversationActive: (convId: string) => {
      lastActiveRef.current.set(convId, Date.now());
    },
    getActiveConversations: () => Array.from(lastActiveRef.current.keys()),
  };
};