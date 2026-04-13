import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { InAppWaiverPopup } from './InAppWaiverPopup';
import { useLocation } from 'react-router-dom';

interface TrainingGateProps {
  user: UserProfile | null;
  children: React.ReactNode;
  onRefreshUser?: () => void;
}

export const TrainingGate = ({ user, children, onRefreshUser }: TrainingGateProps) => {
  const [showWaiver, setShowWaiver] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
       // If no user, we might want to check localStorage, but for now we prioritize DB.
       const guestAccepted = localStorage.getItem('guest_waiver_accepted');
       if (!guestAccepted) {
          setShowWaiver(true);
       }
       return;
    }

    if (user.waiver_accepted === false || user.waiver_accepted === undefined) {
      setShowWaiver(true);
    }
  }, [user, location.pathname]);

  const handleAccept = () => {
    if (!user) {
       localStorage.setItem('guest_waiver_accepted', 'true');
    }
    setShowWaiver(false);
    if (onRefreshUser) onRefreshUser();
  };

  const handleCancel = () => {
    // If they cancel, they can't access training features.
    // They are redirected back or we just let them stay but with an overlay? 
    // The requirement says "Buttons: [Continue], [Cancel]". If canceled, we go back.
    window.history.back();
  };

  return (
    <>
      {showWaiver && (
        <InAppWaiverPopup 
          user={user as any} 
          onAccept={handleAccept} 
          onCancel={handleCancel} 
        />
      )}
      {children}
    </>
  );
};
