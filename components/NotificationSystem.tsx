import React from 'react';
import { GlobalNotification } from '../types';
import { Bell, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationSystemProps {
  notifications: GlobalNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  const activeNotifications = notifications.filter(n => !n.isRead).slice(0, 5);

  return (
    <div className="fixed bottom-6 right-6 z-[3000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex"
          >
            <div className={`w-1.5 shrink-0 ${
              notification.type === 'stock_alert' ? 'bg-rose-500' :
              notification.type === 'purchase_update' ? 'bg-amber-500' :
              'bg-indigo-500'
            }`} />
            
            <div className="p-4 flex-1 flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notification.type === 'stock_alert' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' :
                notification.type === 'purchase_update' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'
              }`}>
                {notification.type === 'stock_alert' ? <AlertTriangle size={20} /> :
                 notification.type === 'purchase_update' ? <AlertTriangle size={20} /> :
                 <Bell size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{notification.title}</h4>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{notification.message}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{new Date(notification.date).toLocaleTimeString()}</p>
              </div>

              <button 
                onClick={() => onDismiss(notification.id)}
                className="p-1 text-slate-300 hover:text-slate-500 transition-colors self-start"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
