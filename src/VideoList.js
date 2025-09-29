// src/VideoList.js
import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export default function VideoList() {
  const [videoUrls, setVideoUrls] = useState([]);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const listRef = ref(storage, 'videos/'); // path to your videos folder
        const res = await listAll(listRef);

        const urls = await Promise.all(
          res.items.map(itemRef => getDownloadURL(itemRef))
        );

        setVideoUrls(urls);
      } catch (error) {
        console.error("Error fetching videos: ", error);
      }
    }

    fetchVideos();
  }, []);

  return (
    <div>
      <h2>Uploaded Videos</h2>
      {videoUrls.length === 0 && <p>No videos found.</p>}
      {videoUrls.map((url, index) => (
        <video
          key={index}
          src={url}
          controls
          width="600"
          style={{ marginBottom: '20px' }}
        />
      ))}
    </div>
  );
}
