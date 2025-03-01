import { useForm } from '../hooks/useForm';
import FormBuilderComponent from '../components/form-builder/FormBuilder';
import QuestionEditor from '../components/form-builder/QuestionEditor';
import Modal from '../components/common/Modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormBuilder() {
  const {
    form,
    questions,
    isLoading,
    showQuestionModal,
    currentQuestion,
    setShowQuestionModal,
    updateFormField,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleSaveQuestion,
    handleSaveForm
  } = useForm();

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FormBuilderComponent
        currentForm={form}
        questions={questions}
        updateFormField={updateFormField}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onSaveForm={handleSaveForm}
      />
      
      <Modal
        open={showQuestionModal}
        onOpenChange={setShowQuestionModal}
        title={currentQuestion ? "Edit Question" : "Add Question"}
      >
        <QuestionEditor
          question={currentQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setShowQuestionModal(false)}
        />
      </Modal>
    </div>
  );
}
