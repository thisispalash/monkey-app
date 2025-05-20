import type { Ingress } from '@/lib/session';

export function getIngress(userAgent: string): Ingress {

  const isMobile = /Mobile/i.test(userAgent);

  if (isMobile) {
    return 'mobile';
  }
  
  return 'web';
}