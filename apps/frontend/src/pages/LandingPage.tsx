import React, { useState } from 'react';
import { PageLoadAnimation } from '@/components/PageLoadAnimation';
import { RetroDesktop } from '@/components/RetroDesktop';

const LandingPage = () => {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  return (
    <>
      {!isLoadingComplete ? (
        <PageLoadAnimation onComplete={() => setIsLoadingComplete(true)} />
      ) : (
        <RetroDesktop />
      )}
    </>
  );
};

export default LandingPage;
