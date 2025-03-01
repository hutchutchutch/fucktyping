import { useLocation, Link } from "wouter";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden border-t border-gray-200 bg-white fixed bottom-0 w-full z-50">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 px-2 ${isActive("/") ? "text-primary" : "text-gray-500"}`}>
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/forms">
          <a className={`flex flex-col items-center py-3 px-2 ${isActive("/forms") ? "text-primary" : "text-gray-500"}`}>
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Forms</span>
          </a>
        </Link>
        <Link href="/forms/create">
          <a className="flex flex-col items-center py-3 px-2">
            <div className="bg-primary rounded-full p-2 -mt-8 shadow-lg border-4 border-white">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs mt-1 text-primary">Create</span>
          </a>
        </Link>
        <Link href="/responses">
          <a className={`flex flex-col items-center py-3 px-2 ${isActive("/responses") ? "text-primary" : "text-gray-500"}`}>
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Responses</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex flex-col items-center py-3 px-2 ${isActive("/settings") ? "text-primary" : "text-gray-500"}`}>
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
