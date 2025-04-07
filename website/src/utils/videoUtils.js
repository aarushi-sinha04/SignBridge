// Import all videos
const videoContext = import.meta.glob('/assets/*.mp4');

export const getVideoPath = async (word) => {
  try {
    const fileName = `${word}.mp4`;
    const path = `/assets/${fileName}`;
    
    // Log the path we're trying to access
    console.log(`Looking for video at path: ${path}`);
    
    // Create a test request to check if the video exists and is accessible
    const response = await fetch(path);
    
    if (!response.ok) {
      console.error(`Video not found at path: ${path}`);
      return null;
    }

    // Check if the response is actually a video file
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('video')) {
      console.error(`File at ${path} is not a video (content-type: ${contentType})`);
      return null;
    }

    // Get the file size
    const contentLength = response.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error(`Video file at ${path} is empty`);
      return null;
    }

    console.log(`Video found at path: ${path}, size: ${contentLength} bytes, type: ${contentType}`);
    return path;
  } catch (error) {
    console.error(`Error checking video path for word "${word}":`, error);
    return null;
  }
}; 