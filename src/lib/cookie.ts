import { ServerResponse } from 'http';

import { NextApiResponse } from 'next';

import { checkToken } from '@/api/auth';
import {
  GetClientCookieParams,
  GetCookieParams,
  GetServerCookieParams,
  GetServerCookieReturn,
} from '@/types/CookieTypes';

import { isClient } from './utils';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

type COOKIE_TYPE = 'accessToken' | 'refreshToken';

const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

// 쿠키 설정
export function setAuthCookies(
  res: NextApiResponse | ServerResponse,
  accessToken: string,
  refreshToken?: string,
) {
  const cookies = [
    `${COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}; Path=/; Max-Age=${60 * 30}; SameSite=strict; HttpOnly${secure}`,
  ];

  if (refreshToken) {
    cookies.push(
      `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=strict; HttpOnly${secure}`,
    );
  }

  res.setHeader('Set-Cookie', cookies);
}

// 쿠키 삭제
export function clearAuthCookies(res: NextApiResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookies = [
    `${COOKIE_NAMES.ACCESS_TOKEN}=; Path=/; Max-Age=0; HttpOnly${secure}`,
    `${COOKIE_NAMES.REFRESH_TOKEN}=; Path=/; Max-Age=0; HttpOnly${secure}`,
  ];
  res.setHeader('Set-Cookie', cookies);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Expires', '0');
}

export async function getCookie({ cookieHeader, name }: GetCookieParams) {
  return isClient() ? await getClientCookie({ name }) : getServerCookie({ cookieHeader, name });
}

export async function getClientCookie({ name }: GetClientCookieParams) {
  const data = await checkToken();

  const cookieMap: Record<COOKIE_TYPE, string | undefined> = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };

  return cookieMap[name as COOKIE_TYPE];
}

export function getServerCookie({
  cookieHeader,
  name,
}: GetServerCookieParams): GetServerCookieReturn {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, ...val] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(val.join('='));
    }
  }
}

export function parseCookie(cookieHeader: string) {
  return Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [key, ...v] = c.split('=');
      return [key, decodeURIComponent(v.join('='))];
    }),
  );
}
