import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type ChatMessageProps = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';
    return (
        <div className={cn('flex items-start gap-3 my-4', isUser && 'justify-end')}>
            {!isUser && (
                <Avatar className="w-8 h-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/80 text-primary-foreground"><Bot size={18} /></AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                'p-3 rounded-lg max-w-sm md:max-w-md shadow-sm', 
                isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
            )}>
                <p className="text-sm leading-relaxed">{content}</p>
            </div>
            {isUser && (
                 <Avatar className="w-8 h-8 border-2 border-accent/50">
                    <AvatarFallback className="bg-accent/80 text-accent-foreground"><User size={18} /></AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
