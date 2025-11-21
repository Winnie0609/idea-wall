/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type PaginationBarProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  className?: string;
};

export function PaginationBar({
  page,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (isPending) {
      setVisible(true);
      setProgress(0);

      timer = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 80) {
            return prev;
          }
          const next = prev + 4;
          return next > 80 ? 80 : next;
        });
      }, 160);
    } else if (!isPending && visible) {
      timer = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            window.clearInterval(timer);
            setTimeout(() => {
              setVisible(false);
              setProgress(0);
            }, 200);
            return 100;
          }
          const next = prev + 20;
          return next > 100 ? 100 : next;
        });
      }, 60);
    }

    return () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
    };
  }, [isPending, visible]);

  const safeTotalPages = totalPages > 0 ? totalPages : 1;
  const safePage = page < 1 ? 1 : page > safeTotalPages ? safeTotalPages : page;

  const canGoPrev = safePage > 1;
  const canGoNext = safePage < safeTotalPages;

  const setQuery = (nextPage: number, nextPageSize: number) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    params.set('pageSize', String(nextPageSize));
    const url = `${pathname}?${params.toString()}`;

    startTransition(() => {
      router.push(url);
    });
  };

  const handleFirstPage = () => {
    if (!canGoPrev) return;
    setQuery(1, pageSize);
  };

  const handlePrevPage = () => {
    if (!canGoPrev) return;
    setQuery(safePage - 1, pageSize);
  };

  const handleNextPage = () => {
    if (!canGoNext) return;
    setQuery(safePage + 1, pageSize);
  };

  const handleLastPage = () => {
    if (!canGoNext) return;
    setQuery(safeTotalPages, pageSize);
  };

  const handlePageSizeChange = (value: string) => {
    const nextPageSize = Number.parseInt(value, 10);
    const normalized =
      Number.isFinite(nextPageSize) && nextPageSize > 0
        ? nextPageSize
        : pageSize;
    setQuery(1, normalized);
  };

  return (
    <>
      {visible && (
        <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
          <div
            className="loading-bar h-full rounded-full bg-amber-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div
        className={cn(
          'flex w-full flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Rows per page
          </span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger aria-label="Rows per page">
              <SelectValue aria-label={`${pageSize} rows per page`} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap text-[11px] text-zinc-500 dark:text-zinc-400 sm:inline">
            Page {safePage} of {safeTotalPages}
          </span>
          <span className="inline whitespace-nowrap text-[11px] text-zinc-500 dark:text-zinc-400 sm:hidden">
            {safePage} / {safeTotalPages}
          </span>
          <span className="hidden text-[11px] text-zinc-500 dark:text-zinc-400 sm:inline">
            ({totalItems} items)
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to first page"
              onClick={handleFirstPage}
              disabled={!canGoPrev}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to previous page"
              onClick={handlePrevPage}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to next page"
              onClick={handleNextPage}
              disabled={!canGoNext}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to last page"
              onClick={handleLastPage}
              disabled={!canGoNext}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
