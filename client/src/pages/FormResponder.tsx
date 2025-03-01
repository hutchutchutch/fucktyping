import { useParams } from "wouter";
import Header from "@/components/layout/Header";
import VoiceInterface from "@/components/form-responder/VoiceInterface";

export default function FormResponder() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="pb-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Voice Form Responder
          </h3>
        </div>

        <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
          <VoiceInterface />
        </div>
      </div>
    </div>
  );
}
