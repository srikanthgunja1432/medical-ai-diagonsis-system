'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import VideoCallRoom from './VideoCallRoom';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export default function VideoCallModal({ isOpen, onClose, appointmentId }: VideoCallModalProps) {
  const { activeCall, leaveCall } = useVideoCall();

  const handleClose = async () => {
    if (activeCall) {
      await leaveCall();
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-screen transform overflow-hidden bg-gray-900 text-left align-middle shadow-xl transition-all flex flex-col">
                {activeCall ? (
                  <VideoCallRoom call={activeCall} onLeave={handleClose} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white">
                     <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                     <p className="mt-4 text-lg">Initializing video call...</p>
                     <button
                       onClick={handleClose}
                       className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors"
                     >
                       Cancel
                     </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
