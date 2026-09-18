import React from 'react';
import { SetupGuide } from './SetupGuide';
import { ArchitectureDiagram } from './ArchitectureDiagram';

export const GitHubGuideTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <ArchitectureDiagram />
      <SetupGuide />
    </div>
  );
};

export default GitHubGuideTab;
