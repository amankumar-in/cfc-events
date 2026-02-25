interface RecordingPlayerProps {
  recordingUrl: string;
  title?: string;
}

export default function RecordingPlayer({ recordingUrl, title }: RecordingPlayerProps) {
  return (
    <div className="bg-gray-900">
      {title && (
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-white font-bold">{title}</h3>
          <a
            href={recordingUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Download recording"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      )}
      {!title && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-700">
          <a
            href={recordingUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Download recording"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
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
