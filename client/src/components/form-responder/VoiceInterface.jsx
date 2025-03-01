import { useState, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import AudioVisualizer from "./AudioVisualizer";
import Transcript from "./Transcript";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Pause, Play, RotateCcw } from "lucide-react";

function VoiceInterface({ 
  question, 
  onAnswer, 
  isLastQuestion = false,
  isProcessing = false, 
  detectedAnswer = null 
}) {
  const {
    isRecording,
    audioBlob,
    audioUrl,
    transcript,
    startRecording,
    stopRecording,
    resetRecording,
    togglePause,
    isPaused,
    audioData,
  } = useAudio();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleSubmitAnswer = async () => {
    if (!audioBlob || !transcript) return;
    
    setIsSubmitting(true);
    try {
      await onAnswer({
        questionId: question.id,
        value: detectedAnswer?.value || transcript,
        audioBlob,
        transcript
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset recording when question changes
  useEffect(() => {
    resetRecording();
  }, [question.id]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">{question.text}</h3>
        {question.type === 'rating' && (
          <p className="text-gray-600 text-sm">
            Please rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)
          </p>
        )}
      </div>
      
      {/* Audio Controls and Visualization */}
      <div className="mb-6">
        <div className="bg-gray-50 h-24 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
          <AudioVisualizer 
            audioData={audioData} 
            isRecording={isRecording} 
          />
          
          {/* Recording Status */}
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center">
              <span className="flex h-3 w-3 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-gray-700">Recording{isPaused ? " paused" : "..."}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <Mic className="inline-block w-4 h-4 mr-1" /> 
            {isRecording 
              ? "Tap the microphone to stop recording" 
              : "Tap the microphone to speak"}
          </div>
          
          <div className="flex space-x-3">
            <Button
              size="icon"
              variant="outline"
              onClick={resetRecording}
              disabled={!audioBlob && !isRecording}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="rounded-full"
              disabled={isProcessing || isSubmitting}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="outline"
              onClick={togglePause}
              disabled={!isRecording || isProcessing}
              className="rounded-full"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Transcript */}
      {(transcript || isProcessing) && (
        <Transcript 
          text={transcript} 
          isLoading={isProcessing && !transcript} 
        />
      )}
      
      {/* Audio Playback (if available) */}
      {audioUrl && !isRecording && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full h-10"></audio>
        </div>
      )}
      
      {/* Detected Answer Display */}
      {detectedAnswer && (
        <div className="p-6 bg-gray-50 mt-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Answer</h4>
          <div className="flex items-center space-x-2 mb-6">
            {question.type === 'rating' && (
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                {detectedAnswer.value}
              </div>
            )}
            {question.type === 'yesno' && (
              <div className={`px-3 py-1 ${
                detectedAnswer.value.toLowerCase() === 'yes' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              } rounded-full text-sm font-medium`}>
                {detectedAnswer.value}
              </div>
            )}
            {(question.type !== 'rating' && question.type !== 'yesno') && (
              <div className="text-gray-700">{detectedAnswer.value}</div>
            )}
          </div>
        </div>
      )}
      
      {transcript && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={isSubmitting || isProcessing}
          >
            {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Complete Form' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default VoiceInterface;
