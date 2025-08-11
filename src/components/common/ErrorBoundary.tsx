import { Component, ErrorInfo, ReactNode } from 'react';

import { isAxiosError } from 'axios';
import { NextRouter } from 'next/router';

import ErrorModal from './Modal/ErrorModal';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  router: NextRouter;
}

interface ErrorBoundaryState {
  hasError: boolean; // 에러 발생 여부
  error: Error | null;
  isOpen: boolean;
  errorMessageToDisplay: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // 초기 상태 설정: 에러가 없다고 가정
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    isOpen: false,
    errorMessageToDisplay: '',
  };

  private handleConfirm = () => {
    const { router } = this.props;

    this.setState({ isOpen: false });

    const handleRouteComplete = () => {
      this.setState({ hasError: false, error: null, errorMessageToDisplay: '' });
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.off('routeChangeError', handleRouteComplete);
    };

    router.events.on('routeChangeComplete', handleRouteComplete);
    router.events.on('routeChangeError', handleRouteComplete);

    router.replace('/'); // 문제의 router.replace 사용
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let errorMessage = '알 수 없는 에러가 발생했습니다.';

    if (isAxiosError(error)) {
      switch (error.response?.status) {
        case 404: {
          //라우팅 경로는 맞는데 페이지 못 찾은 경우
          errorMessage = '해당 페이지를 찾을 수 없습니다.';
          break;
        }
        case 403: {
          //인가받지 못한 경우
          const apiMessage = error.response?.data?.message;
          if (apiMessage === '본인이 작성한 리뷰에는 좋아요를 할 수 없습니다.') {
            errorMessage = '본인이 작성한 리뷰에는 좋아요를 할 수 없습니다.';
          } else {
            errorMessage = '권한이 없습니다.';
          }
          break;
        }
        case 401: {
          //401
          const apiMessage = error.response?.data?.message;
          if (apiMessage === 'Unauthorized') {
            errorMessage = '로그인이 필요합니다.';
          }
          break;
        }
        case 400: {
          // wineid값에 영어가 들어간 경우
          const apiMessage = error.response?.data?.message;
          if (apiMessage === 'Validation Failed') {
            errorMessage = '잘못된 요청입니다.';
          }
          break;
        }
        default: {
          errorMessage = `${error.response?.status || ''} - ${error.response?.data?.message || error.message}`;
          break;
        }
      }
    } else {
      //엑시오스 에러가 아닌 것들
      errorMessage = `${error.message}`;
    }

    return { hasError: true, error, isOpen: true, errorMessageToDisplay: errorMessage };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    console.error('에러 바운더리에서 오류가 감지되었습니다:', error, errorInfo);

    if (onError) {
      onError(error, errorInfo);
    }
  }

  // 컴포넌트 렌더링 로직
  public render() {
    const { hasError, isOpen, errorMessageToDisplay } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <ErrorModal
          open={isOpen}
          onOpenChange={() => {
            if (!isOpen) {
              this.setState({
                isOpen: false,
                hasError: false,
                error: null,
              });
            }
          }}
          onConfirm={this.handleConfirm}
        >
          <div className='text-center custom-text-lg-bold'>{errorMessageToDisplay}</div>
        </ErrorModal>
      );
    }

    // 에러가 없다면 자식 컴포넌트들을 그대로 렌더링
    return children;
  }
}

export default ErrorBoundary;
