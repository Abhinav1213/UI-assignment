import React, { useState, useRef, useEffect } from "react";
import Card from "./components/card/Card";
import { Data } from "./data.js";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from './firebase';

const App = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState([]);
  const fileInputRef = useRef(null);


  useEffect(() => {
    const fetch = JSON.parse(localStorage.getItem('urlStorage'));
    if (fetch) {
      setDownloadURL(fetch);
    }
  }, [])
  const handleDelete = (url, index) => {
    const storageRef = ref(storage, url);
    deleteObject(storageRef)
      .then(() => {
        console.log("File deleted successfully");
        localStorage.setItem('urlStorage', JSON.stringify(downloadURL.filter((_, i) => i !== index)));
        setDownloadURL((prevURLs) => prevURLs.filter((_, i) => i !== index));
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  };
  const handleChangeAndUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (!file) return;
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          const urlStorage = [...downloadURL, url];
          setDownloadURL(urlStorage);
          localStorage.setItem('urlStorage', JSON.stringify(urlStorage));
          console.log("File available at", url);
        });
      }
    );
  }
  const fireInput = () => {
    fileInputRef.current.click();
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <Card val={Data[0]} />;
      case "experiences":
        return <Card val={Data[1]} />;
      case "recommended":
        return <Card val={Data[2]} />;
      default:
        return null;
    }
  };
  return (
    <div className="flex justify-end p-4 h-screen bg-gray-100 dark:bg-gray-900">

      <div className="w-1/2 hidden lg:block"></div>

      <div className="w-full lg:w-1/2 flex flex-col space-y-4">

        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md p-4 rounded-lg">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("about")}
              className={`py-2 px-4 ${activeTab === "about" ? "border-b-2 border-blue-500 dark:border-blue-300" : ""}`}
            >
              About Me
            </button>
            <button
              onClick={() => setActiveTab("experiences")}
              className={`py-2 px-4 ${activeTab === "experiences" ? "border-b-2 border-blue-500 dark:border-blue-300" : ""}`}
            >
              Experiences
            </button>
            <button
              onClick={() => setActiveTab("recommended")}
              className={`py-2 px-4 ${activeTab === "recommended" ? "border-b-2 border-blue-500 dark:border-blue-300" : ""}`}
            >
              Recommended
            </button>
          </div>
          <div className="tab-content">{renderTabContent()}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg">Gallery</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChangeAndUpload}
              style={{ display: 'none' }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={fireInput}
            >
              Add Image
            </button>

          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {downloadURL.length === 0 ? (
              <p>No images uploaded yet.</p>
            ) : (
              <>
                {progress > 0 && progress < 100 && (
                  <div className="relative bg-gray-200 h-32 flex items-center justify-center rounded-lg shadow-md">
                    <div className="absolute inset-0 bg-gray-300 opacity-75 flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12 mb-2">
                        <svg className="w-full h-full">
                          <circle
                            className="text-gray-300"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="18"
                            cx="22"
                            cy="22"
                          />
                          <circle
                            className="text-blue-600 transition-all"
                            strokeWidth="4"
                            strokeDasharray="113"
                            strokeDashoffset={113 - (113 * progress) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="18"
                            cx="22"
                            cy="22"
                          />
                        </svg>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-400 rounded-full h-2.5 dark:bg-gray-700 absolute bottom-0">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}


                {downloadURL.map((url, index) => (
                  <div key={index} className="relative bg-white rounded-lg shadow-md h-32 flex items-center justify-center border border-gray-300">
                    <img src={url} alt={`Uploaded ${index}`} className="max-h-full max-w-full object-cover rounded-lg" />
                    <button
                      onClick={() => handleDelete(url, index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full shadow-md transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
