'use client';

import { useUpdater } from "@/providers/UpdateProvider";


export function UpdateNotification() {
  const { isUpdateAvailable, manifest, openModal, status } = useUpdater();

  // Only show notification if an update is available and we haven't started interacting with it.
  if (!isUpdateAvailable || status !== 'IDLE') {
    return null;
  }

  return (
    <div
      className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
      onClick={openModal}
    >
      <p>
        <strong>New Update Available!</strong> Version {manifest?.version} is ready to install.
      </p>
    </div>
  );
}
