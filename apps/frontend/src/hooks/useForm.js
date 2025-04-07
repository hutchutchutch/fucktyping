import { useState, useEffect } from 'react';
import { useFormContext } from '@context/FormContext';
import { useLocation, useParams } from 'wouter';
import { useNotification } from '@components/common/Notification';

export function useForm() {
  const { 
    currentForm, 
    questions, 
    loadForm, 
    updateFormField, 
    addQuestion, 
    removeQuestion, 
    saveForm, 
    publishForm,
    isLoading, 
    isSaving 
  } = useFormContext();
  
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [, navigate] = useLocation();
  const params = useParams();
  const notification = useNotification();

  // Load form if we're editing an existing one
  useEffect(() => {
    if (params.id) {
      loadForm(params.id);
    }
  }, [params.id]);

  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (questionId) => {
    removeQuestion(questionId);
    notification.success("Question deleted");
  };

  const handleSaveQuestion = (question) => {
    addQuestion(question);
    setShowQuestionModal(false);
  };

  const handleSaveForm = async (publish = false) => {
    try {
      if (!currentForm.title) {
        notification.error("Please provide a form title");
        return;
      }

      if (publish && questions.length === 0) {
        notification.error("Please add at least one question before publishing");
        return;
      }

      if (publish) {
        await publishForm();
        notification.success("Form published successfully");
      } else {
        await saveForm();
        notification.success("Form saved as draft");
      }

      navigate('/dashboard');
    } catch (error) {
      notification.error("Failed to save form: " + error.message);
    }
  };

  return {
    form: currentForm,
    questions,
    isLoading,
    isSaving,
    showQuestionModal,
    currentQuestion,
    setShowQuestionModal,
    setCurrentQuestion,
    updateFormField,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleSaveQuestion,
    handleSaveForm
  };
}
