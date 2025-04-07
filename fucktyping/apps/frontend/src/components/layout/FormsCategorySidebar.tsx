import React from 'react';
import { useLocation } from 'wouter';
import {
  Star, 
  Users, 
  Calendar, 
  Megaphone, 
  Inbox,
  PlusCircle
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { cn } from './lib/utils';
import { CategoryWithStats } from 'shared/schema';

interface FormsCategorySidebarProps {
  categories: CategoryWithStats[];
  activeCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export const FormsCategorySidebar = ({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}: FormsCategorySidebarProps) => {
  const [, navigate] = useLocation();

  // Function to get corresponding icon for a category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'megaphone':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-64 border-r pr-4 pt-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          className="w-full justify-start border-dashed"
          onClick={() => navigate('/categories/new')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="space-y-1">
        <Button
          variant={activeCategory === null ? "secondary" : "ghost"}
          className="w-full justify-between font-normal"
          onClick={() => onSelectCategory(null)}
        >
          <div className="flex items-center">
            <Inbox className="mr-2 h-4 w-4" />
            <span>All Forms</span>
          </div>
          <Badge variant="outline">{categories.reduce((acc, cat) => acc + cat.formCount, 0)}</Badge>
        </Button>

        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "secondary" : "ghost"}
            className="w-full justify-between font-normal"
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4" style={{ color: category.color || undefined }}>
                {getCategoryIcon(category.icon || '')}
              </div>
              <span>{category.name}</span>
            </div>
            <Badge variant="outline">{category.formCount}</Badge>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FormsCategorySidebar;