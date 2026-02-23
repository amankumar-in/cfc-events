interface RecordingPlayerProps {
  recordingUrl: string;
  title?: string;
}

export default function RecordingPlayer({ recordingUrl, title }: RecordingPlayerProps) {
  return (
    <div className="bg-gray-900">
      {title && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-bold">{title}</h3>
        </div>
      )}
      <video
        src={recordingUrl}
        controls
        className="w-full aspect-video"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
