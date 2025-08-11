"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from "@/hooks/use-toast"
import { useRecorder } from '@/hooks/use-recorder';
import { VerbalEaseAvatar } from '@/components/VerbalEaseAvatar';
import { ChatMessage, type ChatMessageProps } from '@/components/ChatMessage';
import { getConversationResponseAction, getPersonalizedSuggestionAction, synthesizeSpeechAction, transcribeAudioAction } from './actions';
import { cn } from '@/lib/utils';

export default function Home() {
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecorder({
    onPermissionError: () => toast({
      variant: "destructive",
      title: "Microphone permission denied",
      description: "Please allow microphone access in your browser settings.",
    }),
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const playAudio = (dataUri: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(dataUri);
    audioRef.current = audio;
    setIsSpeaking(true);
    audio.play().catch(e => {
      console.error("Error playing audio:", e);
      setIsSpeaking(false);
    });
    audio.onended = () => {
      setIsSpeaking(false);
    };
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      setIsLoading(true);
      try {
        const audioDataUri = await stopRecording();
        const { transcription } = await transcribeAudioAction({ audioDataUri });
        
        setChatHistory(prev => [...prev, { role: 'user', content: transcription }]);
        
        const currentHistory = [...chatHistory, { role: 'user', content: transcription }];
        const { response } = await getConversationResponseAction({
          userInput: transcription,
          chatHistory: currentHistory,
        });
        
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
        
        const { media } = await synthesizeSpeechAction(response);
        playAudio(media);
      } catch (error) {
        console.error("An error occurred:", error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not process your request. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      startRecording();
    }
  };
  
  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      const userHistory = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      const { suggestion } = await getPersonalizedSuggestionAction({ userHistory });
      const suggestionText = `Here's a suggestion for you: ${suggestion}`;
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: suggestionText }]);

      const { media } = await synthesizeSpeechAction(suggestionText);
      playAudio(media);

    } catch (error) {
      console.error("Suggestion error:", error);
      toast({
        variant: "destructive",
        title: "Could not get suggestion",
        description: "Please try again after a few more messages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = () => {
    if (isLoading && isRecording) return "Processing...";
    if (isLoading) return "Thinking...";
    if (isSpeaking) return "Speaking...";
    if (isRecording) return "Recording... Press button to stop";
    return "Press the mic to start talking";
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground font-body">
      <header className="p-4 border-b shrink-0 flex items-center justify-center">
        <h1 className="text-2xl font-headline font-bold">VerbalEase</h1>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <VerbalEaseAvatar isSpeaking={isSpeaking} isThinking={isLoading} />
        <p className="mt-4 h-6 text-center text-muted-foreground transition-all duration-300">
          {getStatusText()}
        </p>
      </main>

      <Collapsible className="shrink-0">
        <CollapsibleTrigger asChild>
          <div className="text-center p-2 cursor-pointer border-t hover:bg-muted">
            <Button variant="ghost">Show Conversation</Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-64 p-4 border-b bg-muted/30">
            {chatHistory.length > 0 ? (
              chatHistory.map((msg, index) => (
                <ChatMessage key={index} role={msg.role} content={msg.content} />
              ))
            ) : (
              <p className="text-center text-muted-foreground pt-8">Conversation history will appear here.</p>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      <footer className="p-4 border-t bg-background/80 backdrop-blur-sm shrink-0">
        <div className="w-full max-w-md mx-auto flex items-center justify-center space-x-4">
          <Button variant="outline" size="lg" onClick={handleGetSuggestion} disabled={isLoading || isSpeaking || isRecording || chatHistory.length === 0}>
            <Sparkles className="w-5 h-5 mr-2 text-accent" />
            Suggest
          </Button>
          <Button 
            size="icon" 
            onClick={handleRecordClick} 
            disabled={isLoading && !isRecording} 
            className={cn("w-20 h-20 rounded-full text-primary-foreground shadow-lg transform active:scale-95 transition-all duration-300", 
              isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isRecording ? <Square className="w-8 h-8"/> : <Mic className="w-8 h-8"/>}
          </Button>
        </div>
      </footer>
    </div>
  );
}
