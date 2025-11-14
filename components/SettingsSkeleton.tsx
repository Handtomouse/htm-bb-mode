"use client";

import { motion } from "framer-motion";

export default function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden"
        >
          {/* Header Skeleton */}
          <div className="px-6 py-4">
            <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
          </div>

          {/* Content Skeleton */}
          <div className="px-6 pb-6 pt-2">
            <div className="space-y-5">
              {/* Setting row 1 */}
              <div>
                <div className="h-3 w-24 bg-white/10 mb-2.5 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-11 flex-1 bg-white/5 animate-pulse rounded" />
                  <div className="h-11 flex-1 bg-white/5 animate-pulse rounded" />
                  <div className="h-11 flex-1 bg-white/5 animate-pulse rounded" />
                </div>
              </div>

              {/* Setting row 2 */}
              <div>
                <div className="h-3 w-28 bg-white/10 mb-2.5 animate-pulse rounded" />
                <div className="h-1 w-full bg-white/5 animate-pulse rounded-full" />
              </div>

              {/* Setting row 3 */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-white/10 animate-pulse rounded" />
                <div className="h-6 w-12 bg-white/10 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Shimmer effect CSS (can add to globals.css if preferred)
// Uses a subtle gradient animation for the pulse effect
