import React, { useEffect, useRef, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getMyWines } from '@/api/myWines';
import DotIcon from '@/assets/icons/dot.svg';
import { ImageCard } from '@/components/common/card/ImageCard';
import MenuDropdown from '@/components/common/dropdown/MenuDropdown';
import { Badge } from '@/components/ui/badge';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

import MyPageEmpty from './Empty';
import DeleteModal from '../Modal/DeleteModal/DeleteModal';
import EditWineModal from '../Modal/WineModal/EditWineModal';

import type { MyWine, MyWinesResponse } from '@/types/MyWinesTypes';

const PAGE_LIMIT = 10;

interface WineListProps {
  setTotalCount: (count: number) => void;
}

/**
 * WineList 컴포넌트
 *
 * - 무한 스크롤로 사용자 와인 목록 로딩
 * - fetch 시 스크롤 튐 방지 로직 포함
 */
export function WineList({ setTotalCount }: WineListProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [editWine, setEditWine] = useState<MyWine | null>(null);
  const [deleteWineId, setDeleteWineId] = useState<number | null>(null);

  // 무한 스크롤 쿼리
  const { data, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    {
      queryKey: ['wines'],
      queryFn: ({ pageParam = 0 }) => getMyWines({ cursor: pageParam, limit: PAGE_LIMIT }),
      initialPageParam: 0,
      getNextPageParam: (lastPage: MyWinesResponse | undefined) => lastPage?.nextCursor ?? null,
    },
  );

  // 총 와인 수 반영
  useEffect(() => {
    if (data?.pages?.[0]?.totalCount != null) {
      setTotalCount(data.pages[0].totalCount);
    }
  }, [data, setTotalCount]);

  // 옵저버로 무한 스크롤 감지
  useInfiniteScroll({
    targetRef: observerRef,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    isFetching: isFetchingNextPage,
  });

  if (isError) throw error;

  // 최신순 (ID 기준 내림차순)
  const wines: MyWine[] = data?.pages?.flatMap((page) => page?.list ?? []) ?? [];

  //  빈 목록 처리
  if (!data || !data.pages) {
    return null; // 아직 로딩 중이면 아무것도 안 보여줌
  }

  const isEmpty = data.pages[0].list.length === 0;

  if (!isFetchingNextPage && isEmpty) {
    return <MyPageEmpty type='wines' />;
  }

  return (
    <div className='flex flex-col mt-9 space-y-9 md:space-y-16 md:mt-16'>
      {wines.map((wine) => (
        <ImageCard
          key={wine.id}
          className='relative pl-24 min-h-[164px] md:min-h-[228px] md:pl-44 md:pt-10'
          imageSrc={wine.image}
          imageClassName='object-contain absolute left-3 bottom-0 h-[185px] md:h-[270px] md:left-12'
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
                  setEditWine(wine);
                } else if (value === 'delete') {
                  setDeleteWineId(wine.id);
                }
              }}
            />
          }
        >
          <div className='flex flex-col items-start justify-center h-full'>
            <h4 className='text-xl/6 font-semibold text-gray-800 mb-4 md:text-3xl md:mb-5'>
              {wine.name}
            </h4>
            <p className='custom-text-md-legular text-gray-500 mb-2 md:custom-text-lg-legular md:mb-4'>
              {wine.region}
            </p>
            <Badge variant='priceBadge'>
              <span className='inline-block w-full h-full md:pt-[3px] xl:pt-[2px]'>
                ₩ {wine.price.toLocaleString()}
              </span>
            </Badge>
          </div>
        </ImageCard>
      ))}

      {/* 수정 모달 */}
      {editWine && (
        <EditWineModal
          wine={{
            wineId: editWine.id,
            name: editWine.name,
            price: editWine.price,
            region: editWine.region,
            image: editWine.image,
            type: editWine.type as 'RED' | 'WHITE' | 'SPARKLING',
            avgRating: editWine.avgRating,
          }}
          showEditModal={true}
          setShowEditModal={(isOpen) => {
            if (!isOpen) setEditWine(null);
          }}
        />
      )}

      {/* 삭제 모달 */}
      {deleteWineId !== null && (
        <DeleteModal
          type='wine'
          id={deleteWineId}
          showDeleteModal={true}
          setShowDeleteModal={(isOpen) => {
            if (!isOpen) setDeleteWineId(null);
          }}
        />
      )}

      {/* IntersectionObserver 감지용 요소 */}
      <div ref={observerRef} className='w-full h-4' />
    </div>
  );
}
