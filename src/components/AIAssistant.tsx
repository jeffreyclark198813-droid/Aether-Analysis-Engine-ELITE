import React, {
  useReducer,
  useRef,
  useEffect,
  useLayoutEffect,
  useState
} from 'react';

import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  Terminal
} from 'lucide-react';

import { chatWithAether } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

/* ----------------------------- Types ----------------------------- */

interface Message {
  role: 'user' | 'model';
  text: string;
}

type State = {
  messages: Message[];
  isLoading: boolean;
};

type Action =
  | { type: 'ADD_USER'; payload: Message }
  | { type: 'ADD_MODEL'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean };

/* --------------------------- Reducer ---------------------------- */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'ADD_MODEL':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

/* --------------------------- Component -------------------------- */

const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [state, dispatch] = useReducer(reducer, {
    messages: [
      {
        role: 'model',
        text: 'Aether Intelligence online. How can I assist you today?'
      }
    ],
    isLoading: false
  });

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // request sequencing (prevents concurrent response corruption)
  const requestIdRef = useRef(0);

  /* -------------------- lifecycle safety -------------------- */

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* -------------------- auto scroll -------------------- */

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  /* -------------------- send handler -------------------- */

  const handleSend = async () => {
    if (!input.trim() || state.isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim()
    };

    setInput('');

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'ADD_USER', payload: userMessage });

    const requestId = ++requestIdRef.current;

    const history = [...state.messages, userMessage].map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await chatWithAether(history);

      // ignore stale responses
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      dispatch({
        type: 'ADD_MODEL',
        payload: { role: 'model', text: response }
      });
    } catch {
      if (!mountedRef.current) return;

      dispatch({
        type: 'ADD_MODEL',
        payload: {
          role: 'model',
          text: 'Error: Aether Core communication failure.'
        }
      });
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed right-0 top-0 h-screen bg-black border-l border-zinc-800 z-50 flex flex-col shadow-2xl',
            isExpanded ? 'w-[800px]' : 'w-[400px]'
          )}
        >
          {/* Header */}
          <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Aether Intelligence
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">
                    Neural Core Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(v => !v)}
                className="p-2 text-zinc-500 hover:text-white"
              >
                {isExpanded ? <Minimize2 /> : <Maximize2 />}
              </button>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                <X />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {state.messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-4', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-lg',
                    msg.role === 'user'
                      ? 'bg-zinc-900 text-zinc-400'
                      : 'bg-blue-600/10 text-blue-400'
                  )}
                >
                  {msg.role === 'user' ? <User /> : <Bot />}
                </div>

                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl p-4 text-sm',
                    msg.role === 'user'
                      ? 'bg-zinc-900 text-zinc-200'
                      : 'bg-zinc-900/50 border border-zinc-800 text-zinc-300'
                  )}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {state.isLoading && (
              <div className="flex gap-4">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-zinc-500 text-xs font-mono">
                  Processing...
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-zinc-800">
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm min-h-[80px] resize-none"
                placeholder="Ask Aether..."
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || state.isLoading}
                className="absolute right-3 bottom-3 p-2 bg-blue-600 rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
              <Terminal className="w-3 h-3" />
              <span>Shift + Enter for new line</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
