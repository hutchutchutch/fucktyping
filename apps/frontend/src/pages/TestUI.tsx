import React from 'react';
import { Button } from '@ui/button';

/**
 * Simple test page for UI components
 */
const TestUI = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">UI Components Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Buttons</h2>
          <div className="flex space-x-2">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUI;