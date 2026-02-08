"use client";

import { useEffect, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  CloudRain,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { LOFI_STREAMS } from "./constants";
import { playerManager } from "./player-manager";
import { usePlayerState } from "./use-player-state";
import { ambientManager, AMBIENT_SOUNDS } from "./ambient-manager";
import { useAmbientState } from "./use-ambient-state";

const AmbientIcon = ({ id }: { id: string }) => {
  if (id === "rain") return <CloudRain className="size-3.5" />;
  if (id === "forest") return <TreePine className="size-3.5" />;
  return null;
};

export const LofiWidget = memo(function LofiWidget() {
  const state = usePlayerState();
  const ambientState = useAmbientState();
  const customStreams = useAppStore((s) => s.customStreams);
  const ambientSettings = useAppStore((s) => s.ambientSettings);
  const updateAmbientSettings = useAppStore((s) => s.updateAmbientSettings);

  useEffect(() => {
    playerManager?.setCustomStreams(
      customStreams.map((s) => ({
        id: s.id,
        name: s.name,
        videoId: s.videoId,
      })),
    );
  }, [customStreams]);

  useEffect(() => {
    ambientManager?.init();
    ambientManager?.restoreState(ambientSettings);
  }, []);

  const allStreams = useMemo(() => {
    const builtIn = LOFI_STREAMS.map((s) => ({ ...s, isCustom: false }));
    const custom = customStreams.map((s) => ({
      id: s.videoId,
      name: s.name,
      artist: "Custom",
      gif: s.gif,
      isCustom: true,
    }));
    return [...builtIn, ...custom];
  }, [customStreams]);

  const currentStream = allStreams[state.streamIndex] || allStreams[0];

  useEffect(() => {
    playerManager?.init();
  }, []);

  const togglePlay = useCallback(() => playerManager?.togglePlay(), []);
  const toggleMute = useCallback(() => playerManager?.toggleMute(), []);
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      playerManager?.setVolume(parseInt(e.target.value));
    },
    [],
  );
  const switchPrev = useCallback(() => playerManager?.switchStream("prev"), []);
  const switchNext = useCallback(() => playerManager?.switchStream("next"), []);

  const toggleAmbientSound = useCallback(
    (id: string) => {
      ambientManager?.toggleSound(id);
      const newEnabled = { [id]: !ambientState.enabled[id] };
      updateAmbientSettings({ enabled: newEnabled });
    },
    [ambientState.enabled, updateAmbientSettings],
  );

  const handleAmbientVolumeChange = useCallback(
    (id: string, volume: number) => {
      ambientManager?.setVolume(id, volume);
      updateAmbientSettings({ volumes: { [id]: volume } });
    },
    [updateAmbientSettings],
  );

  return (
    <div className="flex gap-4 h-full items-center">
      {/* Album Art */}
      <div
        className={cn(
          "relative shrink-0 transition-transform duration-700 ease-out",
          state.isPlaying && "animate-float",
        )}
      >
        <div className="size-28 min-[1800px]:size-28 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <Image
            src={currentStream.gif}
            alt={currentStream.name}
            fill
            className="object-cover rounded-sm"
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-white/5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Track Info */}
        <div>
          <p className="font-semibold text-sm truncate tracking-tight">
            {currentStream.name}
          </p>
          <p className="text-xs text-foreground/60 truncate">
            {currentStream.artist}
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3 min-[1800px]:flex-col min-[1800px]:items-start min-[1800px]:gap-2">
          {/* Playback Controls */}
          <div className="flex items-center">
            <button
              onClick={switchPrev}
              disabled={!state.isReady}
              className="p-1.5 text-foreground/60 hover:text-foreground transition-all duration-150 disabled:opacity-30 active:scale-95"
            >
              <SkipBack className="size-4" fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!state.isReady}
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-foreground text-background shadow-lg",
                "hover:scale-105 active:scale-95",
                !state.isReady && "opacity-50 cursor-wait",
              )}
            >
              {state.isPlaying ? (
                <Pause className="size-4" fill="currentColor" />
              ) : (
                <Play className="size-4 ml-0.5" fill="currentColor" />
              )}
            </button>

            <button
              onClick={switchNext}
              disabled={!state.isReady}
              className="p-1.5 text-foreground/60 hover:text-foreground transition-all duration-150 disabled:opacity-30 active:scale-95"
            >
              <SkipForward className="size-4" fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-foreground/50 hover:text-foreground transition-all duration-150"
            >
              {state.isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={state.isMuted ? 0 : state.volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 rounded-full cursor-pointer accent-foreground"
            />
          </div>
        </div>

        {/* Ambient Chips - Compact mode */}
        <div className="flex items-center gap-2 flex-wrap min-[1800px]:hidden">
          {AMBIENT_SOUNDS.map((sound) => (
            <div key={sound.id} className="flex items-center gap-1.5">
              <button
                onClick={() => toggleAmbientSound(sound.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                  "active:scale-95",
                  ambientState.enabled[sound.id]
                    ? "bg-foreground text-background"
                    : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15",
                )}
              >
                <AmbientIcon id={sound.id} />
                <span>{sound.name}</span>
              </button>
              {ambientState.enabled[sound.id] && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientState.volumes[sound.id]}
                  onChange={(e) =>
                    handleAmbientVolumeChange(sound.id, parseInt(e.target.value))
                  }
                  className="w-12 h-1 rounded-full cursor-pointer accent-foreground"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ambient Sounds Box - Wide screens */}
      <div className="hidden min-[1800px]:flex shrink-0 flex-col gap-2 p-3 rounded-xl bg-foreground/5">
        <p className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
          Ambient
        </p>
        {AMBIENT_SOUNDS.map((sound) => (
          <div key={sound.id} className="flex items-center gap-2">
            <button
              onClick={() => toggleAmbientSound(sound.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                "active:scale-95 mr-auto",
                ambientState.enabled[sound.id]
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15",
              )}
            >
              <AmbientIcon id={sound.id} />
              <span>{sound.name}</span>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={ambientState.volumes[sound.id]}
              onChange={(e) =>
                handleAmbientVolumeChange(sound.id, parseInt(e.target.value))
              }
              className="w-16 h-1 rounded-full cursor-pointer accent-foreground"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
