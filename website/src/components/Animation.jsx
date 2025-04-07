import { useState, useRef } from 'react';
import micIcon from '/assets/mic3.png';
import { getVideoPath } from '../utils/videoUtils';

const Animation = () => {
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const videoRef = useRef(null);
  const currentWordIndex = useRef(0);

  // List of common words to ignore
  const ignoreWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'and', 'or', 'but', 'nor', 'for', 'yet', 'so']);

  const record = () => {
    if (!window.webkitSpeechRecognition) {
      setVideoError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
      setVideoError('');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      setVideoError(`Speech recognition error: ${event.error}`);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      handleSubmit(transcript);
    };

    recognition.start();
  };

  const processWord = async (word) => {
    // Skip common words
    if (ignoreWords.has(word.toLowerCase())) {
      console.log(`Skipping common word: ${word}`);
      return [];
    }
    
    // Try exact word first
    const exactWord = word;
    const exactPath = await getVideoPath(exactWord);
    if (exactPath) {
      console.log(`Found video for exact word: ${exactWord}`);
      return [{ word: exactWord, path: exactPath }];
    }

    // Try capitalized word
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const capitalizedPath = await getVideoPath(capitalizedWord);
    if (capitalizedPath) {
      console.log(`Found video for capitalized word: ${capitalizedWord}`);
      return [{ word: capitalizedWord, path: capitalizedPath }];
    }

    // Try uppercase word
    const upperWord = word.toUpperCase();
    const upperPath = await getVideoPath(upperWord);
    if (upperPath) {
      console.log(`Found video for uppercase word: ${upperWord}`);
      return [{ word: upperWord, path: upperPath }];
    }

    // Try lowercase word
    const lowerWord = word.toLowerCase();
    const lowerPath = await getVideoPath(lowerWord);
    if (lowerPath) {
      console.log(`Found video for lowercase word: ${lowerWord}`);
      return [{ word: lowerWord, path: lowerPath }];
    }

    // If it's a single letter, try uppercase
    if (word.length === 1) {
      const upperLetter = word.toUpperCase();
      const letterPath = await getVideoPath(upperLetter);
      if (letterPath) {
        console.log(`Found video for letter: ${upperLetter}`);
        return [{ word: upperLetter, path: letterPath }];
      }
    }

    // If no word video exists, try individual letters as a last resort
    console.log(`No video found for word: ${word}, trying individual letters...`);
    const letters = word.split('');
    const availableLetters = [];
    
    for (const letter of letters) {
      const upperLetter = letter.toUpperCase();
      const letterPath = await getVideoPath(upperLetter);
      if (letterPath) {
        availableLetters.push({ word: upperLetter, path: letterPath });
      } else {
        console.log(`No video found for letter: ${upperLetter}`);
      }
    }
    
    if (availableLetters.length === 0) {
      console.log(`No videos found for word "${word}" or its letters`);
      setVideoError(`No sign language video available for "${word}"`);
    }
    
    return availableLetters;
  };

  const handleSubmit = async (inputText) => {
    if (!inputText.trim()) return;
    setVideoError('');
    setIsPlaying(false);
    currentWordIndex.current = 0;
    
    const words = inputText.toLowerCase().split(/\s+/).filter(word => word.trim());
    const processedWords = [];
    
    for (const word of words) {
      const result = await processWord(word);
      if (result.length > 0) {
        processedWords.push(...result);
      }
    }
    
    if (processedWords.length === 0) {
      setVideoError('No sign language videos available for any of the words');
      return;
    }
    
    setWords(processedWords);
    setCurrentWord('');
  };

  const playPause = () => {
    if (!words.length) return;

    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      currentWordIndex.current = 0;
      playNextWord();
    }
  };

  const playNextWord = async () => {
    if (currentWordIndex.current >= words.length) {
      currentWordIndex.current = 0;
      setIsPlaying(false);
      setCurrentWord('');
      return;
    }

    const wordObj = words[currentWordIndex.current];
    if (!wordObj || !videoRef.current) return;

    try {
      console.log('Loading video:', wordObj.path);
      videoRef.current.src = wordObj.path;
      videoRef.current.load();
      setCurrentWord(wordObj.word);
      
      videoRef.current.onloadeddata = () => {
        console.log('Video loaded successfully');
        videoRef.current.play()
          .then(() => {
            console.log('Video playing successfully');
            setVideoError('');
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setVideoError(`Error playing video: ${err.message}`);
            setIsPlaying(false);
          });
      };
      
      videoRef.current.onerror = (e) => {
        console.error(`Error loading video for word: ${wordObj.word}`, e.target.error);
        setVideoError(`Could not load video for: ${wordObj.word}`);
        setIsPlaying(false);
        currentWordIndex.current++;
        if (currentWordIndex.current < words.length) {
          setTimeout(playNextWord, 500);
        }
      };
    } catch (err) {
      console.error('Error setting video source:', err);
      setVideoError(`Error loading video: ${err.message}`);
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    currentWordIndex.current++;
    if (isPlaying) {
      playNextWord();
    } else {
      setCurrentWord('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card">
        <h2 className="text-2xl font-bold mb-8 relative inline-block">
          Enter Text or Use Mic
          <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></span>
        </h2>

        <div className="space-y-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-primary pr-24"
                placeholder="Speak or type here..."
              />
              <button
                onClick={record}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all duration-300
                  ${isRecording 
                    ? 'bg-accent-primary/20 border-accent-primary animate-pulse' 
                    : 'bg-bg-tertiary/80 border-white/10 hover:bg-accent-primary/10'
                  } border`}
              >
                <img 
                  src={micIcon}
                  className={`w-5 h-5 transition-transform duration-300 ${isRecording ? 'scale-110' : ''}`} 
                  alt="Microphone" 
                />
              </button>
            </div>
            <button
              onClick={() => handleSubmit(text)}
              className="btn-primary whitespace-nowrap"
            >
              Convert
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Text Input:</span>
              <p className="px-4 py-3 bg-bg-tertiary/30 rounded-lg text-text-primary min-h-[2.5rem]">
                {text || <span className="text-text-muted italic">Your text will appear here...</span>}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Words to Convert:</span>
              <div className="min-h-[3rem]">
                {words.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {words.map((wordObj, index) => (
                      <li
                        key={index}
                        className={`word-item px-4 py-2 bg-bg-tertiary/50 rounded-lg transition-all duration-300
                          hover:bg-accent-primary/10 hover:-translate-y-0.5 cursor-default
                          ${wordObj.word === currentWord ? 'active-word' : ''}`}
                      >
                        {wordObj.word}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-muted italic px-4 py-2">
                    Words will appear here after conversion...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h2 className="text-2xl font-bold mb-8 relative inline-block">
          Sign Language Animation
          <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></span>
        </h2>

        <div className="space-y-6">
          <button
            onClick={playPause}
            disabled={!words.length}
            className={`btn-primary w-full ${!words.length ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>

          <div className="relative rounded-xl overflow-hidden bg-bg-tertiary/30 aspect-video">
            {!words.length && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                Convert text to see sign language animation
              </div>
            )}
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center text-danger text-center px-4">
                {videoError}
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              preload="auto"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Video error:', e.target.error);
                console.error('Video source:', e.target.src);
              }}
              onEnded={handleVideoEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Animation; 