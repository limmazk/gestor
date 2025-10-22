
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, CircleDollarSign, MessageSquareWarning, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Importado para classes condicionais

const iconMap = {
  pagamento: <CircleDollarSign className="w-5 h-5 text-green-500" />,
  ticket: <MessageSquareWarning className="w-5 h-5 text-yellow-500" />,
  chat: <Bell className="w-5 h-5 text-blue-500" />
};

export default function AdminCockpit({ notifications, onOpen, hasNewNotifications }) {
  const totalNotifications = notifications.length;

  return (
    <Popover onOpenChange={(isOpen) => isOpen && onOpen()}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-white/80 backdrop-blur-sm z-50 border-2 border-blue-500",
            hasNewNotifications ? "animate-bounce" : "animate-pulse-slow"
          )}
        >
          <Bell className="h-7 w-7 text-blue-600" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-6 w-6 bg-red-600 text-white text-xs font-bold">
                {totalNotifications}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 mr-4 mb-2 p-0" side="top" align="end">
        <div className="p-4 font-bold border-b bg-slate-50 rounded-t-lg">
          Central de Notificações ({totalNotifications})
        </div>
        <ScrollArea className="h-[400px]">
          {totalNotifications > 0 ? (
            notifications.map((notif) => (
              <Link to={notif.link} key={notif.id}>
                <div className="p-4 border-b hover:bg-slate-100/50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    {iconMap[notif.type]}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-sm text-slate-600">{notif.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
              <CheckCheck className="w-10 h-10 text-green-500 mb-3" />
              <p className="font-semibold">Tudo em ordem!</p>
              <p className="text-sm">Nenhuma pendência no momento.</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
