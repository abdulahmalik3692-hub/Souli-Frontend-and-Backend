import React, { useState, useRef, useEffect, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { 
  Heart, 
  Wind, 
  ArrowUp, 
  Mic, 
  Square, 
  CircleStop 
} from "lucide-react";
import { cn } from "../../lib/utils";

// Context & Provider
const PromptInputContext = createContext({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});

function usePromptInput() {
  const context = useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

const PromptInput = React.forwardRef(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value || "");
    const handleValueChange = (val) => {
      setLocalValue(val);
      if (onValueChange) onValueChange(val);
    };

    return (
      <Tooltip.Provider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? localValue,
            setValue: onValueChange ?? handleValueChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-2.5 shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]",
              isLoading && "border-[#7EC8C8]/30 shadow-[0_0_24px_rgba(126,200,200,0.12)]",
              className
            )}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </Tooltip.Provider>
    );
  }
);
PromptInput.displayName = "PromptInput";

// Textarea Component
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border-none bg-transparent px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
        className
      )}
      ref={ref}
      rows={1}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

// Autosizing Textarea wrapper
function PromptInputTextarea({ className, onKeyDown, disableAutosize = false, placeholder, ...props }) {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disableAutosize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        typeof maxHeight === "number"
          ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
          : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
    }
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit) onSubmit();
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base font-normal tracking-wide", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
}

// PromptInputActions container
function PromptInputActions({ children, className, ...props }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

// Tooltip Wrapper using Radix UI Tooltip
function TooltipWrapper({ tooltip, children, className, side = "top", ...props }) {
  const { disabled } = usePromptInput();
  return (
    <Tooltip.Root delayDuration={200} {...props}>
      <Tooltip.Trigger asChild disabled={disabled}>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Content
        side={side}
        className={cn(
          "z-50 overflow-hidden rounded-lg border border-[#2A5565]/12 bg-white/95 backdrop-blur-2xl px-3 py-1.5 text-xs font-medium text-[#1a2e36] shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
      >
        {tooltip}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

// Custom simple button
const PromptButton = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#2A5565] hover:bg-[#1e3f4d] text-white",
    ghost: "bg-transparent hover:bg-[#2A5565]/8 text-[#5a7a85]"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-9 w-9 rounded-full"
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
PromptButton.displayName = "PromptButton";

// Audio recording visualizer
function AudioVisualizer({ isRecording, onStartRecording, onStopRecording, visualizerBars = 40 }) {
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      if (onStartRecording) onStartRecording();
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onStopRecording) onStopRecording(timer);
      setTimer(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, onStartRecording, onStopRecording]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full transition-all duration-500 py-4",
        isRecording ? "opacity-100" : "opacity-0 h-0"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-2 w-2 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_12px_#f43f5e]" />
        <span className="font-mono text-xs tracking-widest text-[#5a7a85]">{formatTime(timer)}</span>
      </div>
      <div className="w-full max-w-[200px] h-8 flex items-center justify-center gap-[2px]">
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-white/40 animate-pulse"
            style={{
              height: `${Math.max(10, Math.random() * 100)}%`,
              animationDelay: `${i * 0.03}s`,
              animationDuration: `${0.4 + Math.random() * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Global scrollbar hiding stylesheet insertion
const globalStyles = `
  *:focus-visible {
    outline-offset: 0 !important;
    --ring-offset: 0 !important;
  }
  textarea::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerText = globalStyles;
  document.head.appendChild(styleEl);
}

// The main exported PromptInputBox component
export const PromptInputBox = React.forwardRef((props, ref) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Message Souli...", className } = props;
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [isVenting, setIsVenting] = useState(false);
  const fallbackRef = useRef(null);

  const toggleMode = (mode) => {
    if (mode === "reflect") {
      setIsReflecting((prev) => !prev);
      setIsVenting(false);
    } else if (mode === "vent") {
      setIsVenting((prev) => !prev);
      setIsReflecting(false);
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      let prefix = "";
      if (isReflecting) prefix = "[Reflect] ";
      else if (isVenting) prefix = "[Vent] ";
      
      const textToSend = prefix ? `${prefix}${value}` : value;
      onSend(textToSend, []);
      setValue("");
    }
  };

  const handleStartRecording = () => {
    console.log("Started recording");
  };

  const handleStopRecording = (duration) => {
    setIsRecording(false);
    onSend(`[Voice clip - ${duration}s]`, []);
  };

  const hasText = value.trim() !== "";

  return (
    <PromptInput
      value={value}
      onValueChange={setValue}
      isLoading={isLoading}
      onSubmit={handleSend}
      className={cn(
        "w-full max-w-[750px] mx-auto",
        isRecording && "border-[#f43f5e]/30 shadow-[0_0_40px_rgba(244,63,94,0.1)]",
        className
      )}
      disabled={isLoading || isRecording}
      ref={ref || fallbackRef}
    >
      <div className={cn("transition-all duration-500", isRecording ? "h-0 overflow-hidden opacity-0" : "opacity-100")}>
        <PromptInputTextarea
          placeholder={
            isReflecting
              ? "Reflect on your thoughts..."
              : isVenting
              ? "Let it out. I'm listening..."
              : placeholder
          }
          className="text-[15px] sm:text-base px-5 py-4"
        />
      </div>

      {isRecording && (
        <AudioVisualizer
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      )}

      <PromptInputActions className="flex items-center justify-between gap-2 px-3 pb-1 pt-2">
        <div
          className={cn(
            "flex items-center gap-1.5 transition-opacity duration-300",
            isRecording ? "opacity-0 invisible h-0" : "opacity-100 visible"
          )}
        >
          <button
            type="button"
            onClick={() => toggleMode("reflect")}
            className={cn(
              "rounded-full transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 h-8",
              isReflecting
                ? "bg-[#7EC8C8]/10 border border-[#7EC8C8]/20 text-[#7EC8C8]"
                : "bg-transparent border border-transparent text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isReflecting ? "fill-[#7EC8C8]/20" : "")} />
            <AnimatePresence>
              {isReflecting && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold tracking-wide overflow-hidden whitespace-nowrap"
                >
                  Reflect
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="w-[1px] h-3 bg-[#2A5565]/15 mx-0.5 rounded-full" />

          <button
            type="button"
            onClick={() => toggleMode("vent")}
            className={cn(
              "rounded-full transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 h-8",
              isVenting
                ? "bg-[#7B52CC]/10 border border-[#7B52CC]/20 text-[#b196f0]"
                : "bg-transparent border border-transparent text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            <Wind className="w-3.5 h-3.5" />
            <AnimatePresence>
              {isVenting && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold tracking-wide overflow-hidden whitespace-nowrap"
                >
                  Vent
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <TooltipWrapper
          tooltip={
            isLoading
              ? "Stop generation"
              : isRecording
              ? "Stop recording"
              : hasText
              ? "Send message"
              : "Voice message"
          }
        >
          <PromptButton
            variant="default"
            size="icon"
            className={cn(
              "h-[34px] w-[34px] rounded-full transition-all duration-500 ease-out",
              isRecording
                ? "bg-[#f43f5e]/10 hover:bg-[#f43f5e]/15 text-[#f43f5e]"
                : hasText
                ? "bg-[#7EC8C8] hover:bg-[#A7C4BC] text-[#050e12] shadow-[0_0_20px_rgba(126,200,200,0.3)] scale-100"
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={(w) => {
              w.preventDefault();
              if (hasText) {
                handleSend();
              } else {
                alert("Feature coming in next update");
              }
            }}
            disabled={isLoading && !hasText}
          >
            {isLoading ? (
              <Square className="h-3.5 w-3.5 fill-current animate-pulse" />
            ) : isRecording ? (
              <CircleStop className="h-4 w-4 fill-current" />
            ) : hasText ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </PromptButton>
        </TooltipWrapper>
      </PromptInputActions>
    </PromptInput>
  );
});
PromptInputBox.displayName = "PromptInputBox";
