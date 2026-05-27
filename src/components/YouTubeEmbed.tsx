/**
 * Responsive 16:9 YouTube player (privacy-enhanced domain). Renders a normal
 * embedded player with controls/sound — click to play. Pass extra layout via
 * `className` (applied to the aspect-ratio wrapper).
 */
export function YouTubeEmbed({
  id,
  title = "YouTube video player",
  className,
}: {
  id: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`relative aspect-video w-full ${className ?? ""}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
