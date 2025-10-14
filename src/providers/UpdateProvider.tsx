'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

type UpdateStatus = 'IDLE' | 'PENDING' | 'DOWNLOADING' | 'DONE' | 'ERROR';

interface UpdaterContextType {
  isUpdateAvailable: boolean;
  status: UpdateStatus;
  downloadProgress: number; // Represents percentage
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  startInstall: () => Promise<void>;
}

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined);

export const UpdaterProvider = ({ children }: { children: ReactNode }) => {
  const [update, setUpdate] = useState<Update | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [status, setStatus] = useState<UpdateStatus>('IDLE');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // This function now handles the entire download and install process
  const startInstall = useCallback(async () => {
    if (!update) {
      console.error('Update object not available.');
      return;
    }

    setStatus('DOWNLOADING');
    try {
      let downloadedBytes = 0;
      let totalBytes = 0;

      // Use the downloadAndInstall method from the update object
      await update.downloadAndInstall(progress => {
        switch (progress.event) {
          case 'Started':
            totalBytes = progress.data.contentLength;
            console.log(`Update download started. Total size: ${totalBytes} bytes`);
            break;
          case 'Progress': {
            downloadedBytes += progress.data.chunkLength;
            const percentage = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
            setDownloadProgress(percentage);
            break;
          }
          case 'Finished':
            console.log('Download finished.');
            break;
        }
      });

      // Once downloadAndInstall is complete, the app is ready for relaunch
      setStatus('DONE');
      await relaunch();
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  }, [update]); // Dependency is the update object

  useEffect(() => {
    const runCheckUpdate = async () => {
      try {
        // `check()` returns an `Update` object or `null`
        const updateResult = await check();

        if (updateResult) {
          console.log('Update found:', updateResult.rawJson);
          setUpdate(updateResult);
          setIsUpdateAvailable(true);
        } else {
          console.log('No update available.');
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
        setStatus('ERROR');
      }
    };

    runCheckUpdate();
  }, []);

  const value = {
    isUpdateAvailable,
    status,
    downloadProgress,
    isModalOpen,
    openModal,
    closeModal,
    startInstall,
  };

  return <UpdaterContext.Provider value={value}>{children}</UpdaterContext.Provider>;
};

export const useUpdater = (): UpdaterContextType => {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error('useUpdater must be used within an UpdaterProvider');
  }
  return context;
};
