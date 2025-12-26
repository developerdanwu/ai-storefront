import { Music, Pause, Play, Share2, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type MusicTrack = "techno" | "lofi";

const TRACKS = {
  techno: { label: "Techno", src: "/techno.mp3" },
  lofi: { label: "Lo-Fi", src: "/lofi.mp3" },
} satisfies Record<MusicTrack, { label: string; src: string }>;

interface SlideControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>("lofi");
  const wasPlayingRef = useRef(false);

  // Initialize audio on mount and attempt autoplay
  useEffect(() => {
    // Remember if audio was playing before switching
    const shouldAutoplay = wasPlayingRef.current;

    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create new audio element
    const audio = new Audio(TRACKS[currentTrack].src);
    audio.loop = true;
    audio.volume = 0.3;
    audio.autoplay = true;
    audioRef.current = audio;

    // Auto-play if music was playing before track change
    if (shouldAutoplay) {
      audio.play().catch(() => {
        // Browser may block autoplay
      });
    }

    return () => {
      audio.pause();
    };
  }, [currentTrack]);

  const isPlaying = useSyncExternalStore(
    // subscribe function
    (callback) => {
      const audio = audioRef.current;
      if (!audio) {
        return () => {};
      }

      audio.addEventListener("play", callback);
      audio.addEventListener("pause", callback);
      audio.addEventListener("ended", callback);

      return () => {
        audio.removeEventListener("play", callback);
        audio.removeEventListener("pause", callback);
        audio.removeEventListener("ended", callback);
      };
    },
    // getSnapshot function
    () => (audioRef.current ? !audioRef.current.paused : false),
    // getServerSnapshot (for SSR)
    () => false
  );

  const toggleMusic = useCallback(async () => {
    try {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (audio.paused) {
        return await audio.play().catch(() => {
          console.error("Failed to play audio");
        });
      }
      return await audio.pause();
    } catch (error) {
      console.error("Failed to toggle music", error);
      toast.error("Failed to toggle music");
    }
  }, []);

  const changeTrack = useCallback((track: MusicTrack) => {
    // Store whether music is currently playing before changing track
    wasPlayingRef.current = audioRef.current ? !audioRef.current.paused : false;
    setCurrentTrack(track);
    toast.success(`Changed music track to ${TRACKS[track].label}`);
  }, []);

  return {
    isPlaying,
    currentTrack,
    toggleMusic,
    changeTrack,
  };
}

export function SlideControls({ isPaused, onTogglePause }: SlideControlsProps) {
  const {
    isPlaying: isMusicPlaying,
    currentTrack,
    changeTrack: handleTrackChange,
    toggleMusic,
  } = useAudio();

  const handleShare = useCallback(async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My GitHub Wrapped 2025",
          text: "Check out my GitHub Wrapped 2025!",
          url: window.location.href,
        });
        return;
      } catch (e) {
        console.error("Failed to share", e);
      }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="absolute bottom-4 right-4 z-30 flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pause/Play button */}
      <button
        type="button"
        onClick={onTogglePause}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
        aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
      >
        {isPaused ? (
          <Play className="h-4 w-4 fill-current" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </button>

      {/* Share button */}
      <button
        type="button"
        onClick={handleShare}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {/* Music toggle button */}
      <button
        type="button"
        onClick={toggleMusic}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
        aria-label={isMusicPlaying ? "Mute music" : "Play music"}
      >
        {isMusicPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </button>

      {/* Music track selector dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
            aria-label="Select music track"
          >
            <Music className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8}>
          <DropdownMenuLabel>Music</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentTrack}
            onValueChange={(value) => handleTrackChange(value as MusicTrack)}
          >
            <DropdownMenuRadioItem value="techno">
              🎵 Techno
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="lofi">🎶 Lo-Fi</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
