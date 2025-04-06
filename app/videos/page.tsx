'use client';

import VideoUpload from '@/components/VideoUpload';

export default function VideosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Farm Dashboard</h1>
      <VideoUpload
        title="Farm Videos"
        showTitle={true}
        maxFileSize={524288000} // 500MB
        allowedFileTypes={['video/mp4', 'video/webm', 'video/ogg']}
        className="mb-8"
      />
    </div>
  );
} 