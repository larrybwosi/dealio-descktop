'use client';

import { useUpdater } from '@/providers/UpdateProvider';
import ReactMarkdown from 'react-markdown';

export function UpdateModal() {
  const { isModalOpen, closeModal, manifest, status, startInstall, downloadProgress } = useUpdater();

  if (!isModalOpen) {
    return null;
  }

  const renderStatus = () => {
    switch (status) {
      case 'PENDING':
        return <p>Preparing to download...</p>;
      case 'DOWNLOADING':
        return (
          <div className="w-full">
            <p>Downloading update... {downloadProgress.toFixed(0)}%</p>
            <progress
              className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg   [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
              value={downloadProgress}
              max="100"
            />
          </div>
        );
      case 'DONE':
        return <p>Update downloaded. Relaunching application...</p>;
      case 'ERROR':
        return <p className="text-red-500">An error occurred during the update. Please try again.</p>;
      case 'IDLE':
      default:
        return (
          <button
            onClick={startInstall}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Install Update & Relaunch
          </button>
        );
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={closeModal}>
      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">New Version Available!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Version <strong>{manifest?.version}</strong> is ready for you.
        </p>

        <div className="prose prose-sm dark:prose-invert max-h-60 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <ReactMarkdown>{manifest?.notes || 'No release notes available.'}</ReactMarkdown>
        </div>

        <div className="mt-6 text-center">{renderStatus()}</div>
      </div>
    </div>
  );
}
