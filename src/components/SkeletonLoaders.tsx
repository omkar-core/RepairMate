import React from 'react';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-zinc-800/80 ${className}`}
    />
  );
}

export function LandingPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading landing page"
      className="flex flex-col items-center justify-start min-h-screen bg-zinc-950 text-white p-6 relative overflow-y-auto"
    >
      <span className="sr-only">Loading…</span>
      <div className="w-full max-w-4xl flex flex-col items-center text-center mt-12 mb-20">
        <Skeleton className="w-24 h-24 rounded-3xl mb-8" />
        <Skeleton className="w-64 h-9 rounded-full mb-10" />
        <Skeleton className="w-full max-w-2xl h-14 mb-4" />
        <Skeleton className="w-3/5 max-w-lg h-14 mb-10" />
        <Skeleton className="w-[40%] h-6 mb-10" />
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center mb-12">
          <Skeleton className="flex-1 h-28 rounded-2xl" />
          <Skeleton className="flex-1 h-28 rounded-2xl" />
        </div>
        <div className="w-full max-w-lg mb-20">
          <Skeleton className="w-full h-4 mb-6" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="w-full h-20 rounded-2xl" />
            <Skeleton className="w-full h-20 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="w-64 h-7 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Skeleton className="w-full h-48 rounded-3xl" />
          <Skeleton className="w-full h-48 rounded-3xl" />
          <Skeleton className="w-full h-48 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function CameraCaptureSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading camera"
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <span className="sr-only">Loading camera…</span>
      <div className="flex justify-between items-center p-5 z-10">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-32 h-6 rounded-xl" />
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative w-72 h-72">
          <div className="absolute -top-1 -left-1 w-10 h-10 rounded-tl-[2rem] border-t-4 border-l-4 border-zinc-700"></div>
          <div className="absolute -top-1 -right-1 w-10 h-10 rounded-tr-[2rem] border-t-4 border-r-4 border-zinc-700"></div>
          <div className="absolute -bottom-1 -left-1 w-10 h-10 rounded-bl-[2rem] border-b-4 border-l-4 border-zinc-700"></div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-br-[2rem] border-b-4 border-r-4 border-zinc-700"></div>
          <div className="absolute inset-0 rounded-[2rem] border border-zinc-800"></div>
        </div>
        <div className="absolute bottom-24 w-56 h-8 rounded-full bg-zinc-900" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center pb-12">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    </div>
  );
}

export function LoadingScreenSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading analysis"
      className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden"
    >
      <span className="sr-only">Loading…</span>
      <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-800 animate-pulse"></div>
        <div className="absolute inset-4 rounded-full border border-zinc-700 animate-pulse"></div>
        <Skeleton className="w-16 h-16 rounded-2xl" />
      </div>
      <Skeleton className="w-72 h-8 mb-2" />
      <Skeleton className="w-48 h-5" />
      <div className="mt-12 flex gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
      </div>
    </div>
  );
}

export function AnalysisDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading analysis results"
      className="flex flex-col gap-6 w-full max-w-6xl mx-auto relative pb-12"
    >
      <span className="sr-only">Loading analysis results…</span>
      <div className="flex justify-end gap-2">
        <Skeleton className="w-32 h-10 rounded-xl" />
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 shrink-0">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <div className="flex-1 w-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="w-28 h-7 rounded-full" />
              <Skeleton className="w-20 h-7 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-12" />
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-full h-28 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-40 h-6" />
            </div>
            <div className="space-y-3">
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-2/3 h-12 rounded-xl" />
            </div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-48 h-6" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="w-24 h-8 rounded-lg" />
              <Skeleton className="w-32 h-8 rounded-lg" />
              <Skeleton className="w-20 h-8 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-48 h-7" />
            </div>
            <Skeleton className="w-36 h-9 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="flex-1 h-16 rounded-2xl" />
            </div>
            <div className="flex items-start gap-6">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="flex-1 h-16 rounded-2xl" />
            </div>
            <div className="flex items-start gap-6">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="flex-1 h-16 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}