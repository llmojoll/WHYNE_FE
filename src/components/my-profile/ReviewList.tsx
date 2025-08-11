import React, { useEffect, useRef, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getMyReviews } from '@/api/myReviews';
import DotIcon from '@/assets/icons/dot.svg';
import StarIcon from '@/assets/icons/star.svg';
import { MyCard } from '@/components/common/card/MyCard';
import MenuDropdown from '@/components/common/dropdown/MenuDropdown';
import DeleteModal from '@/components/Modal/DeleteModal/DeleteModal';
import EditReviewModal from '@/components/Modal/ReviewModal/EditReviewModal';
import { Badge } from '@/components/ui/badge';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MyReview } from '@/types/MyReviewsTypes';

import MyPageEmpty from './Empty';

const PAGE_LIMIT = 10;

interface ReviewListProps {
  setTotalCount: (count: number) => void;
}

/**
 * ReviewList 컴포넌트
 *
 * - 무한 스크롤로 사용자 리뷰를 페이지 단위로 로드
 * - IntersectionObserver를 사용해 하단 감지
 * - fetch 시 스크롤 튐 현상을 방지하기 위한 보정 로직 포함
 */
export function ReviewList({ setTotalCount }: ReviewListProps) {
  const [editReview, setEditReview] = useState<MyReview | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null); // 옵저버 대상 요소

  // 무한 스크롤 쿼리 세팅
  const { data, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    {
      queryKey: ['reviews'],
      queryFn: ({ pageParam = 0 }) => getMyReviews({ cursor: pageParam, limit: PAGE_LIMIT }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    },
  );

  // 전체 리뷰 수 설정
  useEffect(() => {
    if (data?.pages?.[0]?.totalCount != null) {
      setTotalCount(data.pages[0].totalCount);
    }
  }, [data, setTotalCount]);

  // IntersectionObserver 감지 로직 연결
  useInfiniteScroll({
    targetRef: observerRef,
    hasNextPage,
    fetchNextPage,
    isFetching: isFetchingNextPage,
  });

  if (isError) throw error;

  //  정렬: 최신순 (createdAt 기준 내림차순)
  const reviews: MyReview[] = data?.pages?.flatMap((page) => page?.list ?? []) ?? [];

  //  빈 목록 처리
  if (!data || !data.pages) {
    return null; // 아직 로딩 중이면 아무것도 안 보여줌
  }

  const isEmpty = data.pages[0].list.length === 0;

  if (!isFetchingNextPage && isEmpty) {
    return <MyPageEmpty type='reviews' />;
  }

  return (
    <div className='space-y-4 mt-4'>
      {reviews.map((review) => (
        <MyCard
          key={review.id}
          rating={
            <Badge variant='star'>
              <span className='flex items-center gap-[2px] w-full h-full'>
                <StarIcon className='w-[14px] h-[13px] pb-[2px]' />
                {review.rating.toFixed(1)}
              </span>
            </Badge>
          }
          timeAgo={new Date(review.createdAt).toLocaleDateString()}
          title={review.user.nickname}
          review={review.content}
          rightSlot={
            <MenuDropdown
              trigger={
                <button className='w-6 h-6 text-gray-500 hover:text-primary transition-colors'>
                  <DotIcon />
                </button>
              }
              options={[
                { label: '수정하기', value: 'edit' },
                { label: '삭제하기', value: 'delete' },
              ]}
              onSelect={(value) => {
                if (value === 'edit') {
                  setEditReview(review);
                } else if (value === 'delete') {
                  setDeleteReviewId(review.id);
                }
              }}
            />
          }
        />
      ))}

      {/*  리뷰 수정 모달 */}
      {editReview && (
        <EditReviewModal
          wineName={editReview.wine.name}
          reviewData={editReview}
          showEditModal={!!editReview}
          setShowEditModal={(open) => {
            if (!open) setEditReview(null);
          }}
        />
      )}

      {/*  리뷰 삭제 모달 */}
      {deleteReviewId !== null && (
        <DeleteModal
          type='review'
          id={deleteReviewId}
          showDeleteModal={true}
          setShowDeleteModal={(open) => {
            if (!open) setDeleteReviewId(null);
          }}
        />
      )}

      {/*  옵저버가 감지할 요소 */}
      <div ref={observerRef} className='w-full h-4' />
    </div>
  );
}
