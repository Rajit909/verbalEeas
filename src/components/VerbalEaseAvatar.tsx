'use client';

import { cn } from '@/lib/utils';

type VerbalEaseAvatarProps = {
  isSpeaking: boolean;
  isThinking: boolean;
};

export function VerbalEaseAvatar({ isSpeaking, isThinking }: VerbalEaseAvatarProps) {
  return (
    <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/20 transition-transform duration-1000',
          (isThinking || isSpeaking) && 'animate-pulse'
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/30 transition-transform duration-1000',
          isSpeaking && 'animate-speak-outer'
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/40 transition-transform duration-1000',
          isSpeaking && 'animate-speak-inner'
        )}
      />
      <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center shadow-inner">
        <div className="w-1/2 h-1/2 bg-background/60 rounded-full shadow-lg" />
      </div>
    </div>
  );
}
