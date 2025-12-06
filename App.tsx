import React, { useState, useEffect } from 'react';
import { GameMode } from './types';
import Navigation from './components/Navigation';
import BubbleWrap from './components/BubbleWrap';
import BreathFocus from './components/BreathFocus';
import ZenSand from './components/ZenSand';
import CosmicFlow from './components/CosmicFlow';
import VentBox from './components/VentBox';
import { resumeAudioContext } from './services/audioService';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.BUBBLE_POP);

  // Global audio unlocker
  useEffect(() => {
    const unlockAudio = () => {
      resumeAudioContext().catch(() => {});
      // We only need to do this once
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const renderContent = () => {
    switch (mode) {
      case GameMode.BUBBLE_POP:
        return <BubbleWrap />;
      case GameMode.BREATH_FOCUS:
        return <BreathFocus />;
      case GameMode.ZEN_SAND:
        return <ZenSand />;
      case GameMode.COSMIC_FLOW:
        return <CosmicFlow />;
      case GameMode.VENT_BOX:
        return <VentBox />;
      default:
        return <BubbleWrap />;
    }
  };

  return (
    <div className="h-screen w-screen bg-mind-bg text-white overflow-hidden flex flex-col font-sans">
      {/* Main Content Area */}
      <main className="flex-1 w-full relative overflow-hidden pb-16 md:pb-20">
        {renderContent()}
      </main>

      {/* Persistent Navigation */}
      <Navigation currentMode={mode} setMode={setMode} />
    </div>
  );
};

export default App;