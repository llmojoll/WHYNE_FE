import React, { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { uploadImage, updateProfile } from '@/api/user';
import Input from '@/components/common/Input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

import { ProfileImageInput } from './ProfileImageInput';

interface FormValues {
  /** 닉네임 입력 필드 */
  nickname: string;
}

/**
 * 유저의 프로필 이미지와 닉네임을 수정할 수 있는 컴포넌트
 *
 * - 프로필 이미지 업로드 및 미리보기
 * - 닉네임 변경
 * - 전역 유저 상태 업데이트
 */
export default function Profile() {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();
  /** 선택된 이미지 파일 객체 */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /** 이미지 미리보기용 URL (blob 또는 서버 이미지) */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // react-hook-form 사용
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { nickname: user?.nickname ?? '' },
    mode: 'onChange',
  });

  /**
   * 유저 정보가 바뀌면 form 초기화
   */
  useEffect(() => {
    if (user) {
      reset({ nickname: user.nickname });
    }
  }, [user, reset]);

  /**
   * 선택된 파일로부터 blob URL 생성 (미리보기용)
   * → 컴포넌트 언마운트 시 revoke
   */
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  /** 현재 닉네임 입력값 */
  const current = watch('nickname');

  /** 닉네임 변경 여부 체크 */
  const isNicknameChanged = current.trim().length > 0 && current !== user?.nickname;

  /** 이미지 변경 여부 체크 */
  const isImageChanged = selectedFile !== null;

  /** 닉네임 또는 이미지가 변경되었는지 여부 */
  const isChanged = isNicknameChanged || isImageChanged;

  /** 에러 메세지 toast */
  const onInvalid = (errors: Record<string, any>) => {
    const message = errors.nickname?.message;
    if (message) {
      toast.warning('', { description: message });
    }
  };
  /**
   * 프로필 수정 form 제출 핸들러
   *
   * @param data 닉네임 입력값
   */
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) return;

    try {
      let imageUrl = user.image;

      // 이미지 선택 시 업로드
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      // 프로필 PATCH 요청
      const updatedUser = await updateProfile({
        nickname: data.nickname,
        image: imageUrl ?? undefined,
      });

      // 전역 유저 상태 업데이트
      setUser({
        id: user.id,
        nickname: updatedUser.nickname,
        image: updatedUser.image ?? null,
        teamId: user.teamId,
        createdAt: user.createdAt,
        updatedAt: new Date().toISOString(),
      });

      // form 초기화 및 파일 제거
      reset({ nickname: updatedUser.nickname });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['nowLoginUser'] });

      toast.success('', {
        description: '프로필이 성공적으로 수정되었습니다.',
      });
    } catch (e) {
      toast.error('', {
        description: '프로필 수정 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <div className='p-5 flex flex-col gap-5 rounded-xl border bg-white xl:max-w-[280px] xl:justify-between xl:py-7 xl:h-[530px] shadow-md'>
      {/* 프로필 이미지 + 현재 닉네임 */}
      <div className='flex items-center gap-4 xl:flex-col xl:gap-8'>
        <ProfileImageInput
          imageUrl={previewUrl ?? user?.image ?? null}
          onFileSelect={(file) => setSelectedFile(file)}
        />
        <div className='custom-text-xl-bold text-gray-800 md:custom-text-2xl-bold'>
          {user?.nickname}
        </div>
      </div>

      {/* 닉네임 변경 폼 */}
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className='flex flex-col items-end gap-1.5 md:flex-row xl:flex-col'
      >
        <div className='flex flex-col w-full gap-[10px]'>
          <label
            htmlFor='nickname'
            className='custom-text-md-medium text-gray-800 md:custom-text-lg-medium'
          >
            닉네임
          </label>
          <Input
            id='nickname'
            type='text'
            variant='name'
            placeholder='새 닉네임을 입력하세요'
            {...register('nickname', {
              required: '닉네임을 입력해주세요.',
              minLength: { value: 2, message: '최소 2자 이상 입력하세요.' },
              maxLength: { value: 20, message: '최대 20자까지 가능합니다.' },
              validate: {
                noSpaces: (value) => !/\s/.test(value) || '닉네임에 공백을 포함할 수 없습니다.',
              },
            })}
          />
        </div>

        {/* 변경하기 버튼: 변경사항 없거나 제출 중이면 비활성화 */}
        <Button
          type='submit'
          variant='purpleDark'
          className='min-w-[89px] md:min-w-[116px] xl:min-w-[96px]'
          size='sm'
          fontSize='md'
          disabled={!isChanged || isSubmitting}
        >
          {isSubmitting ? '변경 중…' : '변경하기'}
        </Button>
      </form>
    </div>
  );
}
