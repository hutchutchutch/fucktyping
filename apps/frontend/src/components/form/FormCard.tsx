import React from 'react';
import { Link } from 'wouter';
import { Button } from '@ui/button';
import { MoreVertical } from 'lucide-react';

interface FormCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  responses: number;
  status: 'active' | 'draft' | 'archived';
}

const FormCard: React.FC<FormCardProps> = ({
  id,
  title,
  description,
  createdAt,
  responses,
  status
}) => {
  const statusColor = {
    active: 'text-green-600',
    draft: 'text-yellow-600',
    archived: 'text-gray-600'
  }[status];

  return (
    <div className="retro-card p-6 relative group">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <Link href={`/forms/edit/${id}`}>
        <div className="cursor-pointer">
          <h3 className="retro-subheading mb-2">{title}</h3>
          <p className="retro-text text-gray-600 mb-4">{description}</p>
          
          <div className="flex justify-between items-center mb-2">
            <div className="retro-text">
              <span className="text-gray-600">Created:</span>
              <span className="ml-2">{new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div className="retro-text">
              <span className="text-gray-600">Responses:</span>
              <span className="ml-2">{responses}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="retro-text text-gray-600">Status:</span>
            <span className={`retro-text ml-2 capitalize ${statusColor}`}>{status}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FormCard; 