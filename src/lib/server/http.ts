import type { Ingress } from '@/lib/server/session';

export function getIngress(userAgent: string): Ingress {

  const isMobile = /Mobile/i.test(userAgent);

  if (isMobile) {
    return 'mobile';
  }
  
  return 'web';
}