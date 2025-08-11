import React, { useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateWine, uploadImage } from '@/api/editwine';
import BasicBottomSheet from '@/components/common/BottomSheet/BasicBottomSheet';
import SelectDropdown from '@/components/common/dropdown/SelectDropdown';
import Input from '@/components/common/Input';
import BasicModal from '@/components/common/Modal/BasicModal';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getTrimmedHandlers } from '@/lib/inputCheck';
import { getCommaNumberHandlers } from '@/lib/inputNumberCheck';
import { renameFileIfNeeded } from '@/lib/renameFile';

interface WineForm {
  wineName: string;
  winePrice: string;
  wineOrigin: string;
  wineImage: FileList;
  wineType: string;
}
interface WineData {
  wineId: number;
  name: string;
  price: number;
  region: string;
  image: string;
  type: 'RED' | 'WHITE' | 'SPARKLING';
  avgRating: number;
}

interface EditWineModalProps {
  wine: WineData;
  showEditModal: boolean;
  setShowEditModal: (state: boolean) => void;
}

const EditWineModal = ({ wine, showEditModal, setShowEditModal }: EditWineModalProps) => {
  const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  const [previewImage, setPreviewImage] = useState<string | null>(wine.image);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
    setValue,
    setError,
    trigger,
    watch,
  } = useForm<WineForm>({
    mode: 'onBlur',
    defaultValues: {
      wineName: wine.name,
      winePrice: wine.price.toLocaleString(), //쉼표 포함해서 문자열로 원래는 wine.price(number)였음
      wineOrigin: wine.region,
      wineType: wine.type,
    },
  });

  const category = watch('wineType');
  const selectedCategoryLabel = {
    RED: 'Red',
    WHITE: 'White',
    SPARKLING: 'Sparkling',
  }[category];

  const categoryOptions = [
    { label: 'Red', value: 'RED' },
    { label: 'White', value: 'WHITE' },
    { label: 'Sparkling', value: 'SPARKLING' },
  ];

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setPreviewImage(null);
        setError('wineImage', {
          type: 'manual',
          message: '지원하지 않는 이미지 형식입니다. (png, jpg, webp)',
        });
        return;
      }

      const renamedFile = renameFileIfNeeded(file);
      setPreviewImage(URL.createObjectURL(renamedFile));
    }
  };

  const updateWineMutation = useMutation({
    mutationFn: updateWine,
    onSuccess: () => {
      toast.success('', {
        description: '와인이 성공적으로 수정되었습니다.',
      });
      console.log('와인수정완료');
      queryClient.invalidateQueries({ queryKey: ['wines'] });
      reset({
        wineName: wine.name,
        winePrice: wine.price.toLocaleString(),
        wineOrigin: wine.region,
        wineType: wine.type,
      });
      setPreviewImage(wine.image);
      setShowEditModal(false);
    },
    onError: (error) => {
      toast.error('', {
        description: '와인 수정이 실패하였습니다.',
      });
      console.log('와인수정실패', error);
    },
  });

  const onSubmit = async (form: WineForm) => {
    try {
      const file = form.wineImage?.[0];

      //파일이 있을 때 확장자 검사
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('wineImage', {
          type: 'manual',
          message: '지원하지 않는 이미지 형식입니다. (png, jpg, webp)',
        });
        return; // 제출 막기
      }

      let imageUrl = wine.image;

      if (file) {
        const renamedFile = renameFileIfNeeded(file); //이미지파일 이름 정규화
        const uploaded = await uploadImage(renamedFile);
        imageUrl = uploaded + `?t=${Date.now()}`; // 캐시 방지
        setPreviewImage(imageUrl); // 이미지 갱신
      }

      const numberPrice = Number(form.winePrice.replace(/,/g, '')); //쉼표 제거 후 숫자로

      updateWineMutation.mutate({
        wineId: wine.wineId,
        name: form.wineName,
        price: numberPrice,
        region: form.wineOrigin,
        type: form.wineType.toUpperCase() as 'RED' | 'WHITE' | 'SPARKLING',
        image: imageUrl,
        avgRating: wine.avgRating,
      });
    } catch (error) {
      console.log('와인수정실패', error);
    }
  };

  const closeModalReset = (isOpen: boolean) => {
    setShowEditModal(isOpen);
    if (!isOpen) {
      reset({
        wineName: wine.name,
        winePrice: wine.price.toLocaleString(),
        wineOrigin: wine.region,
        wineType: wine.type,
      });
      setPreviewImage(wine.image);
    }
  };

  const watchedName = watch('wineName');
  const watchedPrice = watch('winePrice');
  const watchedOrigin = watch('wineOrigin');
  const watchedType = watch('wineType');
  const watchedImage = watch('wineImage');

  const isChanged =
    watchedName !== wine.name ||
    watchedPrice !== wine.price.toLocaleString() ||
    watchedOrigin !== wine.region ||
    watchedType !== wine.type ||
    watchedImage?.[0] !== undefined; // 이미지 새로 업로드되면 변경됨

  const isFormValid =
    watchedName?.trim() &&
    watchedPrice &&
    watchedOrigin?.trim() &&
    watchedType?.trim() &&
    isChanged; // 최소 하나라도 바뀐 경우에만 버튼 활성화

  const renderButton = (
    <Button
      onClick={handleSubmit(onSubmit)}
      type='submit'
      variant='purpleDark'
      size='xl'
      width='full'
      fontSize='lg'
      disabled={!isFormValid}
      className={!isFormValid ? 'cursor-not-allowed' : ''}
    >
      수정 완료
    </Button>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} encType='multipart/form-data'>
      {/* 와인 이름 */}
      <p className='custom-text-md-medium md:custom-text-lg-medium mb-[10px] md:mb-[12px] mt-[22px] md:mt-[24px]'>
        와인 이름
      </p>
      <Input
        id='wineName'
        type='text'
        variant='name'
        placeholder='와인 이름 입력'
        {...register('wineName', {
          required: '와인 이름을 입력해주세요.',
          ...getTrimmedHandlers<WineForm>('wineName', setValue, clearErrors), //정규식 검사 함수
        })}
        errorMessage={errors.wineName?.message}
        className='custom-text-md-regular md:custom-text-lg-regular'
      />

      {/* 가격 */}
      <p className='custom-text-md-medium md:custom-text-lg-medium mb-[10px] md:mb-[12px] mt-[22px] md:mt-[24px]'>
        가격
      </p>
      <Input
        className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none custom-text-md-regular md:custom-text-lg-regular'
        id='winePrice'
        type='text'
        variant='name'
        placeholder='가격 입력'
        {...register('winePrice', {
          required: '가격을 입력해 주세요.',
          pattern: {
            value: /^[1-9][0-9]{0,9}(,[0-9]{3})*$/, // 총 10자리, 1~9로 시작
            message: '숫자만 입력 가능하며, 0으로 시작할 수 없습니다.',
          },
          ...getCommaNumberHandlers<WineForm>('winePrice', setValue, clearErrors), //정규식 검사 함수
        })}
        inputMode='numeric'
        errorMessage={errors.winePrice?.message}
      />

      {/* 원산지 */}
      <p className='custom-text-md-medium md:custom-text-lg-medium mb-[10px] md:mb-[12px] mt-[22px] md:mt-[24px]'>
        원산지
      </p>
      <Input
        className='custom-text-md-regular md:custom-text-lg-regular'
        id='wineOrigin'
        type='text'
        variant='name'
        placeholder='원산지 입력'
        {...register('wineOrigin', {
          required: '원산지를 입력해주세요.',
          ...getTrimmedHandlers<WineForm>('wineOrigin', setValue, clearErrors), //정규식 검사 함수
        })}
        errorMessage={errors.wineOrigin?.message}
      />

      {/* 타입 */}
      <p className='custom-text-md-medium md:custom-text-lg-medium mb-[10px] md:mb-[12px] mt-[22px] md:mt-[24px]'>
        타입
      </p>
      <SelectDropdown
        selectedValue={category}
        options={categoryOptions}
        onChange={(value) => {
          setValue('wineType', value);
          trigger('wineType');
        }}
        placeholder='타입 선택'
        trigger={
          <button
            type='button'
            className={`w-full h-[42px] md:h-[48px] px-4 py-2 border rounded-[12px] md:rounded-[16px] text-left ${
              category ? 'text-black' : 'text-gray-500'
            }`}
          >
            <>
              <span>{selectedCategoryLabel || '타입 선택'}</span>
              {/* <DropdownIcon className='ml-2 w-4 h-4 bg-black' /> */}
            </>
          </button>
        }
      />
      {errors.wineType?.message && (
        <div className='relative'>
          <p className='text-red-500 absolute mt-1'>{errors.wineType.message}</p>
        </div>
      )}
      <Input
        id='wineType'
        type='text'
        className='custom-text-md-regular md:custom-text-lg-regular hidden'
        {...register('wineType', {
          required: '타입을 선택해주세요.',
          onChange: () => clearErrors('wineType'),
        })}
      />

      {/* 와인 사진 */}
      <p className='custom-text-md-medium md:custom-text-lg-medium mt-[24px] md:mt-[26px]'>
        와인 사진
      </p>
      <Input
        id='wineImage'
        type='file'
        accept='.png, .jpg, .jpeg, .webp'
        className='custom-text-md-regular md:custom-text-lg-regular hidden'
        {...register('wineImage', {
          onChange: (e) => {
            clearErrors('wineImage');
            handleImageChange(e);
          },
        })}
        ref={(e) => {
          register('wineImage').ref(e);
          fileInputRef.current = e;
        }}
      />
      <div className='mt-2 mb-5'>
        <div
          className='w-[140px] aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative cursor-pointer'
          onClick={triggerFileSelect}
        >
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewImage} alt='미리보기' className='w-full h-full object-cover' />
          ) : (
            <div className='flex flex-col items-center text-gray-400'>
              {/* <CameraIcon className='w-6 h-6 mb-2' /> */}
            </div>
          )}
        </div>
        {errors.wineImage?.message && (
          <div className='relative'>
            <p className='text-red-500 absolute mt-1'>{errors.wineImage.message}</p>
          </div>
        )}
      </div>
    </form>
  );

  return (
    <div>
      {isDesktop ? (
        <BasicModal
          type='register'
          title='내가 등록한 와인'
          open={showEditModal}
          onOpenChange={closeModalReset}
          buttons={renderButton}
        >
          {renderForm()}
        </BasicModal>
      ) : (
        <BasicBottomSheet
          open={showEditModal}
          onOpenChange={closeModalReset}
          title='와인 수정'
          buttons={renderButton}
        >
          {renderForm()}
        </BasicBottomSheet>
      )}
    </div>
  );
};
export default EditWineModal;
