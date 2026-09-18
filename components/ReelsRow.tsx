"use client";

import { useState } from "react";
import type { InstagramReel } from "@/lib/instagram.server";

/**
 * Картите с най-новите Reels в „Последвайте ни“ — същият корпус като
 * статичните TikTok карти, но видеата се пускат на място: клик върху карта
 * стартира рийла в нея (пуска се само едно — клик върху друга карта спира
 * предишното). Надписът с профила долу вляво отваря публикацията в Instagram.
 */
export default function ReelsRow({
  reels,
  mobile,
  handle,
}: {
  reels: InstagramReel[];
  mobile: boolean;
  handle: string;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <>
      {reels.map((reel, i) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          index={i}
          mobile={mobile}
          handle={handle}
          playing={playingId === reel.id}
          onPlay={() => setPlayingId(reel.id)}
        />
      ))}
    </>
  );
}

function ReelCard({
  reel,
  index,
  mobile,
  handle,
  playing,
  onPlay,
}: {
  reel: InstagramReel;
  index: number;
  mobile: boolean;
  handle: string;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      className={`group relative shrink-0 overflow-hidden bg-black/90 transition-[translate,rotate,scale,box-shadow] duration-300 ease-out ${
        playing
          ? ""
          : `hover:-translate-y-[10px] hover:shadow-[0px_20px_40px_0px_rgba(0,0,0,0.35)] active:scale-[0.97] active:duration-100 ${
              /* съседните карти се килват в различна посока — редът изглежда разчупен */
              index % 2 === 0 ? "hover:rotate-[-1.8deg]" : "hover:rotate-[1.8deg]"
            }`
      } ${
        mobile ? "h-[485px] w-[272px] rounded-[16.167px]" : "h-[599px] w-[337px] rounded-[20px]"
      }`}
    >
      {playing ? (
        <video
          src={reel.videoUrl}
          poster={reel.thumbnailUrl || undefined}
          autoPlay
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          aria-label={`Пусни рийл ${index + 1} от Fun Park Ezero`}
          onClick={onPlay}
          className="block h-full w-full cursor-pointer text-left"
        >
          {reel.thumbnailUrl && (
            <img
              src={reel.thumbnailUrl}
              alt={reel.caption || `Reel ${index + 1} от Fun Park Ezero`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-[rgba(0,0,0,0)] to-[60%] transition-opacity duration-300 group-hover:opacity-80" />
          <span
            className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 ${
              mobile ? "top-[217px] size-[49.3px]" : "top-[269px] size-[61px]"
            }`}
          >
            <img src="/icons/play-circle.svg" alt="" className="absolute inset-0 size-full" />
            <img
              src="/icons/play-arrow.svg"
              alt=""
              className={`relative ${mobile ? "ml-[2px] h-[16px] w-[14px]" : "ml-[3px] h-[20px] w-[17.5px]"}`}
            />
          </span>
        </button>
      )}

      {/* профилът — линк към самата публикация; при пуснато видео се качва
          горе, за да не застъпва контролите на плейъра */}
      <a
        href={reel.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute z-10 flex items-center gap-[5px] ${
          playing
            ? `rounded-full bg-black/45 px-[10px] py-[4px] ${
                mobile ? "left-[14px] top-[14px]" : "left-[18px] top-[18px]"
              }`
            : mobile
              ? "bottom-[18px] left-[18px]"
              : "bottom-[22px] left-[22px]"
        }`}
      >
        <img
          src="/icons/instagram-light.svg"
          alt=""
          className={mobile ? "size-[12px]" : "size-[14px]"}
        />
        <span
          className={`font-semibold text-white ${
            mobile ? "text-[10.661px] leading-[15.992px]" : "text-[13.189px] leading-[19.784px]"
          }`}
        >
          {handle}
        </span>
      </a>
    </div>
  );
}
