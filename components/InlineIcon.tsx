export default function InlineIcon({
  svg,
  className = "",
}: {
  svg: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
