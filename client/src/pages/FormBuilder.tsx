import { useParams } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import FormBuilderComponent from "@/components/form-builder/FormBuilder";

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="pb-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {id ? "Edit Form" : "Create New Form"}
            </h3>
          </div>

          <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
            <FormBuilderComponent />
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
