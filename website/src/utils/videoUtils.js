// Import all videos
const videoContext = import.meta.glob('/Users/aarushisinha/Desktop/CP/project/SignBridge/assets/*.mp4');

export const getVideoPath = async (word) => {
  const fileName = `${word}.mp4`;
  const videoPath = `/Users/aarushisinha/Desktop/CP/project/SignBridge/assets/${fileName}`;
  
  if (videoContext[videoPath]) {
    try {
      const module = await videoContext[videoPath]();
      return module.default;
    } catch (error) {
      console.error(`Error loading video for word: ${word}`, error);
      return null;
    }
  }
  return null;
}; 