import { Inter } from "next/font/google";
import { AudioRecorder } from "react-audio-voice-recorder";
import { useState } from "react";
import { Client, Storage, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("65311885187eccf6ee74");
const storage = new Storage(client);
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [error, setError] = useState(null);
  const [option, setOption] = useState("");

  const handleRecordingComplete = async (audioBlob) => {
    setLoading(true);
    const file = new File([audioBlob], "uploaded.mp3");

    try {
      const response = await storage.createFile(
        "65311898f1994ac927ae",
        ID.unique(),
        file
      );

      const audioUrl = storage.getFileView(
        "65311898f1994ac927ae",
        response.$id
      );
      const link = audioUrl.href;
      const responseTranscript = await fetch(
        `http://127.0.0.1:8000/transcribe/?audio_url=${link}`,
        {
          method: "POST",
        }
      );
      const data = await responseTranscript.json();
      setTranscript(data.transcript);
    } catch (err) {
      console.error("Error:", err.message);
      setError("An error occurred during the transcription process.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
    setAudioSrc(URL.createObjectURL(file));
  };

  const startProcessingUpload = async () => {
    setLoading(true);
    const audioBlob = await fetch(audioSrc).then((res) => res.blob());
    const file = new File([audioBlob], "uploaded.mp3");

    try {
      const response = await storage.createFile(
        "65311898f1994ac927ae",
        ID.unique(),
        file
      );

      const audioUrl = storage.getFileView(
        "65311898f1994ac927ae",
        response.$id
      );
      const link = audioUrl.href;
      const responseTranscript = await fetch(
        `http://127.0.0.1:8000/transcribe/?audio_url=${link}`,
        {
          method: "POST",
        }
      );
      const data = await responseTranscript.json();
      setTranscript(data.transcript);
    } catch (err) {
      console.error("Error:", err.message);
      setError("An error occurred during the transcription process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
    >
      {loading ? (
        <div className="text-center p-4 border rounded-md">
          <p>Processing...</p>
        </div>
      ) : transcript ? (
        <div className="w-full max-w-lg p-4 border rounded-md">
          <h2 className="mb-4 font-bold">Transcription:</h2>
          <p>{transcript}</p>
        </div>
      ) : error ? (
        <div className="text-center p-4 bg-red-500 text-white border rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4 w-64">
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="" disabled>
                Select Option
              </option>
              <option value="record">Record Audio</option>
              <option value="upload">Upload Audio</option>
            </select>
          </div>
          {option === "record" && (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
              }}
            />
          )}
          {option === "upload" && (
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="mb-4"
              />
              {audioFile && (
                <button
                  onClick={startProcessingUpload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Start Processing
                </button>
              )}
            </div>
          )}
          {audioSrc && (
            <audio controls src={audioSrc} className="mt-4">
              Your browser does not support the audio element.
            </audio>
          )}
        </>
      )}
    </main>
  );
}
